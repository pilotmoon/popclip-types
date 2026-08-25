// Builds popclip.d.ts by concatenating the files in src/, in order, and
// filling in the version from package.json.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const { version } = JSON.parse(readFileSync("package.json", "utf8"));
// <generation>.<popclip build>.<edit>
const popclipBuild = version.split(".")[1];

const parts = readdirSync("src")
  .filter((f) => f.endsWith(".d.ts"))
  .sort()
  .map((f) =>
    readFileSync(join("src", f), "utf8")
      .replaceAll("{{VERSION}}", version)
      .replaceAll("{{POPCLIP_BUILD}}", popclipBuild),
  );

writeFileSync("popclip.d.ts", parts.join("\n"));
console.log(`popclip.d.ts ${version} (PopClip build ${popclipBuild})`);
