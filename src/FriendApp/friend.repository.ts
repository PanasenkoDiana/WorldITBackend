import { prismaClient } from "../prisma/client";
import {
	IAcceptFriendRequest,
	ICanceledRequest,
	ICancelFriendRequest,
	ICreateFriendRequest,
	IDeletedFriend,
	IDeleteFriend,
	IFriendRequest,
	IGetMyRequest,
	IGetRequest,
	IUser,
} from "./friend.types";

export const friendRepository = {
	getAllFriends: async function (id: number): Promise<IUser[]> {
		try {
			const fromMyRequests = await prismaClient.friendRequest.findMany({
				where: {
					status: "accepted",
					fromId: id,
				},
				select: {
					to: {
						select: {
							id: true,
							name: true,
							surname: true,
							username: true,
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
				},
			});

			const toMeRequests = await prismaClient.friendRequest.findMany({
				where: {
					status: "accepted",
					toId: id,
				},
				select: {
					from: {
						select: {
							id: true,
							name: true,
							surname: true,
							username: true,
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
				},
			});

			const friends = [
				...fromMyRequests.map((req) => req.to),
				...toMeRequests.map((req) => req.from),
			];

			return friends;
		} catch (err) {
			console.log(err);
			throw err;
		}
	},

	getRecommends: async function (id: number): Promise<IUser[]> {
		try {
			const relatedUsers = await prismaClient.friendRequest.findMany({
				where: {
					OR: [{ fromId: id }, { toId: id }],
					status: { in: ["pending", "accepted"] },
				},
				select: {
					fromId: true,
					toId: true,
				},
			});

			const excludedIds = [
				...relatedUsers.map((user) =>
					user.fromId === id ? user.toId : user.fromId
				),
				id,
			];

			const users = await prismaClient.user.findMany({
				where: {
					id: { notIn: excludedIds },
				},
				orderBy: {
					id: "desc",
				},
				select: {
					id: true,
					name: true,
					surname: true,
					username: true,
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
			});

			return users;
		} catch (err) {
			console.log(err);
			throw err;
		}
	},

	getRequests: async function (id: number): Promise<IGetRequest[]> {
		try {
			const requests = await prismaClient.friendRequest.findMany({
				where: {
					status: "pending",
					toId: id,
				},
				select: {
					status: true,
					from: {
						select: {
							id: true,
							name: true,
							surname: true,
							username: true,
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
				},
			});

			return requests.map((req) => ({
				status: 'pending',
				from: req.from,
			}));
		} catch (err) {
			console.log(err);
			throw err;
		}
	},

	getMyRequests: async function (id: number): Promise<IGetMyRequest[]> {
		try {
			const requests = await prismaClient.friendRequest.findMany({
				where: {
					status: "pending",
					fromId: id,
				},
				select: {
					status: true,
					to: {
						select: {
							id: true,
							name: true,
							surname: true,
							username: true,
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
				},
			});

			return requests.map((req) => ({
				status: "pending",
				to: req.to,
			}));
		} catch (err) {
			console.log(err);
			throw err;
		}
	},

	sendRequest: async function (
		data: ICreateFriendRequest
	): Promise<IFriendRequest> {
		try {
			const request = await prismaClient.friendRequest.create({
				data: {
					status: "pending",
					from: { connect: { id: data.fromId } },
					to: { connect: { username: data.toUsername } },
				},
				select: {
					fromId: true,
					toId: true,
					status: true,
				},
			});
			return request;
		} catch (err) {
			console.log(err);
			throw err;
		}
	},

	acceptRequest: async function (
		data: IAcceptFriendRequest
	): Promise<IFriendRequest> {
		try {
			const fromUser = await prismaClient.user.findUnique({
				where: { username: data.fromUsername },
				select: { id: true },
			});

			if (!fromUser) throw new Error("User not found");

			const request = await prismaClient.friendRequest.update({
				where: {
					fromId_toId: {
						fromId: fromUser.id,
						toId: data.toId,
					},
				},
				data: {
					status: "accepted",
				},
				select: {
					fromId: true,
					toId: true,
					status: true,
				},
			});
			return request;
		} catch (err) {
			console.log(err);
			throw err;
		}
	},

	cancelRequest: async function (
		data: ICancelFriendRequest
	): Promise<ICanceledRequest> {
		try {
			const otherUser = await prismaClient.user.findUnique({
				where: { username: data.username },
				select: { id: true },
			});

			if (!otherUser) throw new Error("User not found");

			const fromId = data.isIncoming ? otherUser.id : data.myId;
			const toId = data.isIncoming ? data.myId : otherUser.id;

			await prismaClient.friendRequest.delete({
				where: {
					fromId_toId: {
						fromId,
						toId,
					},
				},
			});

			return { status: "canceled" };
		} catch (err) {
			console.log(err);
			throw err;
		}
	},

	deleteFriend: async function (
		data: IDeleteFriend
	): Promise<IDeletedFriend> {
		try {
			const request = await prismaClient.friendRequest.findFirst({
				where: {
					OR: [
						{
							from: { username: data.username },
							toId: data.myId,
						},
						{
							fromId: data.myId,
							to: { username: data.username },
						},
					],
					status: { in: ["pending", "accepted"] },
				},
				select: {
					fromId: true,
					toId: true,
				},
			});

			if (!request) throw new Error("Friend request not found");

			await prismaClient.friendRequest.delete({
				where: {
					fromId_toId: {
						fromId: request.fromId,
						toId: request.toId,
					},
				},
			});

			return { status: "deleted" };
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
};
