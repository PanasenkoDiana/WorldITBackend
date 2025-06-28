import { prismaClient } from "../../../prisma/client";
import { Request, Response } from "express";
import { base64ToImage } from "../../../tools/base64ToImage";
import { CreateGroup } from "../types";
import { serializeBigInt } from "../../../tools/serializeBigInt";
import { Server } from "socket.io";

export class ChatController {
	private io: Server;

	constructor(io: Server) {
		this.io = io;
	}

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

			if (!myProfile) throw new Error("Profile not found");

			const chatGroup = await prismaClient.chat_app_chatgroup.findFirst({
				where: {
					id: BigInt(chatGroupId),
					chat_app_chatgroup_members: {
						some: { profile_id: myProfile.id },
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
					user_app_profile: { include: { auth_user: true } },
				},
			});

			const serializedMessage = serializeBigInt(message);

			// Уведомляем всех участников
			this.io.to(chatGroupId.toString()).emit("group_message", {
				...serializedMessage,
				chatGroupId,
			});

			res.status(201).json(serializedMessage);
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
			const { recipientId } = req.body;
			const currentUserId = req.user?.id;

			if (!recipientId || !currentUserId) {
				res.status(400).json({
					error: "Missing recipient profile id or user not authenticated",
				});
				return;
			}

			const myProfile = await prismaClient.user_app_profile.findUnique({
				where: { user_id: Number(currentUserId) },
			});

			if (!myProfile) throw new Error("Profile not found");

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
										in: [myProfile.id, BigInt(recipientId)],
									},
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
			}

			res.json({ chatGroupId: Number(chatGroup.id) });
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

			const messages = await prismaClient.chat_app_chatmessage.findMany({
				where: {
					chat_group_id: BigInt(chatId),
				},
				include: {
					user_app_profile: {
						include: { auth_user: true },
					},
				},
			});

			res.json(serializeBigInt(messages));
		} catch (error) {
			console.error("Error fetching chat history:", error);
			res.status(500).json({ error: "Failed to fetch chat history" });
		}
	};

	public getAllChats = async (req: Request, res: Response) => {
		try {
			const userId: number = res.locals.userId;

			const user = await prismaClient.user.findUnique({
				where: {
					id: userId,
				},
				include: {
					user_app_profile: true,
				},
			});

			if (!user)
				throw new Error(
					"getAllChast USER BOOBOBOOBOBOBOBOBOBOOBOBOBOBOBOOB"
				);

			const chats = await prismaClient.chat_app_chatgroup.findMany({
				where: {
					chat_app_chatgroup_members: {
						some: { profile_id: Number(user.user_app_profile?.id) },
					},
				},
				include: {
					chat_app_chatgroup_members: {
						include: {
							user_app_profile: {
								include: {
									user_app_avatar: {
										where: { active: true },
									},
									auth_user: true,
								},
							},
						},
					},
					chat_app_chatmessage: {
						include: {
							user_app_profile: {
								include: {
									auth_user: true,
									user_app_avatar: true,
								},
							},
						},
					},
				},
			});

			res.json(serializeBigInt(chats));
		} catch (error) {
			console.error("Error fetching chats:", error);
			res.status(500).json({ error: "Failed to fetch chats" });
		}
	};

	public createGroup = async (req: Request, res: Response) => {
		try {
			const userId = req.user.id;
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
							...data.members.map((id) => ({
								profile_id: BigInt(id),
							})),
							{ profile_id: BigInt(userId) },
						],
					},
				},
				include: {
					chat_app_chatgroup_members: {
						include: { user_app_profile: true },
					},
				},
			});

			res.json(group);
		} catch (error) {
			console.error("Error creating group:", error);
			res.status(500).json({ error: "Failed to create group" });
		}
	};
}
