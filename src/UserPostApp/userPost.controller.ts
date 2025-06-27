import { userPostService } from "./userPost.service";
import { Request, Response } from "express";
import { CreateUserPost, ImageCreateMany } from "./userPost.type";

export function replaceBigInt(obj: any): any {
	return JSON.parse(
		JSON.stringify(obj, (_, value) =>
			typeof value === "bigint" ? value.toString() : value
		)
	);
}

export const userPostController = {
    createPost: async function (
        req: Request,
        res: Response
    ) {
        const userId = BigInt(res.locals.userId);
        const { images, links, ...data } = req.body;
        const allImages: string[] = images

        // Filter out any undefined, null, or empty string 'file' properties
        const imagesForService: string[] = allImages
            ? allImages
                  .map((img) => img)
                //   .filter((file): file is string => typeof file === "string" && file.length > 0)
            : [];

        const result = await userPostService.createPost(
            userId,
            data,
            imagesForService,
            links ?? []
        );
        res.json(replaceBigInt(result));
    },

    deletePost: async function (req: Request, res: Response) {
        const userId = BigInt(res.locals.userId);
        const data = req.body;
        const postId = BigInt(data.id);
        const result = await userPostService.deletePost(userId, postId);
        res.json(replaceBigInt(result));
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

        // Filter out any undefined, null, or empty string 'file' properties here too
        const imagesForService: string[] = images
            ? images
                  .map((img) => img.file)
                  .filter((file): file is string => typeof file === "string" && file.length > 0)
            : [];

        const result = await userPostService.updatePost(
            userId,
            postIdBigInt,
            data,
            imagesForService
        );
        res.json(replaceBigInt(result));
    },

	getPostById: async function (req: Request, res: Response) {
		const id = BigInt(req.params.id);
		const result = await userPostService.getPostById(id);
		res.json(replaceBigInt(result));
	},

	getAllPosts: async function (req: Request, res: Response) {
		const result = await userPostService.getAllPosts();
		res.json(replaceBigInt(result));
	},

	getMyPosts: async function (req: Request, res: Response) {
		const userId = BigInt(res.locals.userId);
		const result = await userPostService.getMyPosts(userId);
		res.json(replaceBigInt(result));
	},
};
