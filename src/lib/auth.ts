// src/lib/auth.ts
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  type WASocket,
} from "baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import { config } from "../config";
import { log } from "../handler/logging";

/**
 * Membuat koneksi WhatsApp dan menangani login/reconnect.
 * @param reconnectHandler Callback untuk dipanggil jika reconnect diperlukan (dari index.ts).
 * @param onConnectionOpen Callback untuk dipanggil saat connection open.
 * @returns Promise<WASocket>
 */
export async function createWhatsAppConnection(
  reconnectHandler?: () => void,
  onConnectionOpen?: (sock: WASocket) => void
): Promise<WASocket> {
  // 1. Ambil status otentikasi (session)
  const { state, saveCreds } = await useMultiFileAuthState(config.sessionPath);

  log.debug(`Session registered: ${state.creds.registered}`);

  // 2. Configuration untuk makeWASocket
  const socketConfig = {
    auth: state,
    // ✅ IMPORTANT: Disable QR printing when using pairing mode
    printQRInTerminal: config.usePairing ? false : config.printQRInTerminal,
    logger: pino({ level: config.logLevel }) as any,
    markOnlineOnConnect: config.markOnlineOnConnect,
    syncFullHistory: false,
    defaultQueryTimeoutMs: undefined,
    getMessage: async () => undefined,
  }

  const sock = makeWASocket(socketConfig);

  // Event: Simpan kredensial saat ada pembaruan
  sock.ev.on("creds.update", saveCreds);

  // Event: Penanganan Koneksi & QR/Pairing Code
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    log.debug(`Connection update: ${JSON.stringify({ connection, hasQR: !!qr })}`);

    // Log connection status
    if (connection) {
      log.connection(connection);
    }

    // Handle QR Code (ONLY if NOT using pairing mode)
    if (qr && !config.usePairing) {
      const encodedQRData = encodeURIComponent(qr);
      const qrUrl = `${config.qrApiUrl}${encodedQRData}`;
      log.qr(qrUrl);
    }

    // Handle connection open
    if (connection === "open") {
      log.success("Koneksi WhatsApp berhasil!");
      if (onConnectionOpen) {
        onConnectionOpen(sock);
      }
    }

    // Handle connection close
    if (connection === "close") {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      log.connection("close", `Status: ${statusCode}, Reconnect: ${shouldReconnect}`);

      // Log disconnect reason for debugging
      if (lastDisconnect?.error) {
        log.debug(`Disconnect reason: ${JSON.stringify(lastDisconnect.error, null, 2)}`);
      }

      // Menghubungkan kembali jika bukan karena logout
      if (shouldReconnect) {
        // Add delay before reconnect to prevent rapid reconnection loop
        setTimeout(() => {
          // Panggil handler dari index.ts untuk memulai restart
          if (reconnectHandler) {
            reconnectHandler();
          } else {
            createWhatsAppConnection();
          }
        }, 3000); // Wait 3 seconds before reconnecting
      }
    }
  });

  // Request pairing code jika menggunakan mode pairing dan belum registered
  if (config.usePairing && !state.creds.registered) {
    log.info("Requesting pairing code...");
    // Tunggu sebentar untuk socket siap
    setTimeout(async () => {
      try {
        // The phone number MUST be in E.164 format without a plus sign
        const code = await sock.requestPairingCode(config.phoneNumber);
        log.pairing(code, config.phoneNumber);
      } catch (error) {
        log.error(error instanceof Error ? error : "Error requesting pairing code");
      }
    }, 1000); // Tunggu 1 detik untuk socket siap (reduced from 3s)
  }

  return sock;
}