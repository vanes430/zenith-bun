// src/lib/eval.ts
// Eval features - Shell command & JavaScript execution (Owner only)

import type { WASocket, proto } from "baileys";
import { log } from "../handler/logging";

/**
 * Execute shell command
 */
export async function executeShellCommand(
    sock: WASocket,
    msg: proto.IWebMessageInfo,
    command: string
): Promise<void> {
    const jid = msg.key?.remoteJid;
    if (!jid) return;

    log.cmd("$", command, jid);

    try {
        // Use Bun.spawn for better compatibility
        const proc = Bun.spawn(["sh", "-c", command], {
            stdout: "pipe",
            stderr: "pipe",
        });

        // Set timeout
        const timeout = setTimeout(() => {
            proc.kill();
            sock.sendMessage(jid, { text: "⏱️ Command timeout (30s)" });
        }, 30000);

        // Wait for process to complete
        const [stdout, stderr, exitCode] = await Promise.all([
            new Response(proc.stdout).text(),
            new Response(proc.stderr).text(),
            proc.exited,
        ]);

        clearTimeout(timeout);

        // Format output
        let output = `🖥️ *Shell Command*\n\n`;
        output += `📝 Command: \`${command}\`\n`;
        output += `🔢 Exit Code: ${exitCode}\n\n`;

        if (stdout) {
            output += `📤 Output:\n\`\`\`\n${stdout.slice(0, 3000)}\`\`\`\n\n`;
        }

        if (stderr) {
            output += `⚠️ Error:\n\`\`\`\n${stderr.slice(0, 1000)}\`\`\``;
        }

        if (!stdout && !stderr) {
            output += `✅ Command executed successfully (no output)`;
        }

        await sock.sendMessage(jid, { text: output.trim() });

    } catch (error) {
        await sock.sendMessage(jid, {
            text: `❌ Error: ${error instanceof Error ? error.message : error}`
        });
    }
}

/**
 * Execute JavaScript code
 */
export async function executeJavaScript(
    sock: WASocket,
    msg: proto.IWebMessageInfo,
    code: string
): Promise<void> {
    const jid = msg.key?.remoteJid;
    if (!jid) return;

    log.cmd("=>", code, jid);

    try {
        // Import config and log for eval context
        const { config } = await import("../config");
        const { log } = await import("../handler/logging");

        // Create async function to allow await
        // Wrap code in return statement if it's an expression
        const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;

        // If code doesn't have return, try to return the expression
        let wrappedCode = code;
        if (!code.trim().startsWith('return') && !code.includes(';') && !code.includes('{')) {
            wrappedCode = `return ${code}`;
        }

        const fn = new AsyncFunction("sock", "msg", "jid", "config", "log", wrappedCode);

        const result = await fn(sock, msg, jid, config, log);

        let output = `⚡ *JavaScript Eval*\n\n`;
        output += `📝 Code: \`${code}\`\n\n`;
        output += `📤 Result:\n\`\`\`\n${JSON.stringify(result, null, 2)}\`\`\``;

        await sock.sendMessage(jid, { text: output });
    } catch (error) {
        await sock.sendMessage(jid, {
            text: `❌ Error: ${error instanceof Error ? error.message : error}`
        });
    }
}
