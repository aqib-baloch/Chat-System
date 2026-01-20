import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const projectRoot = path.resolve(new URL(".", import.meta.url).pathname, "..");
const srcDir = path.join(projectRoot, "src");

function runBuildJs() {
  const child = spawn("npm", ["run", "-s", "build-js"], {
    cwd: projectRoot,
    stdio: "inherit",
    shell: true,
  });
  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`watch-js: build-js exited with code ${code}`);
    }
  });
}

let timer = null;
function scheduleSync() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    runBuildJs();
  }, 150);
}

console.log("watch-js: syncing frontend/src -> frontend/public/assets/js");
runBuildJs();

try {
  fs.watch(srcDir, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    if (!filename.endsWith(".js")) return;
    scheduleSync();
  });
} catch (e) {
  console.error("watch-js: fs.watch recursive not supported here. Run `npm run build-js` manually after changes.");
  console.error(e?.message || e);
}

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

