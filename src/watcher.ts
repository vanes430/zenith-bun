// watcher.ts
import { spawn } from "bun";
import { setTimeout } from "timers/promises";

const RESTART_CODE = 5;
const STOP_CODE = 10;

async function startBot() {
  console.log("🚀 Menjalankan bot...\n");

  const proc = spawn({
    cmd: ["bun", "run", "index"],
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  });

  const exitCode = await proc.exited;

  return exitCode;
}

async function main() {
  while (true) {
    const code = await startBot();

    if (code === RESTART_CODE) {
      console.log("♻️ Bot meminta restart (exit code 5)");
      console.log("⏳ Menunggu 2 detik...\n");
      await setTimeout(2000);
      continue; // restart
    }

    if (code === STOP_CODE) {
      console.log("🛑 Bot meminta STOP (exit code 10)");
      console.log("❌ Watcher dihentikan.");
      break; // stop loop, watcher mati total
    }

    console.log(`⚠️ Bot keluar tidak normal (exit code ${code}). Restarting...`);
    console.log("⏳ Menunggu 2 detik...\n");
    await setTimeout(2000);
  }
}

main();
