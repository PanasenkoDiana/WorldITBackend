import { prismaClient } from "../../../prisma/client";
import { Request, Response } from "express";
import { base64ToImage } from "../../../tools/base64ToImage";
import { CreateGroup } from "../types";

export class ChatController {
	public sendMessage = async (req: Request, res: Response): Promise<void> => {
		try {
			const { content, chatGroupId } = req.body;
			const authorId = req.user?.id;

			if (!content || !chatGroupId || !authorId) {
				res.status(400).json({ error: "Missing required fields" });
				return;
			}

			const chatGroup = await prismaClient.chatGroup.findFirst({
				where: {
					id: parseInt(chatGroupId),
					members: {
						some: {
							id: parseInt(authorId),
						},
					},
				},
			});

			if (!chatGroup) {
				res.status(404).json({
					error: "Chat group not found or access denied",
				});
				return;
			}

			const message = await prismaClient.chatMessage.create({
				data: {
					content,
					authorId: parseInt(authorId),
					chatGroupId: parseInt(chatGroupId),
				},
				include: {
					author: true,
					chat_group: true,
				},
			});

			res.status(201).json(message);
		} catch (error) {
			console.error("Error sending message:", error);
			res.status(500).json({
				error: "Failed to send message",
				details:
					error instanceof Error ? error.message : "Unknown error",
			});
		}
	};

	public getOrCreateChatGroup = async (
		req: Request,
		res: Response
	): Promise<void> => {
		try {
			const { recipientUsername } = req.body;
			const currentUserId = req.user?.id;

			if (!recipientUsername || !currentUserId) {
				res.status(400).json({
					error: "Missing recipient username or user not authenticated",
				});
				return;
			}

			const recipient = await prismaClient.user.findUnique({
				where: { username: recipientUsername },
			});

			if (!recipient) {
				res.status(404).json({ error: "Recipient user not found" });
				return;
			}

			// Найти существующую группу, в которой только эти двое
			let chatGroup = await prismaClient.chatGroup.findFirst({
				where: {
					AND: [
						{ members: { some: { id: currentUserId } } },
						{ members: { some: { id: recipient.id } } },
						{
							members: {
								every: {
									id: { in: [currentUserId, recipient.id] },
								},
							},
						},
					],
				},
			});

			if (!chatGroup) {
				chatGroup = await prismaClient.chatGroup.create({
					data: {
						name: `chat-${Date.now()}`,
						admin: { connect: { id: currentUserId } },
						is_personal_chat: true,
						members: {
							connect: [
								{ id: currentUserId },
								{ id: recipient.id },
							],
						},
					},
				});
			}

			res.json({ chatGroupId: chatGroup.id });
		} catch (error) {
			console.error("Error in getOrCreateChatGroup:", error);
			res.status(500).json({
				error: "Failed to get or create chat group",
				details: error instanceof Error ? error.message : String(error),
			});
		}
	};

	public getChatHistory = async (
		req: Request,
		res: Response
	): Promise<void> => {
		try {
			const { chatId } = req.params;
			const messages = await prismaClient.chatMessage.findMany({
				where: {
					chatGroupId: parseInt(chatId),
				},
				include: {
					author: true,
				},
				orderBy: {
					sent_at: "asc",
				},
			});

			res.json(messages);
		} catch (error) {
			res.status(500).json({ error: "Failed to fetch messages" });
		}
	};

	public getAllChats = async (req: Request, res: Response) => {
		try {
			const userId = res.locals.userId;

			const chats = await prismaClient.chatGroup.findMany({
				where: {
					members: {
						some: {
							id: +userId,
						},
					},
					is_personal_chat: false,
				},

				include: {
					members: {
						include: {
							Profile: {
								include: {
									avatars: {
										include: {
											image: true,
										},
									},
								},
							},
						},
					},
					messages: true,
				},
			});

			res.json(chats);
		} catch (error) {
			// console.log(error)
			res.status(500).json({ error: "Failed to fetch chats" });
		}
	};

	public createGroup = async (req: Request, res: Response) => {
		try {
			const userId: number = req.user.id;
			const data: CreateGroup = req.body;
			// console.log(data)

			const avatarData = await base64ToImage(data.avatar);
			console.log(avatarData);

			const groupMembers = [
				...data.members.map((id: number) => ({ id: id })),
				{ id: userId },
			];

			const group = await prismaClient.chatGroup.create({
				data: {
					name: data.name,
					avatar: avatarData.filename,
					admin: {
						connect: { id: userId },
					},
					members: {
						connect: groupMembers,
					},
				},
				include: {
					members: true,
				},
			});

			console.log(group);

			res.json(group);
		} catch (error) {
			res.status(500).json({ error: "Failed to create group" });
		}
	};
}
