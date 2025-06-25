import { Prisma } from "../generated/prisma";

export type Tag = Prisma.TagGetPayload<{}>;

export type TagWithoutId = Prisma.TagGetPayload<{
    omit: {
        id: true
    }
}>;

export type CreateTag = Prisma.TagCreateInput;
