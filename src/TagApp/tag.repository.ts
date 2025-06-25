import { prismaClient } from "../prisma/client";
import { Result } from "../tools/result";
import { CreateTag, Tag, TagWithoutId } from "./tag.type";

export const tagRepository = {
  createTag: async function (name: string): Promise<Tag> {
    try {
      const tag = await prismaClient.post_app_tag.create({
        data: {
          name,
        },
      });
      return tag;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  findTagByName: async function (name: string): Promise<Tag | null> {
    try {
      const tag = await prismaClient.post_app_tag.findUnique({ 
        where: {
          name,
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
      const tags = await prismaClient.post_app_tag.findMany({
        select: {
          name: true,
        },
      });
      return tags;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};
