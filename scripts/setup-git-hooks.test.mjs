import { execFileSync, spawnSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, test } from "node:test";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const setupScript = path.join(repositoryRoot, "scripts", "setup-git-hooks.mjs");
const temporaryDirectories = [];

function makeTemporaryDirectory() {
  const directory = mkdtempSync(path.join(tmpdir(), "filament-tracker-hooks-"));
  temporaryDirectories.push(directory);
  return directory;
}

function git(cwd, ...args) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function addPreparedPackage(directory) {
  const scriptsDirectory = path.join(directory, "scripts");
  mkdirSync(scriptsDirectory, { recursive: true });
  copyFileSync(setupScript, path.join(scriptsDirectory, "setup-git-hooks.mjs"));
  writeFileSync(
    path.join(directory, "package.json"),
    `${JSON.stringify(
      {
        private: true,
        scripts: { prepare: "node scripts/setup-git-hooks.mjs" },
      },
      null,
      2,
    )}\n`,
  );
}

function runNpmPrepare(directory) {
  return spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "prepare", "--silent"], {
    cwd: directory,
    encoding: "utf8",
  });
}

function configuredHooksPath(directory) {
  const result = spawnSync("git", ["config", "--get", "core.hooksPath"], {
    cwd: directory,
    encoding: "utf8",
  });
  return result.status === 0 ? result.stdout.trim() : null;
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("npm prepare enables repository hooks when the checkout is clean", () => {
  const directory = makeTemporaryDirectory();
  git(directory, "init", "--quiet");
  addPreparedPackage(directory);

  const result = runNpmPrepare(directory);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Git hooks enabled from \.githooks/);
  assert.equal(configuredHooksPath(directory), ".githooks");
});

test("npm prepare skips without changing a different core.hooksPath", () => {
  const directory = makeTemporaryDirectory();
  git(directory, "init", "--quiet");
  git(directory, "config", "core.hooksPath", "custom-hooks");
  addPreparedPackage(directory);

  const result = runNpmPrepare(directory);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Skipped Git hook setup: core\.hooksPath is already custom-hooks/);
  assert.equal(configuredHooksPath(directory), "custom-hooks");
});

test("npm prepare preserves an explicitly empty core.hooksPath", () => {
  const directory = makeTemporaryDirectory();
  git(directory, "init", "--quiet");
  git(directory, "config", "core.hooksPath", "");
  addPreparedPackage(directory);

  const result = runNpmPrepare(directory);
  const configResult = spawnSync("git", ["config", "--get", "core.hooksPath"], {
    cwd: directory,
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Skipped Git hook setup: core\.hooksPath is already/);
  assert.equal(configResult.status, 0);
  assert.equal(configResult.stdout, "\n");
});

test("npm prepare skips without changing active default hooks", () => {
  const directory = makeTemporaryDirectory();
  git(directory, "init", "--quiet");
  const hookPath = path.join(directory, ".git", "hooks", "pre-push");
  mkdirSync(path.dirname(hookPath), { recursive: true });
  writeFileSync(hookPath, "#!/usr/bin/env sh\nexit 0\n");
  chmodSync(hookPath, 0o755);
  addPreparedPackage(directory);

  const result = runNpmPrepare(directory);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /default hooks are already active \(pre-push\)/);
  assert.equal(configuredHooksPath(directory), null);
});

test("npm prepare skips a package nested inside another checkout", () => {
  const parentDirectory = makeTemporaryDirectory();
  git(parentDirectory, "init", "--quiet");
  git(parentDirectory, "config", "core.hooksPath", "parent-hooks");
  const nestedDirectory = path.join(parentDirectory, "packages", "source");
  mkdirSync(nestedDirectory, { recursive: true });
  addPreparedPackage(nestedDirectory);

  const result = runNpmPrepare(nestedDirectory);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Skipped Git hook setup: this package is not a Git checkout root/);
  assert.equal(configuredHooksPath(parentDirectory), "parent-hooks");
  assert.equal(existsSync(path.join(nestedDirectory, ".githooks")), false);
});
