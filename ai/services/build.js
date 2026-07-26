import { spawn } from "child_process";

function runCommand(command, args = []) {
  return new Promise((resolve) => {
    console.log(`\n▶ Running: ${command} ${args.join(" ")}`);

    const process = spawn(command, args, {
      shell: true,
      stdio: "inherit",
      env: process.env,
    });

    process.on("close", (code) => {
      resolve({
        success: code === 0,
        exitCode: code,
      });
    });

    process.on("error", (error) => {
      resolve({
        success: false,
        exitCode: 1,
        error: error.message,
      });
    });
  });
}

export async function installDependencies() {
  console.log("\n📦 Installing dependencies...");

  return await runCommand("npm", ["install"]);
}

export async function buildProject() {
  console.log("\n🏗️ Building project...");

  return await runCommand("npm", ["run", "build"]);
}

export async function runPlaywright() {
  console.log("\n🎭 Running Playwright tests...");

  return await runCommand("npm", ["run", "test:e2e"]);
}

export async function verifyRepair() {
  console.log("\n==============================");
  console.log("🚀 Starting AI Verification");
  console.log("==============================");

  const install = await installDependencies();

  if (!install.success) {
    return {
      success: false,
      stage: "install",
      message: "Dependency installation failed.",
    };
  }

  const build = await buildProject();

  if (!build.success) {
    return {
      success: false,
      stage: "build",
      message: "Project build failed.",
    };
  }

  const playwright = await runPlaywright();

  if (!playwright.success) {
    return {
      success: false,
      stage: "playwright",
      message: "Playwright tests failed.",
    };
  }

  return {
    success: true,
    stage: "completed",
    message: "AI repair verified successfully.",
  };
}

export default verifyRepair;