import { error, Result, success } from "../tools/result";
import { serializeBigInt } from "../tools/serializeBigInt";
import { friendRepository } from "./friend.repository";
import {
	IAcceptFriendRequest,
	ICanceledRequest,
	ICancelFriendRequest,
	ICreateFriendRequest,
	IFriendRequest,
	IGetMyRequest,
	IGetRequest,
	IUser,
	IDeletedFriend,
	IDeleteFriend
} from "./friend.types";

export const friendService = {
	getAllFriends: async function (id: bigint): Promise<Result<IUser[]>> {
		try {
			const friends = await friendRepository.getAllFriends(id);
			return success(friends);
		} catch (err) {
			console.log(err);
			error("Error getting friends");
			throw err;
		}
	},
	getRecommends: async function (id: bigint): Promise<Result<IUser[]>> {
		try {
			const users = await friendRepository.getRecommends(id);
			return success(users);
		} catch (err) {
			console.log(err);
			error("Error get recommends");
			throw err;
		}
	},
	getRequests: async function (id: bigint): Promise<Result<IGetRequest[]>> {
		try {
			const friendRequests = await friendRepository.getRequests(id);
			return success(friendRequests);
		} catch (err) {
			console.log(err);
			error("Error receiving friend requests");
			throw err;
		}
	},
	getMyRequests: async function (
		id: bigint
	): Promise<Result<IGetMyRequest[]>> {
		try {
			const friendRequests = await friendRepository.getMyRequests(id);
			return success(friendRequests);
		} catch (err) {
			console.log(err);
			error("Error receiving my friend requests");
			throw err;
		}
	},
	sendRequest: async function (
		data: ICreateFriendRequest
	): Promise<Result<IFriendRequest>> {
		try {
			const friendRequest = await friendRepository.sendRequest({
				id: data.id,
				username: data.username,
			});
			return success(friendRequest);
		} catch (err) {
			console.log(err);
			error("Error sending friend request");
			throw err;
		}
	},
	acceptRequest: async function (
		data: IAcceptFriendRequest
	): Promise<Result<IFriendRequest>> {
		try {
			const friendRequest = await friendRepository.acceptRequest({
				username: data.username,
				id: data.id
			});
			return success(friendRequest);
		} catch (err) {
			console.log(err);
			error("Error sending friend request");
			throw err;
		}
	},
	cancelRequest: async function (
		data: ICancelFriendRequest
	): Promise<Result<ICanceledRequest>> {
		try {
			const status = await friendRepository.cancelRequest(data);
			return success(status);
		} catch (err) {
			console.log(err);
			error("Error sending friend request");
			throw err;
		}
	},
	deleteFriend: async function (
		data: IDeleteFriend
	): Promise<Result<IDeletedFriend>> {
		try {
			const status = await friendRepository.deleteFriend(data);
			return success(serializeBigInt(status));
		} catch (err) {
			console.log(err);
			error("Error sending friend request");
			throw err;
		}
	},
};
 