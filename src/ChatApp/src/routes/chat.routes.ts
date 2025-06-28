import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authTokenMiddleware } from "../../../middlewares/authMiddlewares";
import { Server } from "socket.io";

export const createChatRouter = (io: Server) => {
	const router = Router();
	const chatController = new ChatController(io);

	router.post("/messages", authenticate, chatController.sendMessage);
	router.get(
		"/messages/:chatId",
		authenticate,
		chatController.getChatHistory
	);
	router.post(
		"/get-or-create-group",
		authenticate,
		chatController.getOrCreateChatGroup
	);
	router.get("/all", authTokenMiddleware, chatController.getAllChats);
	router.post("/create-group", authenticate, chatController.createGroup);

	return router;
};
