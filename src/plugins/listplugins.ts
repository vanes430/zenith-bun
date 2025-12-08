// src/plugins/listplugins.ts
// Plugin untuk list semua plugins yang ter-load

import type { Plugin, PluginContext } from "../handler/plugin";
import { getLoadedPlugins } from "../handler/plugin";

const plugin: Plugin = {
    name: "List Plugins",
    description: "List all loaded plugins with details",
    commands: ["listplugins", "plugins"],
    enabled: true,
    ownerOnly: true,
    groupOnly: false,

    async execute(ctx: PluginContext) {
        const { sock, jid } = ctx;

        let text = `🔌 *PLUGIN LIST*\n\n`;

        const plugins = getLoadedPlugins();
        const enabled = plugins.filter(p => p.enabled);
        const disabled = plugins.filter(p => !p.enabled);

        text += `📊 *Stats:*\n`;
        text += `• Total: ${plugins.length}\n`;
        text += `• Enabled: ${enabled.length}\n`;
        text += `• Disabled: ${disabled.length}\n\n`;

        text += `✅ *Enabled Plugins:*\n`;
        enabled.forEach((p, i) => {
            const flags = [];
            if (p.ownerOnly) flags.push("👑 Owner");
            if (p.groupOnly) flags.push("👥 Group");
            if (!p.ownerOnly && !p.groupOnly) flags.push("🌐 Public");

            text += `${i + 1}. ${p.name}\n`;
            text += `   • Commands: ${p.commands?.join(", ") || "none"}\n`;
            text += `   • Type: ${flags.join(", ")}\n`;
            text += `   • Desc: ${p.description || "-"}\n\n`;
        });

        if (disabled.length > 0) {
            text += `❌ *Disabled Plugins:*\n`;
            disabled.forEach((p, i) => {
                text += `${i + 1}. ${p.name} (${p.commands?.join(", ")})\n`;
            });
        }

        await sock.sendMessage(jid, { text: text.trim() });
    },
};

export default plugin;
