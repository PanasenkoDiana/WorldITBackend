import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { Server } from "socket.io";
import { prismaClient } from "./prisma/client";

import userRouter from "./UserApp/user.router";
import userPostRouter from "./UserPostApp/userPost.router";
import tagRouter from "./TagApp/tag.router";
import albumRouter from "./AlbumApp/album.router";
import friendRouter from "./FriendApp/friend.router";
import { createChatRouter } from "./ChatApp/src/routes/chat.routes";
import chatSocket from "./ChatApp/src/sockets/chat.socket";
import { createTunnel } from "./sshTunnel";

dotenv.config();

const HOST = "0.0.0.0";
const PORT = process.env.PORT || 3003;

const startServer = async () => {
	try {
		const { conn, server } = await createTunnel();

		await prismaClient.$connect();
		console.log("✅ Успешное подключение к базе данных");

		const app = express();
		const httpServer = http.createServer(app);
		const io = new Server(httpServer, {
			cors: {
				origin: "*",
				methods: ["GET", "POST"],
			},
		});

		chatSocket(io);

		app.use(express.json({ limit: "10mb" }));
		app.use(cors());
		app.use("/media", express.static(path.join(__dirname, "../", "media")));

		app.use("/api/user", userRouter);
		app.use("/api/posts", userPostRouter);
		app.use("/api/tags", tagRouter);
		app.use("/api/friends", friendRouter);
		app.use("/api/albums", albumRouter);
		app.use("/api/chats", createChatRouter(io));

		httpServer.listen(PORT, Number(HOST), () => {
			console.log(`🚀 Server running at http://${HOST}:${PORT}`);
		});
		const closeTunnel = () => {
			console.log("🔌 Closing SSH tunnel and DB connection");
			server.close();
			conn.end();
			prismaClient.$disconnect();
		};

		process.on("exit", closeTunnel);
		process.on("SIGINT", () => {
			closeTunnel();
			process.exit();
		});
		process.on("SIGTERM", () => {
			closeTunnel();
			process.exit();
		});
	} catch (error) {
		console.error("❌ Ошибка при запуске сервера:", error);
		process.exit(1);
	}
};

startServer().catch(console.error);
