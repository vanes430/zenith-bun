// src/plugins/info.ts
// Example plugin: Info command
// No need to import WASocket, proto, or Plugin - they're re-exported from plugin.ts

import type { Plugin, PluginContext } from "../handler/plugin";
import { config } from "../config";

const plugin: Plugin = {
    name: "Info",
    description: "Show bot information",
    commands: ["info", "about"],
    enabled: true,
    ownerOnly: false,
    groupOnly: false,

    async execute(ctx: PluginContext) {
        const { sock, jid, isOwner, isGroup, isAdminGroup } = ctx;

        const infoText = `
📱 *${config.botName}*

ℹ️ Bot WhatsApp berbasis Baileys dengan plugin system

✨ Features:
• Hot-reloadable plugins
• Parallel command execution
• Thread-safe plugin registry
• Auto-reload on file changes

🔧 Prefix: ${config.prefix.join(", ")}

👤 Your Status:
• Owner: ${isOwner ? "✅" : "❌"}
• Group: ${isGroup ? "✅" : "❌"}
• Admin: ${isAdminGroup ? "✅" : "❌"}

Made with ❤️ using Bun & TypeScript
    `.trim();

        await sock.sendMessage(jid, { text: infoText });
    },
};

export default plugin;
