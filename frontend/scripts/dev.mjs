import { spawn } from "node:child_process";
import path from "node:path";

const projectRoot = path.resolve(new URL(".", import.meta.url).pathname, "..");

const procs = [];
function start(cmd, args) {
  const child = spawn(cmd, args, {
    cwd: projectRoot,
    stdio: "inherit",
    shell: true,
  });
  procs.push(child);
  return child;
}

start("npm", ["run", "-s", "watch-js"]);
start("npm", ["run", "-s", "dev:css"]);

function shutdown() {
  for (const p of procs) {
    try {
      p.kill("SIGTERM");
    } catch {}
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

