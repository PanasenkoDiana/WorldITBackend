import { tagRepository } from "./tag.repository"
import { TagWithoutId, Tag } from "./tag.type";

import { success, error } from "../tools/result";

export const tagService = {
    findOrCreate: async function (data: TagWithoutId) {
        const tag = await tagRepository.findTagByName(data.name)
        if (tag) {
            return success<Tag>(tag)
        }

        const newTag = await tagRepository.createTag(data.name)
        if (!newTag) {
            return error()
        }
        return success<Tag>(newTag)
    },
    getAllTags: async function () {
        const tags = await tagRepository.getAllTags()
        if (!tags) {
            return error('tags not found')
        }
        return success<TagWithoutId[]>(tags)
    }
}