// src/lib/auth.ts
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  type WASocket,
} from "whaileys";
import { Boom } from "@hapi/boom";
import pino from "pino"; // Import pino logger

const SESSION_PATH = "session";
const QR_API_BASE_URL = "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=";

// Logger Configuration: Set level ke 'silent' untuk menekan log bawaan whaileys.
const customLogger = pino({ level: 'silent' }); 

/**
 * Membuat koneksi WhatsApp dan menangani login/reconnect.
 * @param reconnectHandler Callback untuk dipanggil jika reconnect diperlukan (dari index.ts).
 * @returns Promise<WASocket>
 */
export async function createWhatsAppConnection(reconnectHandler?: () => void): Promise<WASocket> {
  // 1. Ambil status otentikasi (session)
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_PATH);

  // Configuration untuk makeWASocket. Hanya properti yang diubah yang dimasukkan.
  const socketConfig = {
    auth: state,
    printQRInTerminal: false,
    logger: customLogger as any, // Terapkan logger yang sudah disenyapkan
    markOnlineOnConnect: true,
  }

  const sock = makeWASocket(socketConfig);

  // 2. Event: Simpan kredensial saat ada pembaruan
  sock.ev.on("creds.update", saveCreds);

  // 3. Event: Penanganan Koneksi & QR
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    // Menangani QR Code menggunakan API URL
    if (qr) {
      const encodedQRData = encodeURIComponent(qr); 
      const qrUrl = `${QR_API_BASE_URL}${encodedQRData}`;

      console.log("🚨 Silakan scan QR code di bawah:");
      console.log(`Buka URL ini di browser untuk melihat QR code:`);
      console.log(`🔗 ${qrUrl}`);
    }

    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;
      
      console.log(
        "💔 Koneksi terputus, menghubungkan kembali: ",
        shouldReconnect
      );

      // Menghubungkan kembali jika bukan karena logout
      if (shouldReconnect) {
        // Panggil handler dari index.ts untuk memulai restart
        if (reconnectHandler) {
            reconnectHandler(); 
        } else {
            createWhatsAppConnection(); 
        }
      }
    }
  });

  return sock;
}