import { Prisma } from "../generated/prisma";

export type IUser = Prisma.UserGetPayload<{
	select: {
		id: true;
		name: true;
		surname: true;
		username: true;
		Profile: {
			include: {
				avatars: {
					include: {
						image: true;
					}
				}
			}
		}
	};
}>;

export interface IGetRequest {
	status: "pending";
	from: IUser;
}

export interface IGetMyRequest {
	status: "pending";
	to: IUser;
}

export interface ICreateFriendRequest {
	fromId: number;
	toUsername: string;
}

export interface IAcceptFriendRequest {
	fromUsername: string;
	toId: number;
}

export interface ICancelFriendRequest {
	myId: number;
	username: string,
	isIncoming: boolean
}

export interface IDeleteFriend {
	myId: number;
	username: string,
}

export interface ICancelFriendRequestWithoutId {
	username: string,
	isIncoming: boolean
}

export type IFriendRequest = Prisma.FriendRequestGetPayload<{
	select: {
		fromId: true,
		toId: true,
		status: true
	}
}>;

export type ICanceledRequest = { status: "canceled" }

export type IDeletedFriend = { status: "deleted" }