// src/plugins/slowtest.ts
// Plugin untuk test parallel execution - Simulasi slow command

import type { Plugin, PluginContext } from "../handler/plugin";

const plugin: Plugin = {
    name: "Slow Test",
    description: "Test command dengan delay untuk verify parallel execution",
    commands: ["slowtest"],
    enabled: true,
    ownerOnly: false,
    groupOnly: false,

    async execute(ctx: PluginContext) {
        const { sock, jid, args } = ctx;

        // Parse delay dari args (default 3 detik)
        const delaySeconds = args[0] ? parseInt(args[0], 10) : 3;

        await sock.sendMessage(jid, {
            text: `⏳ Starting slow test with ${delaySeconds}s delay...\n\n` +
                `💡 Tip: Kirim command lain (e.g., .ping) sekarang!\n` +
                `Command lain akan diproses parallel tanpa tunggu command ini selesai.`
        });

        // Simulate slow operation
        await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));

        await sock.sendMessage(jid, {
            text: `✅ Slow test completed after ${delaySeconds}s!\n\n` +
                `Jika kamu kirim command lain tadi, seharusnya sudah dapat response tanpa tunggu command ini selesai.`
        });
    }
};

export default plugin;
