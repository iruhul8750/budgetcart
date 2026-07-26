import fs from "fs-extra";
import path from "path";
import { glob } from "glob";
import simpleGit from "simple-git";
import config from "../config.js";

const git = simpleGit();

async function fileExists(filePath) {
  try {
    return await fs.pathExists(filePath);
  } catch {
    return false;
  }
}

async function getLatestFile(pattern) {
  const files = await glob(pattern, {
    absolute: true,
    nodir: true,
  });

  if (!files.length) return null;

  const stats = await Promise.all(
    files.map(async (file) => ({
      file,
      stat: await fs.stat(file),
    }))
  );

  stats.sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs);

  return stats[0].file;
}

async function getRepositoryTree() {
  const files = await glob("src/**/*.{js,ts,astro,jsx,tsx,css,html}", {
    ignore: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.git/**",
    ],
  });

  return files.slice(0, config.repair.maxContextFiles);
}

export async function collectContext() {
  await fs.ensureDir(config.output.directory);

  const status = await git.status();

  const context = {
    timestamp: new Date().toISOString(),

    git: {
      branch: await git.revparse(["--abbrev-ref", "HEAD"]),
      commit: await git.revparse(["HEAD"]),
      changedFiles: status.files.map((f) => ({
        path: f.path,
        index: f.index,
        workingTree: f.working_dir,
      })),
    },

    playwright: {
      htmlReport: await getLatestFile("playwright-report/index.html"),
      trace: await getLatestFile("test-results/**/trace.zip"),
      screenshot: await getLatestFile("test-results/**/*.{png,jpg,jpeg}"),
    },

    repository: {
      files: await getRepositoryTree(),
    },
  };

  await fs.writeJson(config.output.contextFile, context, {
    spaces: 2,
  });

  return context;
}

export default collectContext;