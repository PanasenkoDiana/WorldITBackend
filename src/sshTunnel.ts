import { Client } from "ssh2";
import net from "net";

export const createTunnel = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const conn = new Client();

    conn.on("ready", () => {
      conn.forwardOut(
        "127.0.0.1",
        3307,
        "worlditAcademy.mysql.pythonanywhere-services.com",
        3306,
        (err, stream) => {
          if (err) {
            reject(err);
            conn.end();
            return;
          }

          const server = net.createServer((localSocket) => {
            localSocket.pipe(stream).pipe(localSocket);
          });

          server.listen(3307, "127.0.0.1", () => {
            console.log("✅ SSH-туннель открыт на 127.0.0.1:3307");
            resolve();
          });

          server.on("error", (error) => {
            console.error("❌ Ошибка сервера туннеля:", error);
            reject(error);
          });
        }
      );
    });

    conn.on("error", (err) => {
      console.error("❌ SSH-туннель ошибка:", err);
      reject(err);
    });

    conn.connect({
      host: "ssh.pythonanywhere.com",
      port: 22,
      username: "worlditAcademy",
      password: "2025_Django",
      algorithms: {
        serverHostKey: ["ssh-rsa", "rsa-sha2-256", "rsa-sha2-512"],
      },
    });
  });
};
