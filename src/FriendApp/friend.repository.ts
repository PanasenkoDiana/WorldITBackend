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
	getAllFriends: async function (profileId: bigint): Promise<IUser[]> {
		try {
			// Друзья, где пользователь инициатор (profile1_id)
			const friendships = await prismaClient.user_app_friendship.findMany({
				where: {
					accepted: true,
					OR: [
						{ profile1_id: profileId },
						{ profile2_id: profileId },
					],
				},
				include: {
					user_app_profile_user_app_friendship_profile1_idTouser_app_profile: {
						include: {
							auth_user: true,
							user_app_avatar: true,
						},
					},
					user_app_profile_user_app_friendship_profile2_idTouser_app_profile: {
						include: {
							auth_user: true,
							user_app_avatar: true,
						},
					},
				},
			});

			return friendships.map((f) => {
				const profile =
					f.profile1_id === profileId
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
			console.log(err);
			throw err;
		}
	},

	getRecommends: async function (profileId: bigint): Promise<IUser[]> {
		try {
			const relatedFriendships = await prismaClient.user_app_friendship.findMany({
				where: {
					OR: [
						{ profile1_id: profileId },
						{ profile2_id: profileId }
					],
				},
				select: {
					profile1_id: true,
					profile2_id: true,
				},
			});

			const excludedIds = [
				...relatedFriendships.map((friendship) =>
					friendship.profile1_id === profileId ? friendship.profile2_id : friendship.profile1_id
				),
				profileId,
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

			return profiles.map(profile => ({
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
			console.log(err);
			throw err;
		}
	},

	getRequests: async function (profileId: bigint): Promise<IGetRequest[]> {
		try {
			const requests = await prismaClient.user_app_friendship.findMany({
				where: {
					accepted: false,
					profile2_id: profileId,
				},
				include: {
					user_app_profile_user_app_friendship_profile1_idTouser_app_profile: {
						include: {
							auth_user: true,
							user_app_avatar: true
						}
					}
				}
			});

			return requests.map(req => ({
				status: "pending",
				from: {
					id: Number(req.user_app_profile_user_app_friendship_profile1_idTouser_app_profile.id),
					first_name: req.user_app_profile_user_app_friendship_profile1_idTouser_app_profile.auth_user?.first_name || "",
					last_name: req.user_app_profile_user_app_friendship_profile1_idTouser_app_profile.auth_user?.last_name || "",
					username: req.user_app_profile_user_app_friendship_profile1_idTouser_app_profile.auth_user?.username || "",
					user_app_profile: {
						id: req.user_app_profile_user_app_friendship_profile1_idTouser_app_profile.id,
						date_of_birth: req.user_app_profile_user_app_friendship_profile1_idTouser_app_profile.date_of_birth,
						user_id: req.user_app_profile_user_app_friendship_profile1_idTouser_app_profile.user_id,
						signature: req.user_app_profile_user_app_friendship_profile1_idTouser_app_profile.signature,
						user_app_avatar: req.user_app_profile_user_app_friendship_profile1_idTouser_app_profile.user_app_avatar
					}
				}
			}));
		} catch (err) {
			console.log(err);
			throw err;
		}
	},

	getMyRequests: async function (profileId: bigint): Promise<IGetMyRequest[]> {
		try {
			const requests = await prismaClient.user_app_friendship.findMany({
				where: {
					accepted: false,
					profile1_id: profileId
				},
				include: {
					user_app_profile_user_app_friendship_profile2_idTouser_app_profile: {
						include: {
							auth_user: true,
							user_app_avatar: true
						}
					}
				}
			});

			return requests.map(req => ({
				status: "pending",
				to: {
					id: Number(req.user_app_profile_user_app_friendship_profile2_idTouser_app_profile.id),
					first_name: req.user_app_profile_user_app_friendship_profile2_idTouser_app_profile.auth_user?.first_name || "",
					last_name: req.user_app_profile_user_app_friendship_profile2_idTouser_app_profile.auth_user?.last_name || "",
					username: req.user_app_profile_user_app_friendship_profile2_idTouser_app_profile.auth_user?.username || "",
					user_app_profile: {
						id: req.user_app_profile_user_app_friendship_profile2_idTouser_app_profile.id,
						date_of_birth: req.user_app_profile_user_app_friendship_profile2_idTouser_app_profile.date_of_birth,
						user_id: req.user_app_profile_user_app_friendship_profile2_idTouser_app_profile.user_id,
						signature: req.user_app_profile_user_app_friendship_profile2_idTouser_app_profile.signature,
						user_app_avatar: req.user_app_profile_user_app_friendship_profile2_idTouser_app_profile.user_app_avatar
					}
				}
			}));
		} catch (err) {
			console.log(err);
			throw err;
		}
	},

	sendRequest: async function (data: ICreateFriendRequest): Promise<IFriendRequest> {
		try {
			const toProfile = await prismaClient.user_app_profile.findFirst({
				where: { 
					auth_user: { username: data.toUsername }
				},
				select: { id: true }
			});
			
			if (!toProfile) throw new Error("User profile not found");

			const request = await prismaClient.user_app_friendship.create({
				data: {
					accepted: false,
					profile1_id: data.profile1_id,  // Changed from fromProfileId
					profile2_id: toProfile.id
				},
				select: {
					profile1_id: true,
					profile2_id: true,
					accepted: true
				},
			});
			
			return {
				profile1_id: request.profile1_id,
				profile2_id: request.profile2_id,
				accepted: request.accepted
			};
		} catch (err) {
			console.log(err);
			throw err;
		}
	},

	acceptRequest: async function (data: IAcceptFriendRequest): Promise<IFriendRequest> {
		try {
			const fromProfile = await prismaClient.user_app_profile.findFirst({
				where: {
					auth_user: { username: data.fromUsername }
				},
				select: { id: true }
			});

			if (!fromProfile) throw new Error("User profile not found");

			const request = await prismaClient.user_app_friendship.updateMany({
				where: {
					profile1_id: fromProfile.id,
					profile2_id: data.profile2_id,  // Changed from toProfileId
					accepted: false
				},
				data: {
					accepted: true
				}
			});

			return {
				profile1_id: fromProfile.id,
				profile2_id: data.profile2_id,  // Changed from toProfileId
				accepted: true
			};
		} catch (err) {
			console.log(err);
			throw err;
		}
	},

	cancelRequest: async function (data: ICancelFriendRequest): Promise<ICanceledRequest> {
		try {
			const otherProfile = await prismaClient.user_app_profile.findFirst({
				where: {
					auth_user: { username: data.username }
				},
				select: { id: true }
			});

			if (!otherProfile) throw new Error("User profile not found");

			const profile1_id = data.isIncoming ? otherProfile.id : data.profile1_id;
			const profile2_id = data.isIncoming ? data.profile1_id : otherProfile.id;

			await prismaClient.user_app_friendship.deleteMany({
				where: {
					profile1_id,
					profile2_id,
					accepted: false
				}
			});

			return { status: "canceled" };
		} catch (err) {
			console.log(err);
			throw err;
		}
	},

	deleteFriend: async function (data: IDeleteFriend): Promise<IDeletedFriend> {
		try {
			const otherProfile = await prismaClient.user_app_profile.findFirst({
				where: {
					auth_user: { username: data.username }
				},
				select: { id: true }
			});

			if (!otherProfile) throw new Error("User profile not found");

			await prismaClient.user_app_friendship.deleteMany({
				where: {
					OR: [
						{ profile1_id: data.profile1_id, profile2_id: otherProfile.id },
						{ profile1_id: otherProfile.id, profile2_id: data.profile1_id }
					],
					accepted: true
				}
			});

			return { status: "deleted" };
		} catch (err) {
			console.log(err);
			throw err;
		}
	},
};
