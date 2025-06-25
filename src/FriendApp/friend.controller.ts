import { friendService } from "./friend.service";
import { Request, Response } from "express";
import { ICancelFriendRequestWithoutId } from "./friend.types";

export const friendController = {
	getAllFriends: async function (req: Request, res: Response) {
		const id: number = Number(res.locals.userId);
		const result = await friendService.getAllFriends(id);
		res.json(result);
	},
	getRecommends: async function (req: Request, res: Response) {
        const id: number = Number(res.locals.userId);
		const result = await friendService.getRecommends(id);
		res.json(result);
	},
	getRequests: async function (req: Request, res: Response) {
		const id: number = Number(res.locals.userId);
		const result = await friendService.getRequests(id);
		res.json(result);
	},
	getMyRequests: async function (req: Request, res: Response) {
		const id: number = Number(res.locals.userId);
		const result = await friendService.getMyRequests(id);
		res.json(result);
	},
	sendRequest: async function (req: Request, res: Response) {
		const id: number = Number(res.locals.userId);
		const { username } = req.body;
		const result = await friendService.sendRequest({
			fromId: id,
			toUsername: username,
		});
		res.json(result);
	},
	acceptRequest: async function (req: Request, res: Response) {
		const id: number = Number(res.locals.userId);
		const data = req.body;
		const result = await friendService.acceptRequest({
			fromUsername: data.username,
			toId: id,
		});
		res.json(result);
	},
	cancelRequest: async function (req: Request, res: Response) {
		const id: number = Number(res.locals.userId);
		const { username, isIncoming } = req.body;
		const result = await friendService.cancelRequest({
			myId: id,
			username: username,
			isIncoming,
		});
		res.json(result);
	},
	deleteFriend: async function (req: Request, res: Response) {
		const id: number = Number(res.locals.userId);
		const { username } = req.body;
		const result = await friendService.deleteFriend({
			myId: id,
			username: username
		});
		res.json(result);
	},
};
