import { Prisma } from "../generated/prisma";

export type Image = Prisma.post_app_imageGetPayload<{}>;

export type Album = Prisma.post_app_albumGetPayload<{
  include: {
    post_app_tag: true;
    post_app_album_images: {
      include: {
        post_app_image: true;
      };
    };
  };
}>;

export type CreateAlbumInput = {
  name: string;
  author_id: bigint;
  topic?: string | { name: string };
};

export type CreateAlbum = Omit<
  Prisma.post_app_albumCreateInput,
  "post_app_album_images"
>;

export type AddPhotoToAlbum = Pick<Image, "filename" | "file">;

export type AddPhotoToAlbumCredentials = { image: string };
