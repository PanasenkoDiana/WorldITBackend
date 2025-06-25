import { userPostService } from "./userPost.service";
import { Request, Response } from "express";

export const userPostController = {
	createPost: async function (req: Request, res: Response) {
		const userId: number = Number(res.locals.userId);
		const { images, links, ...data } = req.body;
		console.log(data);
		console.log(`Create post links: ${links}`);
		const result = await userPostService.createPost(userId, data, images ? images : [], links);
		res.json(result);
	},
	deletePost: async function (req: Request, res: Response) {
		const userId: number = Number(res.locals.userId);
		const data = req.body;
		const result = await userPostService.deletePost(userId, data.id);
		res.json(result);
	},
	updatePost: async function (req: Request, res: Response) {
		const userId: number = Number(res.locals.userId);
		const { postId, images, ...data } = req.body;
		const result = await userPostService.updatePost(userId, postId, data, images);
		res.json(result);
	},
	getPostById: async function (req: Request, res: Response) {
		const id = parseInt(req.params.id);
		const result = await userPostService.getPostById(id);
		res.json(result);
	},
	getAllPosts: async function (req: Request, res: Response) {
		const result = await userPostService.getAllPosts();
		res.json(result);
	},
	getMyPosts: async function (req: Request, res: Response) {
		const id: number = Number(res.locals.userId);
		const result = await userPostService.getMyPosts(id);
		res.json(result);
	},
};
