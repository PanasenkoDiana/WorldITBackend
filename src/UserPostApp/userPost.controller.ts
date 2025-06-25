import { userPostService } from "./userPost.service";
import { Request, Response } from "express";
import { CreateUserPost, ImageCreateMany } from "./userPost.type";

export const userPostController = {
	createPost: async function (
		req: Request<
			{},
			{},
			CreateUserPost & { images?: ImageCreateMany; links?: string[] }
		>,
		res: Response
	) {
		const userId = BigInt(res.locals.userId);
		const { images, links, ...data } = req.body;

		const imagesForService: string[] = images
			? images.map((img) => img.file)
			: [];

		const result = await userPostService.createPost(
			userId,
			data,
			imagesForService,
			links ?? []
		);
		res.json(result);
	},

	deletePost: async function (req: Request, res: Response) {
		const userId = BigInt(res.locals.userId);
		const data = req.body;
		const postId = BigInt(data.id);
		const result = await userPostService.deletePost(userId, postId);
		res.json(result);
	},

	updatePost: async function (
		req: Request<
			{},
			{},
			{
				postId: string | number;
				images?: ImageCreateMany;
			} & Partial<CreateUserPost>
		>,
		res: Response
	) {
		const userId = BigInt(res.locals.userId);
		const { postId, images, ...data } = req.body;
		const postIdBigInt = BigInt(postId);

		const imagesForService: string[] = images
			? images.map((img) => img.file)
			: [];

		const result = await userPostService.updatePost(
			userId,
			postIdBigInt,
			data,
			imagesForService
		);
		res.json(result);
	},

	getPostById: async function (req: Request, res: Response) {
		const id = BigInt(req.params.id);
		const result = await userPostService.getPostById(id);
		res.json(result);
	},

	getAllPosts: async function (req: Request, res: Response) {
		const result = await userPostService.getAllPosts();
		res.json(result);
	},

	getMyPosts: async function (req: Request, res: Response) {
		const userId = BigInt(res.locals.userId);
		const result = await userPostService.getMyPosts(userId);
		res.json(result);
	},
};
