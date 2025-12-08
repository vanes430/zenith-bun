// src/lib/owner.ts
// Owner check utilities - Global helper untuk cek owner

import type { proto } from "baileys";
import { config } from "../config";

/**
 * Get actual JID from message key
 * Handles both @lid (Linked Device) and @s.whatsapp.net formats
 * ALWAYS prioritizes remoteJidAlt (actual JID) over participant/remoteJid
 */
export function getActualJid(msg: proto.IWebMessageInfo): string {
    // Priority 1: remoteJidAlt (actual JID) - this is the REAL JID
    const actualJid = (msg.key as any)?.remoteJidAlt;
    if (actualJid) return actualJid;

    // Priority 2: participant (for group messages) or remoteJid (for DM)
    const sender = msg.key?.participant || msg.key?.remoteJid;
    return sender || "";
}

/**
 * Get sender number from JID
 */
export function getSenderNumber(jid: string): string {
    return jid?.split("@")[0] || "";
}

/**
 * Check if sender is owner
 * Works with both @lid and @s.whatsapp.net formats
 */
export function isOwner(msg: proto.IWebMessageInfo): boolean {
    const actualJid = getActualJid(msg);
    const senderNumber = getSenderNumber(actualJid);

    return (config.owner as readonly string[]).includes(senderNumber) ||
        config.ownerJid.includes(actualJid);
}

/**
 * Check if sender is owner by JID string
 */
export function isOwnerByJid(jid: string): boolean {
    const senderNumber = getSenderNumber(jid);
    return (config.owner as readonly string[]).includes(senderNumber) ||
        config.ownerJid.includes(jid);
}
