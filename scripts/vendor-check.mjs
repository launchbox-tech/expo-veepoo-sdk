#!/usr/bin/env node
/**
 * Read-only drift check: compares HBandSDK upstream default-branch HEAD to
 * vendor-manifest.json pins. Prints warnings only; always exits 0.
 *
 * Usage: npm run vendor:check
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const MANIFEST_PATH = join(ROOT, "vendor-manifest.json");

function shortSha(sha) {
  return sha ? `${sha.slice(0, 12)}…` : "(none)";
}

function lsRemoteHead(gitUrl) {
  const r = spawnSync("git", ["ls-remote", gitUrl, "HEAD"], {
    encoding: "utf8",
    timeout: 60_000,
  });
  if (r.error || r.status !== 0) {
    return { ok: false, reason: r.stderr?.trim() || r.error?.message || `exit ${r.status}` };
  }
  const line = String(r.stdout || "")
    .trim()
    .split("\n")
    .find((l) => l.includes("\tHEAD"));
  if (!line) {
    return { ok: false, reason: "no HEAD line in ls-remote output" };
  }
  const sha = line.split(/\s+/)[0];
  return { ok: true, sha };
}

function main() {
  if (!existsSync(MANIFEST_PATH)) {
    console.warn("[vendor-check] WARN: vendor-manifest.json missing — nothing to check.");
    process.exit(0);
  }

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  } catch (e) {
    console.warn("[vendor-check] WARN: could not parse vendor-manifest.json:", e.message);
    process.exit(0);
  }

  const upstream = manifest.upstreamReference;
  if (!upstream) {
    console.log("[vendor-check] No upstreamReference in manifest — skipping drift check.");
    process.exit(0);
  }

  let warned = false;

  for (const key of ["androidBleSdk", "iosBleSdk"]) {
    const entry = upstream[key];
    if (!entry?.gitUrl) continue;

    const pin = entry.lastReviewedHeadSha;
    if (!pin) {
      console.warn(
        `[vendor-check] WARN: ${key} has no lastReviewedHeadSha — pin after reviewing upstream.`,
      );
      warned = true;
      continue;
    }

    const remote = lsRemoteHead(entry.gitUrl);
    if (!remote.ok) {
      console.warn(
        `[vendor-check] WARN: could not reach ${entry.gitUrl}: ${remote.reason}. Skipping ${key}.`,
      );
      warned = true;
      continue;
    }

    if (remote.sha !== pin) {
      console.warn(
        `[vendor-check] WARN: upstream moved — ${key}\n` +
          `  manifest pin: ${shortSha(pin)} (${pin})\n` +
          `  remote HEAD:  ${shortSha(remote.sha)} (${remote.sha})\n` +
          `  Review wiki: ${entry.wikiUrl || "(see vendor-manifest)"}\n` +
          `  Then bump binaries if needed, update release notes, vendor-manifest.json pins, and parity matrix.`,
      );
      warned = true;
    } else {
      console.log(`[vendor-check] OK ${key} HEAD matches manifest pin ${shortSha(pin)}`);
    }
  }

  const libsPath = join(ROOT, manifest.android?.libsRelativePath || "android/libs");
  if (manifest.android?.aarProjects?.length && existsSync(libsPath)) {
    let missing = 0;
    for (const p of manifest.android.aarProjects) {
      const fp = join(ROOT, p.aarFilePath);
      if (!existsSync(fp)) missing += 1;
    }
    if (missing > 0) {
      console.warn(
        `[vendor-check] WARN: ${missing} AAR(s) from manifest not found under ${manifest.android.libsRelativePath} (clone/LFS partial checkout?).`,
      );
      warned = true;
    }
  }

  if (!warned) {
    console.log("[vendor-check] Done — no drift warnings.");
  }
  process.exit(0);
}

main();
