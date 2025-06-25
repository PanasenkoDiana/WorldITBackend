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
import chatRouter from "./ChatApp/src/routes/chat.routes";
import chatSocket from "./ChatApp/src/sockets/chat.socket";
import { createTunnel } from "./sshTunnel";

dotenv.config();

const startServer = async () => {
	try {
		await createTunnel();

		await prismaClient.$connect();
		console.log("✅ Успешное подключение к базе данных");

		const app = express();
		const server = http.createServer(app);
		const io = new Server(server, {
			cors: {
				origin: "*",
				methods: ["GET", "POST"],
			},
		});

		const HOST = "192.168.0.114";
		const PORT = 8000;

		chatSocket(io);

		app.use(express.json({ limit: "10mb" }));
		app.use(cors());
		app.use("/media", express.static(path.join(__dirname, "../", "media")));

		app.use("/api/user", userRouter);
		app.use("/api/posts", userPostRouter);
		app.use("/api/tags", tagRouter);
		app.use("/api/friends", friendRouter);
		app.use("/api/albums", albumRouter);
		app.use("/api/chats", chatRouter);

		server.listen(PORT, HOST, () => {
			console.log(`🚀 Server running at http://${HOST}:${PORT}`);
		});
	} catch (error) {
		console.error("❌ Ошибка при запуске сервера:", error);
		process.exit(1);
	}
};

startServer().catch(console.error);

process.on("beforeExit", async () => {
	await prismaClient.$disconnect();
});
