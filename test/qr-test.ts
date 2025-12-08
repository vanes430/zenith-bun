// test/qr-test.ts
// Test sederhana untuk QR code Baileys

import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
} from "baileys";
import pino from "pino";

const SESSION_PATH = "test-session";

async function testQRCode() {
    console.log("🧪 Starting QR Code Test...\n");

    // 1. Setup auth state
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_PATH);

    console.log(`📋 Session registered: ${state.creds.registered}`);
    console.log(`📋 Session exists: ${!!state.creds.me}\n`);

    // 2. Create socket
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true, // Print QR di terminal
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
        const { connection, lastDisconnect, qr } = update;

        console.log("\n📡 Connection Update:");
        console.log(`   - Connection: ${connection || "undefined"}`);
        console.log(`   - Has QR: ${!!qr}`);
        console.log(`   - Last Disconnect: ${!!lastDisconnect}\n`);

        // QR Code
        if (qr) {
            console.log("🔲 QR Code received!");
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qr)}`;
            console.log(`🔗 QR URL: ${qrUrl}\n`);
        }

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
                setTimeout(() => testQRCode(), 3000);
            }
        }
    });

    // 5. Messages handler (untuk test)
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
testQRCode().catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
});
