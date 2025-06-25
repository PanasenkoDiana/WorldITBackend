import { Prisma } from "../generated/prisma";

export type IUser = Prisma.UserGetPayload<{
  select: {
    id: true;
    first_name: true;
    last_name: true;
    username: true;
    user_app_profile: {
      include: {
        user_app_avatar: {
          select: {
            image: true;
            active: true;
            shown: true;
          };
        };
      };
    };
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
  profile1_id: bigint; 
  toUsername: string;
}

export interface IAcceptFriendRequest {
  fromUsername: string;
  profile2_id: bigint; 
}

export interface ICancelFriendRequest {
    username: string;
    profile1_id: bigint; 
    isIncoming: boolean;
}

export interface IDeleteFriend {
    profile1_id: bigint; 
    username: string;
}

export interface ICancelFriendRequestWithoutId {
  username: string;
  isIncoming: boolean;
}

export type IFriendRequest = Prisma.user_app_friendshipGetPayload<{
  select: {
    profile1_id: true; 
    profile2_id: true;
    accepted: true;  
  };
}>;

export type ICanceledRequest = { status: "canceled" };
export type IDeletedFriend = { status: "deleted" };
