import { prismaClient } from "../../../prisma/client";
import { Request, Response } from "express";
import { base64ToImage } from "../../../tools/base64ToImage";
import { CreateGroup } from "../types";
import { serializeBigInt } from "../../../tools/serializeBigInt";

export class ChatController {
	public sendMessage = async (req: Request, res: Response): Promise<void> => {
		try {
			const { content, chatGroupId } = req.body;
			const authorId = req.user?.id;

			if (!content || !chatGroupId || !authorId) {
				res.status(400).json({ error: "Missing required fields" });
				return;
			}

			const myProfile = await prismaClient.user_app_profile.findUnique({
				where: { user_id: Number(authorId) },
			});

			if (!myProfile) throw new Error("myProfile in sendMessage bobo")

			const chatGroup = await prismaClient.chat_app_chatgroup.findFirst({
				where: {
					id: BigInt(chatGroupId),
					chat_app_chatgroup_members: {
						some: {
							profile_id: myProfile.id,
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

			const message = await prismaClient.chat_app_chatmessage.create({
				data: {
					content,
					author_id: BigInt(myProfile.id),
					chat_group_id: BigInt(chatGroupId),
					sent_at: new Date(),
				},
				include: {
					user_app_profile: true,
					chat_app_chatgroup: true,
				},
			});

			res.status(201).json(serializeBigInt(message));
		} catch (error) {
			console.error("Error sending message:", error);
			res.status(500).json({
				error: "Failed to send message",
				details:
					error instanceof Error ? error.message : "Unknown error",
			});
		}
	};

	// Получить или создать личный чат
	public getOrCreateChatGroup = async (
		req: Request,
		res: Response
	): Promise<void> => {
		try {
			const { recipientId } = req.body;
			const currentUserId = req.user?.id;
			console.log(
				"currentUserId:",
				currentUserId,
				"recipientId:",
				recipientId
			);

			if (!recipientId || !currentUserId) {
				res.status(400).json({
					error: "Missing recipient profile id or user not authenticated",
				});
				return;
			}

			const myProfile = await prismaClient.user_app_profile.findUnique({
				where: { user_id: Number(currentUserId) },
			});

			if (!myProfile) throw new Error('you not found')

			let chatGroup = await prismaClient.chat_app_chatgroup.findFirst({
				where: {
					is_personal_chat: true,
					chat_app_chatgroup_members: {
						some: { profile_id: myProfile.id },
					},
					AND: [
						{
							chat_app_chatgroup_members: {
								some: { profile_id: BigInt(recipientId) },
							},
						},
						{
							chat_app_chatgroup_members: {
								every: {
									profile_id: {
										in: [
											myProfile.id,
											BigInt(recipientId),
										],
									},
								},
							},
						},
					],
				},
			});

			if (!chatGroup) {
				console.log("ChatGroup is not found")
				chatGroup = await prismaClient.chat_app_chatgroup.create({
					data: {
						name: `chat-${Date.now()}`,
						admin_id: myProfile.id,
						is_personal_chat: true,
						chat_app_chatgroup_members: {
							create: [
								{ profile_id: myProfile.id },
								{ profile_id: BigInt(recipientId) },
							],
						},
					},
				});
				console.log("ChatGroup is created")
			}

			res.json({ chatGroupId: Number(chatGroup.id)});
		} catch (error) {
			console.error("Error in getOrCreateChatGroup:", error);
			res.status(500).json({
				error: "Failed to get or create chat group",
				details: error instanceof Error ? error.message : String(error),
			});
		}
	};

	// История сообщений группы
	public getChatHistory = async (
		req: Request,
		res: Response
	): Promise<void> => {
		try {
			const { chatId } = req.params;
			console.log('chatid: ', chatId)
			const messages = await prismaClient.chat_app_chatmessage.findMany({
				where: {
					chat_group_id: BigInt(+chatId),
				},
				include: {
					user_app_profile: {
						include: {
							auth_user: true
						}
					},
				},
			});

			res.json(serializeBigInt(messages))
		} catch (err) {
			console.log('all messages chat err: ', err)
			res.status(500).json({ error: err });
		}
	};

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
									auth_user: true
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
							...data.members.map((id: number) => ({
								profile_id: BigInt(id),
							})),
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
