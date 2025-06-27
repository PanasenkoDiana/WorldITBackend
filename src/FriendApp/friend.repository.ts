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
	getAllFriends: async function (userId: bigint): Promise<IUser[]> {
		try {
			const myProfile = await prismaClient.user_app_profile.findUnique({
				where: { user_id: Number(userId) },
			});

			if (!myProfile) throw new Error("User profile not found.");

			const friendships = await prismaClient.user_app_friendship.findMany(
				{
					where: {
						accepted: true,
						OR: [
							{ profile1_id: myProfile.id },
							{ profile2_id: myProfile.id },
						],
					},
					include: {
						user_app_profile_user_app_friendship_profile1_idTouser_app_profile:
							{
								include: {
									auth_user: true,
									user_app_avatar: true,
								},
							},
						user_app_profile_user_app_friendship_profile2_idTouser_app_profile:
							{
								include: {
									auth_user: true,
									user_app_avatar: true,
								},
							},
					},
				}
			);

			return friendships.map((f) => {
				const profile =
					f.profile1_id === BigInt(myProfile.id)
						? f.user_app_profile_user_app_friendship_profile2_idTouser_app_profile
						: f.user_app_profile_user_app_friendship_profile1_idTouser_app_profile;

				return {
					id: Number(profile.id),
					first_name: profile.auth_user?.first_name || "",
					last_name: profile.auth_user?.last_name || "",
					username: profile.auth_user?.username || "",
					user_app_profile: {
						id: profile.id,
						date_of_birth: profile.date_of_birth,
						user_id: profile.user_id,
						signature: profile.signature,
						user_app_avatar: profile.user_app_avatar,
					},
				};
			});
		} catch (err) {
			console.error("Error in getAllFriends:", err); // Используем console.error
			throw err;
		}
	},

	getRecommends: async function (userId: bigint): Promise<IUser[]> {
		try {
			const myProfile = await prismaClient.user_app_profile.findUnique({
				where: { user_id: Number(userId) },
			});

			if (!myProfile) throw new Error("User profile not found.");

			const relatedFriendships =
				await prismaClient.user_app_friendship.findMany({
					where: {
						OR: [
							{ profile1_id: myProfile.id },
							{ profile2_id: myProfile.id },
						],
					},
					select: {
						profile1_id: true,
						profile2_id: true,
					},
				});

			const excludedIds = [
				...relatedFriendships.map((friendship) =>
					friendship.profile1_id === BigInt(myProfile.id)
						? friendship.profile2_id
						: friendship.profile1_id
				),
				BigInt(myProfile.id),
			];

			const profiles = await prismaClient.user_app_profile.findMany({
				where: {
					id: { notIn: excludedIds },
				},
				orderBy: {
					id: "desc",
				},
				include: {
					auth_user: true,
					user_app_avatar: true,
				},
			});

			return profiles.map((profile) => ({
				id: Number(profile.id),
				first_name: profile.auth_user?.first_name || "",
				last_name: profile.auth_user?.last_name || "",
				username: profile.auth_user?.username || "",
				user_app_profile: {
					id: profile.id,
					date_of_birth: profile.date_of_birth,
					user_id: profile.user_id,
					signature: profile.signature,
					user_app_avatar: profile.user_app_avatar,
				},
			}));
		} catch (err) {
			console.error("Error in getRecommends:", err);
			throw err;
		}
	},

	getRequests: async function (userId: bigint): Promise<IGetRequest[]> {
		try {
			const myProfile = await prismaClient.user_app_profile.findUnique({
				where: { user_id: Number(userId) },
			});

			if (!myProfile) throw new Error("User profile not found.");

			const requests = await prismaClient.user_app_friendship.findMany({
				where: {
					accepted: false,
					profile2_id: myProfile.id,
				},
				include: {
					user_app_profile_user_app_friendship_profile1_idTouser_app_profile:
						{
							include: {
								auth_user: true,
								user_app_avatar: true,
							},
						},
				},
			});

			return requests.map((req) => ({
				status: "pending",
				from: {
					id: Number(
						req
							.user_app_profile_user_app_friendship_profile1_idTouser_app_profile
							.id
					),
					first_name:
						req
							.user_app_profile_user_app_friendship_profile1_idTouser_app_profile
							.auth_user?.first_name || "",
					last_name:
						req
							.user_app_profile_user_app_friendship_profile1_idTouser_app_profile
							.auth_user?.last_name || "",
					username:
						req
							.user_app_profile_user_app_friendship_profile1_idTouser_app_profile
							.auth_user?.username || "",
					user_app_profile: {
						id: req
							.user_app_profile_user_app_friendship_profile1_idTouser_app_profile
							.id,
						date_of_birth:
							req
								.user_app_profile_user_app_friendship_profile1_idTouser_app_profile
								.date_of_birth,
						user_id:
							req
								.user_app_profile_user_app_friendship_profile1_idTouser_app_profile
								.user_id,
						signature:
							req
								.user_app_profile_user_app_friendship_profile1_idTouser_app_profile
								.signature,
						user_app_avatar:
							req
								.user_app_profile_user_app_friendship_profile1_idTouser_app_profile
								.user_app_avatar,
					},
				},
			}));
		} catch (err) {
			console.error("Error in getRequests:", err);
			throw err;
		}
	},

	getMyRequests: async function (
		profileId: bigint
	): Promise<IGetMyRequest[]> {
		try {
			const requests = await prismaClient.user_app_friendship.findMany({
				where: {
					accepted: false,
					profile1_id: profileId,
				},
				include: {
					user_app_profile_user_app_friendship_profile2_idTouser_app_profile:
						{
							include: {
								auth_user: true,
								user_app_avatar: true,
							},
						},
				},
			});

			return requests.map((req) => ({
				status: "pending",
				to: {
					id: Number(
						req
							.user_app_profile_user_app_friendship_profile2_idTouser_app_profile
							.id
					),
					first_name:
						req
							.user_app_profile_user_app_friendship_profile2_idTouser_app_profile
							.auth_user?.first_name || "",
					last_name:
						req
							.user_app_profile_user_app_friendship_profile2_idTouser_app_profile
							.auth_user?.last_name || "",
					username:
						req
							.user_app_profile_user_app_friendship_profile2_idTouser_app_profile
							.auth_user?.username || "",
					user_app_profile: {
						id: req
							.user_app_profile_user_app_friendship_profile2_idTouser_app_profile
							.id,
						date_of_birth:
							req
								.user_app_profile_user_app_friendship_profile2_idTouser_app_profile
								.date_of_birth,
						user_id:
							req
								.user_app_profile_user_app_friendship_profile2_idTouser_app_profile
								.user_id,
						signature:
							req
								.user_app_profile_user_app_friendship_profile2_idTouser_app_profile
								.signature,
						user_app_avatar:
							req
								.user_app_profile_user_app_friendship_profile2_idTouser_app_profile
								.user_app_avatar,
					},
				},
			}));
		} catch (err) {
			console.error("Error in getMyRequests:", err);
			throw err;
		}
	},

	sendRequest: async function (
		data: ICreateFriendRequest
	): Promise<IFriendRequest> {
		try {
			const myProfile = await prismaClient.user_app_profile.findUnique({
				where: { user_id: Number(data.id) },
			});

			if (!myProfile) throw new Error("USER_PROFILE_NOT_FOUND");

			console.log(data);

			const toUser = await prismaClient.user.findFirst({
				where: {
					username: data.username,
				},
				select: {
					user_app_profile: true,
				},
			});

			if (!toUser || !toUser.user_app_profile) {
				throw new Error("RECIPIENT_PROFILE_NOT_FOUND");
			}

			const existingFriendship =
				await prismaClient.user_app_friendship.findFirst({
					where: {
						OR: [
							{
								profile1_id: myProfile.id,
								profile2_id: toUser.user_app_profile.id,
							},
							{
								profile1_id: toUser.user_app_profile.id,
								profile2_id: myProfile.id,
							},
						],
					},
				});

			if (existingFriendship) {
				if (existingFriendship.accepted) {
					throw new Error("ALREADY_FRIENDS");
				} else {
					throw new Error("PENDING_REQUEST_EXISTS");
				}
			}

			const request = await prismaClient.user_app_friendship.create({
				data: {
					accepted: false,
					profile1_id: myProfile.id,
					profile2_id: toUser.user_app_profile.id,
				},
				select: {
					profile1_id: true,
					profile2_id: true,
					accepted: true,
				},
			});

			return {
				profile1_id: request.profile1_id,
				profile2_id: request.profile2_id,
				accepted: request.accepted,
			};
		} catch (err: any) {
			console.error("Error in sendRequest:", err);
			throw err;
		}
	},

	acceptRequest: async function (
		data: IAcceptFriendRequest
	): Promise<IFriendRequest> {
		try {
			const myProfile = await prismaClient.user_app_profile.findUnique({
				where: { user_id: Number(data.id) },
			});

			if (!myProfile) throw new Error("USER_PROFILE_NOT_FOUND");

			const fromProfile = await prismaClient.user_app_profile.findFirst({
				where: {
					auth_user: { username: data.username },
				},
				select: { id: true },
			});

			if (!fromProfile) throw new Error("SENDER_PROFILE_NOT_FOUND");

			const request = await prismaClient.user_app_friendship.updateMany({
				where: {
					profile1_id: fromProfile.id,
					profile2_id: myProfile.id,
					accepted: false,
				},
				data: {
					accepted: true,
				},
			});

			if (request.count === 0) {
				throw new Error("FRIEND_REQUEST_NOT_FOUND_OR_ALREADY_ACCEPTED");
			}

			return {
				profile1_id: fromProfile.id,
				profile2_id: myProfile.id,
				accepted: true,
			};
		} catch (err) {
			console.error("Error in acceptRequest:", err);
			throw err;
		}
	},

	cancelRequest: async function (
		data: ICancelFriendRequest
	): Promise<ICanceledRequest> {
		try {
			const myProfile = await prismaClient.user_app_profile.findUnique({
				where: { user_id: Number(data.id) },
			});

			if (!myProfile) throw new Error("USER_PROFILE_NOT_FOUND");

			const otherProfile = await prismaClient.user_app_profile.findFirst({
				where: {
					auth_user: { username: data.username },
				},
				select: { id: true },
			});

			if (!otherProfile) throw new Error("OTHER_PROFILE_NOT_FOUND");

			const profile1_id = data.isIncoming
				? otherProfile.id
				: myProfile.id;
			const profile2_id = data.isIncoming
				? myProfile.id
				: otherProfile.id;

			const deleteResult =
				await prismaClient.user_app_friendship.deleteMany({
					where: {
						profile1_id,
						profile2_id,
						accepted: false,
					},
				});

			if (deleteResult.count === 0) {
				throw new Error("PENDING_REQUEST_NOT_FOUND");
			}

			return { status: "canceled" };
		} catch (err) {
			console.error("Error in cancelRequest:", err);
			throw err;
		}
	},

	deleteFriend: async function (
		data: IDeleteFriend
	): Promise<IDeletedFriend> {
		try {
			const myProfile = await prismaClient.user_app_profile.findUnique({
				where: { user_id: Number(data.id) },
			});

			if (!myProfile) throw new Error("USER_PROFILE_NOT_FOUND");

			const otherProfile = await prismaClient.user_app_profile.findFirst({
				where: {
					auth_user: { username: data.username },
				},
				select: { id: true },
			});

			if (!otherProfile) throw new Error("FRIEND_PROFILE_NOT_FOUND");

			const deleteResult =
				await prismaClient.user_app_friendship.deleteMany({
					where: {
						OR: [
							{
								profile1_id: myProfile.id,
								profile2_id: otherProfile.id,
							},
							{
								profile1_id: otherProfile.id,
								profile2_id: myProfile.id,
							},
						],
						accepted: true,
					},
				});

			if (deleteResult.count === 0) {
				throw new Error("FRIENDSHIP_NOT_FOUND");
			}

			return { status: "deleted" };
		} catch (err) {
			console.error("Error in deleteFriend:", err);
			throw err;
		}
	},
};
