// src/plugins/ping.ts
// Example plugin: Ping command
// No need to import WASocket, proto, or Plugin - they're re-exported from plugin.ts

import type { Plugin, PluginContext } from "../handler/plugin";

const plugin: Plugin = {
    name: "Ping",
    description: "Test bot latency",
    commands: ["ping"],
    enabled: true,
    ownerOnly: false,
    groupOnly: false,

    async execute(ctx: PluginContext) {
        const { sock, jid } = ctx;
        const start = Date.now();

        // Send initial message
        await sock.sendMessage(jid, { text: "🏓 Testing ping..." });

        const end = Date.now();
        const latency = end - start;

        // Send result
        await sock.sendMessage(jid, {
            text: `🏓 Pong!\n\n⏱️ Latency: ${latency}ms`,
        });
    },
};

export default plugin;
