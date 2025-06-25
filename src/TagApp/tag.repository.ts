import { prismaClient } from "../prisma/client";
import { Result } from "../tools/result";
import { CreateTag, Tag, TagWithoutId } from "./tag.type";

export const tagRepository = {
	createTag: async function (name: string): Promise<Tag> {
		try {
			const tag = prismaClient.tag.create({
				data: {
					name
				}
			});
			return tag;
		} catch (error) {
			console.log(error);
			throw error;
		}
	},
	findTagByNane: async function (name: string): Promise<Tag | null> {
		try {
			const tag = prismaClient.tag.findUnique({
				where: {
					name: name,
				},
			});
			return tag;
		} catch (error) {
			console.log(error);
			throw error;
		}
	},
	getAllTags: async function (): Promise<TagWithoutId[] | null> {
		try {
			const tags = prismaClient.tag.findMany({
				select: {
					name: true,
				},
			})
			return tags;
		} catch (error) {
			console.log(error);
			throw error;
		}

	},
}

