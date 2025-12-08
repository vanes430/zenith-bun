// test/pairing-test.ts
// Test sederhana untuk Pairing Code Baileys

import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
} from "baileys";
import pino from "pino";

const SESSION_PATH = "test-session-pairing";
const PHONE_NUMBER = "6281234567890"; // Ganti dengan nomor Anda (format E.164 tanpa +)

async function testPairingCode() {
    console.log("🧪 Starting Pairing Code Test...\n");
    console.log(`📞 Phone number: ${PHONE_NUMBER}\n`);

    // 1. Setup auth state
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_PATH);

    console.log(`📋 Session registered: ${state.creds.registered}`);
    console.log(`📋 Session exists: ${!!state.creds.me}\n`);

    // 2. Create socket
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
    });

    console.log("✅ Socket created\n");

    // 3. Save credentials
    sock.ev.on("creds.update", () => {
        console.log("💾 Credentials updated");
        saveCreds();
    });

    // 4. Connection update handler
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;

        console.log("\n📡 Connection Update:");
        console.log(`   - Connection: ${connection || "undefined"}`);
        console.log(`   - Last Disconnect: ${!!lastDisconnect}\n`);

        // Connection open
        if (connection === "open") {
            console.log("✅ Connected to WhatsApp!");
            console.log(`📱 User: ${sock.user?.name || "Unknown"}`);
            console.log(`📞 Phone: ${sock.user?.id?.split("@")[0] || "Unknown"}\n`);
        }

        // Connection close
        if (connection === "close") {
            const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

            console.log("❌ Connection closed");
            console.log(`   - Status code: ${statusCode}`);
            console.log(`   - Should reconnect: ${shouldReconnect}\n`);

            if (shouldReconnect) {
                console.log("🔄 Reconnecting...\n");
                setTimeout(() => testPairingCode(), 3000);
            }
        }
    });

    // 5. Request pairing code jika belum registered
    if (!state.creds.registered) {
        console.log("📱 Requesting pairing code...\n");

        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(PHONE_NUMBER);
                console.log("🔐 PAIRING CODE:");
                console.log(`   ╔════════════╗`);
                console.log(`   ║  ${code}  ║`);
                console.log(`   ╚════════════╝\n`);
                console.log(`📞 For phone number: ${PHONE_NUMBER}`);
                console.log(`\n⚠️  Enter this code in WhatsApp:`);
                console.log(`   Settings > Linked Devices > Link a Device`);
                console.log(`   > Link with phone number instead\n`);
            } catch (error) {
                console.error("❌ Error requesting pairing code:", error);
            }
        }, 3000);
    }

    // 6. Messages handler (untuk test)
    sock.ev.on("messages.upsert", ({ messages }) => {
        const msg = messages[0];
        if (!msg || msg.key.fromMe) return;

        const text = msg.message?.conversation || "";
        console.log(`📨 Message from ${msg.pushName}: ${text}`);
    });

    console.log("⏳ Waiting for connection events...\n");
}

// Graceful shutdown
process.on("SIGINT", () => {
    console.log("\n\n👋 Test terminated by user");
    process.exit(0);
});

// Run test
testPairingCode().catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
});
