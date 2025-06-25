import { tagService } from "./tag.service";
import { TagWithoutId } from "./tag.type";
import { Request, Response } from 'express'

export const tagController = {
	findOrCreate: async function (req: Request, res: Response) {
		const data: TagWithoutId = req.body;
		const result = await tagService.findOrCreate(data);
		res.json(result);
	},
	getAllTags: async function (req: Request, res: Response) {
		const result = await tagService.getAllTags()
		res.json(result)
	}
};
