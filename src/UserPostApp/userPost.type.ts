import { Prisma } from "../generated/prisma";



export type CreateUserPost = {
    title: string;
    content: string;
    topic: string;
    tags?: Array<string | { name: string }>;
};

export type ImageCreateMany = {
    filename: string;
    file: string;
    uploaded_at: Date;
}[];

export type UserPost = Prisma.post_app_postGetPayload<{
    include: {
        post_app_post_tags: {
            include: { post_app_tag: true }
        },
        post_app_link: true,
        post_app_post_images: {
            include: { post_app_image: true }
        },
        user_app_profile: {
            include: {
                user_app_avatar: true
            }
        }
    }
}>;

export type UpdateUserPost = {
    title?: string;
    content?: string;
    topic?: string;
    // images handled separately
};

export type UserPostWithoutIncludes = Prisma.post_app_postGetPayload<{}>;

export type CreateImage = Prisma.post_app_imageCreateInput;
export type Tag = Prisma.post_app_tagGetPayload<{}>;
export type CreateTag = Prisma.post_app_tagCreateInput;
export type Image = Prisma.post_app_imageGetPayload<{}>;