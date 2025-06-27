import { friendService } from "./friend.service";
import { Request, Response } from "express";
import { ICancelFriendRequestWithoutId } from "./friend.types";
import { serializeBigInt } from "../tools/serializeBigInt";

export const friendController = {
  getAllFriends: async function (req: Request, res: Response) {
    const id = BigInt(res.locals.userId);
    const result = await friendService.getAllFriends(id);
    res.json(serializeBigInt(result));
  },

  getRecommends: async function (req: Request, res: Response) {
    const id = BigInt(res.locals.userId);
    const result = await friendService.getRecommends(id);
    res.json(serializeBigInt(result));
  },

  getRequests: async function (req: Request, res: Response) {
    const id = BigInt(res.locals.userId);
    const result = await friendService.getRequests(id);
    res.json(serializeBigInt(result));
  },

  getMyRequests: async function (req: Request, res: Response) {
    const id = BigInt(res.locals.userId);
    const result = await friendService.getMyRequests(id);
    res.json(serializeBigInt(result));
  },

  sendRequest: async function (req: Request, res: Response) {
    const profile1_id = BigInt(res.locals.userId);
    const { toUsername } = req.body;
    const result = await friendService.sendRequest({
      profile1_id,
      toUsername,
    });
    res.json(serializeBigInt(result));
  },

  acceptRequest: async function (req: Request, res: Response) {
    const profile2_id = BigInt(res.locals.userId);
    const { fromUsername } = req.body;
    const result = await friendService.acceptRequest({
      fromUsername,
      profile2_id,
    });
    res.json(serializeBigInt(result));
  },

  cancelRequest: async function (req: Request, res: Response) {
    const profile1_id = BigInt(res.locals.userId);
    const { username, isIncoming } = req.body;
    const result = await friendService.cancelRequest({
      profile1_id,
      username,
      isIncoming,
    });
    res.json(serializeBigInt(result));
  },

  deleteFriend: async function (req: Request, res: Response) {
    const profile1_id = BigInt(res.locals.userId);
    const { username } = req.body;
    const result = await friendService.deleteFriend({
      profile1_id,
      username,
    });
    res.json(serializeBigInt(result));
  },
};
