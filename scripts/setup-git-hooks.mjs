#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, lstatSync, readdirSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const hookPath = ".githooks";

function inspectGit(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function readOptionalConfig(key) {
  const result = spawnSync("git", ["config", "--get", key], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status === 1) return null;
  if (result.status !== 0) {
    throw new Error(`Could not inspect Git config ${key}: ${result.stderr.trim()}`);
  }
  return result.stdout.replace(/\r?\n$/, "");
}

if (!existsSync(path.join(root, ".git"))) {
  console.log("Skipped Git hook setup: this package is not a Git checkout root");
  process.exit(0);
}

let topLevel;
try {
  topLevel = realpathSync(inspectGit(["rev-parse", "--show-toplevel"]));
} catch (error) {
  throw new Error(`Could not inspect the Git checkout: ${error.message}`);
}

if (realpathSync(root) !== topLevel) {
  throw new Error(`Hook setup target must be the Git worktree root: ${topLevel}`);
}

const configured = readOptionalConfig("core.hooksPath");
if (configured !== null && configured !== hookPath) {
  console.log(`Skipped Git hook setup: core.hooksPath is already ${configured}`);
  process.exit(0);
}

if (!configured) {
  const hooksDirectory = path.resolve(root, inspectGit(["rev-parse", "--git-path", "hooks"]));
  const activeHooks = existsSync(hooksDirectory)
    ? readdirSync(hooksDirectory).filter((name) => {
        if (name.endsWith(".sample")) return false;
        const hookFile = path.join(hooksDirectory, name);
        const stat = lstatSync(hookFile);
        return stat.isSymbolicLink() || (stat.isFile() && (stat.mode & 0o111) !== 0);
      })
    : [];
  if (activeHooks.length) {
    console.log(`Skipped Git hook setup: default hooks are already active (${activeHooks.join(", ")})`);
    process.exit(0);
  }
  inspectGit(["config", "core.hooksPath", hookPath]);
}

console.log(`Git hooks enabled from ${hookPath}`);
