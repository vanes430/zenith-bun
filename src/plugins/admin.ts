// src/plugins/admin.ts
// Example plugin: Admin command (owner only)

import type { Plugin, PluginContext } from "../handler/plugin";

const plugin: Plugin = {
    name: "Admin",
    description: "Admin commands (owner only)",
    commands: ["admin", "sudo"],
    enabled: true,
    ownerOnly: true,   // ✅ Auto-check owner!
    groupOnly: false,  // Works in private and group

    async execute(ctx: PluginContext) {
        const { sock, jid, sender } = ctx;

        const adminText = `
🔐 *ADMIN PANEL*

✅ Access granted for: ${sender}

Available admin commands:
• /admin - This panel
• /broadcast - Broadcast message
• /ban - Ban user
• /unban - Unban user

Status: Online ✅
    `.trim();

        await sock.sendMessage(jid, { text: adminText });
    },
};

export default plugin;
