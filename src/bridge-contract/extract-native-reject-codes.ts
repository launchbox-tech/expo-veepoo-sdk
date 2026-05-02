import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

const REJECT_FIRST_ARG = /\.reject\s*\(\s*"([A-Z][A-Z0-9_]*)"/g;

function walkFiles(dir: string, ext: string, out: string[]): void {
  for (const name of readdirSync(dir)) {
    if (name === "Pods" || name === "build") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkFiles(p, ext, out);
    else if (name.endsWith(ext)) out.push(p);
  }
}

/** Collect unique first-arg string codes passed to `.reject("CODE"` in native bridge sources. */
export function extractNativeRejectCodes(repoRoot: string): Set<string> {
  const files: string[] = [];
  walkFiles(
    join(repoRoot, "android/src/main/kotlin/expo/modules/veepoo"),
    ".kt",
    files,
  );
  walkFiles(join(repoRoot, "ios/VeepooSDK"), ".swift", files);

  const codes = new Set<string>();
  for (const file of files) {
    const src = readFileSync(file, "utf8");
    let m: RegExpExecArray | null;
    const re = new RegExp(REJECT_FIRST_ARG.source, "g");
    while ((m = re.exec(src)) !== null) {
      codes.add(m[1]);
    }
  }
  return codes;
}
