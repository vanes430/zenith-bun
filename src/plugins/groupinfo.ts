// src/plugins/groupinfo.ts
// Example plugin: Group info (group only)

import type { Plugin, PluginContext } from "../handler/plugin";

const plugin: Plugin = {
    name: "Group Info",
    description: "Show group information (group only)",
    commands: ["groupinfo", "ginfo"],
    enabled: true,
    ownerOnly: false,  // Anyone can use
    groupOnly: true,  // ✅ Auto-check group!

    async execute(ctx: PluginContext) {
        const { sock, jid, isAdminGroup } = ctx;

        try {
            const groupMeta = await sock.groupMetadata(jid);

            const infoText = `
📊 *GROUP INFORMATION*

👥 Name: ${groupMeta.subject}
📝 Description: ${groupMeta.desc || "No description"}
👤 Participants: ${groupMeta.participants.length}
🔐 Admin: ${isAdminGroup ? "✅ Yes" : "❌ No"}
📅 Created: ${groupMeta.creation ? new Date(groupMeta.creation * 1000).toLocaleDateString() : "Unknown"}

Group ID: ${jid}
      `.trim();

            await sock.sendMessage(jid, { text: infoText });
        } catch (error) {
            await sock.sendMessage(jid, {
                text: "❌ Error fetching group info"
            });
        }
    },
};

export default plugin;
