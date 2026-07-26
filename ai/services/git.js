import simpleGit from "simple-git";

const git = simpleGit();

export async function getCurrentBranch() {
  return (await git.revparse(["--abbrev-ref", "HEAD"])).trim();
}

export async function createBranch(branchName) {
  const branches = await git.branch();

  if (branches.all.includes(branchName)) {
    await git.checkout(branchName);
    return;
  }

  await git.checkoutLocalBranch(branchName);
}

export async function stageAll() {
  await git.add(".");
}

export async function commit(message) {
  const status = await git.status();

  if (!status.files.length) {
    console.log("No changes to commit.");
    return false;
  }

  await git.commit(message);
  return true;
}

export async function push(branchName) {
  await git.push("origin", branchName, {
    "--set-upstream": null,
  });
}

export async function getLastCommit() {
  const log = await git.log({ maxCount: 1 });
  return log.latest;
}

export async function hasChanges() {
  const status = await git.status();
  return status.files.length > 0;
}

export default {
  getCurrentBranch,
  createBranch,
  stageAll,
  commit,
  push,
  getLastCommit,
  hasChanges,
};