const { execSync, spawn } = require("node:child_process");

function handleSigterm() {
  spawn("npm", ["run", "dev:up"], {
    killSignal: "SIGINT",
    stdio: "inherit"
  });

  process.on("SIGINT", () => {
    process.stdout.write("\n🟡 → Stopping servicess ...\n");
    execSync("npm run services:stop");
    process.stdout.write("\n🔴 → Services stopped");
  });
}

handleSigterm();
