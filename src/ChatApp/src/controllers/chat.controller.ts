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

			const chatGroup = await prismaClient.chat_app_chatgroup.findFirst({
				where: {
					id: BigInt(chatGroupId),
					chat_app_chatgroup_members: {
						some: {
							profile_id: BigInt(authorId),
						},
					},
				},
			});

			if (!chatGroup) {
				res.status(404).json({ error: "Chat group not found or access denied" });
				return;
			}

			const message = await prismaClient.chat_app_chatmessage.create({
				data: {
					content,
					author_id: BigInt(authorId),
					chat_group_id: BigInt(chatGroupId),
					sent_at: new Date(),
				},
				include: {
					user_app_profile: true,
					chat_app_chatgroup: true,
				},
			});

			res.status(201).json(message);
		} catch (error) {
			console.error("Error sending message:", error);
			res.status(500).json({
				error: "Failed to send message",
				details: error instanceof Error ? error.message : "Unknown error",
			});
		}
	};

	// Получить или создать личный чат
	public getOrCreateChatGroup = async (req: Request, res: Response): Promise<void> => {
		try {
			const { recipientProfileId } = req.body;
			const currentUserId = req.user?.id;

			if (!recipientProfileId || !currentUserId) {
				res.status(400).json({
					error: "Missing recipient profile id or user not authenticated",
				});
				return;
			}

			// Найти существующую личную группу между двумя профилями
			let chatGroup = await prismaClient.chat_app_chatgroup.findFirst({
				where: {
					is_personal_chat: true,
					chat_app_chatgroup_members: {
						some: { profile_id: BigInt(currentUserId) },
					},
					AND: [
						{
							chat_app_chatgroup_members: {
								some: { profile_id: BigInt(recipientProfileId) },
							},
						},
						{
							chat_app_chatgroup_members: {
								every: {
									profile_id: { in: [BigInt(currentUserId), BigInt(recipientProfileId)] },
								},
							},
						},
					],
				},
			});

			if (!chatGroup) {
				chatGroup = await prismaClient.chat_app_chatgroup.create({
					data: {
						name: `chat-${Date.now()}`,
						admin_id: BigInt(currentUserId),
						is_personal_chat: true,
						chat_app_chatgroup_members: {
							create: [
								{ profile_id: BigInt(currentUserId) },
								{ profile_id: BigInt(recipientProfileId) },
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

	// История сообщений группы
	public getChatHistory = async (req: Request, res: Response): Promise<void> => {
		try {
			const { chatId } = req.params;
			const messages = await prismaClient.chat_app_chatmessage.findMany({
				where: {
					chat_group_id: BigInt(chatId),
				},
				include: {
					user_app_profile: true,
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

	// Получить все групповые чаты пользователя
	public getAllChats = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id || res.locals.userId;

			const chats = await prismaClient.chat_app_chatgroup.findMany({
				where: {
					chat_app_chatgroup_members: {
						some: {
							profile_id: BigInt(userId),
						},
					},
					is_personal_chat: false,
				},
				include: {
					chat_app_chatgroup_members: {
						include: {
							user_app_profile: {
								include: {
									user_app_avatar: {
										where: { active: true },
									},
								},
							},
						},
					},
					chat_app_chatmessage: true,
				},
			});

			res.json(chats);
		} catch (error) {
			res.status(500).json({ error: "Failed to fetch chats" });
		}
	};

	// Создать новую группу
	public createGroup = async (req: Request, res: Response) => {
		try {
			const userId: number = req.user.id;
			const data: CreateGroup = req.body;

			const avatarData = await base64ToImage(data.avatar);

			const group = await prismaClient.chat_app_chatgroup.create({
				data: {
					name: data.name,
					avatar: avatarData.filename,
					admin_id: BigInt(userId),
					is_personal_chat: false,
					chat_app_chatgroup_members: {
						create: [
							...data.members.map((id: number) => ({ profile_id: BigInt(id) })),
							{ profile_id: BigInt(userId) },
						],
					},
				},
				include: {
					chat_app_chatgroup_members: {
						include: {
							user_app_profile: true,
						},
					},
				},
			});

			res.json(group);
		} catch (error) {
			res.status(500).json({ error: "Failed to create group" });
		}
	};
}
