import { Prisma } from "../generated/prisma";

export type Tag = Prisma.post_app_tagGetPayload<{}>;

export type TagWithoutId = Prisma.post_app_tagGetPayload<{
  omit: {
    id: true;
  };
}>;

export type CreateTag = Prisma.post_app_tagCreateInput;
