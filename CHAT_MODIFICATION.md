# 📝 ChatModification Types Reference

Dokumentasi untuk berbagai tipe `ChatModification` yang tersedia di Baileys.

## 🔵 Mark Read

Mark pesan sebagai sudah dibaca (centang biru).

```typescript
await sock.chatModify(
  {
    markRead: true,
    lastMessages: [msg],
  },
  jid
);
```

**Kapan digunakan:**
- Auto read pesan
- Mark pesan sebagai sudah dibaca

---

## 📦 Archive

Archive atau unarchive chat.

```typescript
await sock.chatModify(
  {
    archive: true, // true = archive, false = unarchive
    lastMessages: [msg],
  },
  jid
);
```

---

## 📌 Pin

Pin atau unpin chat.

```typescript
await sock.chatModify(
  {
    pin: true, // true = pin, false = unpin
  },
  jid
);
```

---

## 🔇 Mute

Mute chat untuk durasi tertentu.

```typescript
// Mute selama 8 jam
const muteUntil = Date.now() + (8 * 60 * 60 * 1000);
await sock.chatModify(
  {
    mute: muteUntil, // timestamp
  },
  jid
);

// Unmute
await sock.chatModify(
  {
    mute: null,
  },
  jid
);
```

---

## 🧹 Clear

Clear chat history.

```typescript
await sock.chatModify(
  {
    clear: true,
    lastMessages: [msg],
  },
  jid
);
```

---

## 🗑️ Delete

Delete chat.

```typescript
await sock.chatModify(
  {
    delete: true,
    lastMessages: [msg],
  },
  jid
);
```

---

## 🗑️ Delete For Me

Delete specific message for me.

```typescript
await sock.chatModify(
  {
    deleteForMe: {
      deleteMedia: true, // juga hapus media
      key: msg.key,
      timestamp: Date.now(),
    },
  },
  jid
);
```

---

## ⭐ Star

Star atau unstar messages.

```typescript
await sock.chatModify(
  {
    star: {
      messages: [
        { id: msg.key.id!, fromMe: msg.key.fromMe },
      ],
      star: true, // true = star, false = unstar
    },
  },
  jid
);
```

---

## 👤 Push Name Setting

Update push name setting.

```typescript
await sock.chatModify(
  {
    pushNameSetting: "New Name",
  },
  jid
);
```

---

## 🏷️ Labels

Add atau remove labels dari chat.

```typescript
// Add label to chat
await sock.chatModify(
  {
    addChatLabel: {
      labelId: "label-id",
    },
  },
  jid
);

// Remove label from chat
await sock.chatModify(
  {
    removeChatLabel: {
      labelId: "label-id",
    },
  },
  jid
);
```

---

## 📋 Quick Reply

Manage quick replies.

```typescript
await sock.chatModify(
  {
    quickReply: {
      // quick reply action
    },
  },
  jid
);
```

---

## 💡 Tips

1. **lastMessages** - Selalu berisi array of `WAMessage`, biasanya pesan terakhir
2. **Error Handling** - Selalu wrap dalam try-catch
3. **JID Format** - Pastikan JID dalam format yang benar (`number@s.whatsapp.net` atau `groupid@g.us`)
4. **Permissions** - Beberapa action butuh permission khusus (misal: delete di group)

## 📚 Type Definition

```typescript
export type ChatModification =
  | { archive: boolean; lastMessages: LastMessageList }
  | { pushNameSetting: string }
  | { pin: boolean }
  | { mute: number | null }
  | { clear: boolean; lastMessages: LastMessageList }
  | { deleteForMe: { deleteMedia: boolean; key: WAMessageKey; timestamp: number } }
  | { star: { messages: { id: string; fromMe?: boolean }[]; star: boolean } }
  | { markRead: boolean; lastMessages: LastMessageList }
  | { delete: true; lastMessages: LastMessageList }
  | { contact: proto.SyncActionValue.IContactAction | null }
  | { disableLinkPreviews: proto.SyncActionValue.IPrivacySettingDisableLinkPreviewsAction }
  | { addLabel: LabelActionBody }
  | { addChatLabel: ChatLabelAssociationActionBody }
  | { removeChatLabel: ChatLabelAssociationActionBody }
  | { addMessageLabel: MessageLabelAssociationActionBody }
  | { removeMessageLabel: MessageLabelAssociationActionBody }
  | { quickReply: QuickReplyAction }
```
