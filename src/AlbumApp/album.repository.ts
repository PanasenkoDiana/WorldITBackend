import { AddPhotoToAlbum, CreateAlbumInput } from "./album.type";
import { prismaClient } from "../prisma/client";

export const AlbumRepository = {
  getAllAlbums: async function (author_id: bigint) {
    try {
      const albums = await prismaClient.post_app_album.findMany({
        where: { author_id },
        include: {
          post_app_tag: true,
          post_app_album_images: {
            include: { post_app_image: true },
          },
        },
      });
      return albums;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  changeAlbum: async function (data: CreateAlbumInput, albumId: bigint) {
    try {
      let topicId: bigint | undefined = undefined;

      if (data.topic) {
        const tag = await prismaClient.post_app_tag.upsert({
          where: {
            name: typeof data.topic === "string" ? data.topic : data.topic.name,
          },
          update: {},
          create: {
            name: typeof data.topic === "string" ? data.topic : data.topic.name,
          },
        });
        topicId = tag.id;
      }

      const dataToUpdate: any = {
        name: data.name,
      };

      if (topicId !== undefined) {
        dataToUpdate.topic_id = topicId;
      } else {
        dataToUpdate.topic_id = null; // если нужно снять связь с темой
      }

      const changedAlbum = await prismaClient.post_app_album.update({
        where: { id: albumId },
        data: dataToUpdate,
        include: {
          post_app_tag: true,
          post_app_album_images: {
            include: { post_app_image: true },
          },
        },
      });

      return changedAlbum;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  addPhotoToAlbum: async function (data: AddPhotoToAlbum, albumId: bigint) {
    try {
      const image = await prismaClient.post_app_image.create({
        data: {
          filename: data.filename,
          file: data.file,
          uploaded_at: new Date(),
        },
      });

      const updatedAlbum = await prismaClient.post_app_album.update({
        where: { id: albumId },
        data: {
          post_app_album_images: {
            create: { image_id: image.id },
          },
        },
        include: {
          post_app_tag: true,
          post_app_album_images: {
            include: { post_app_image: true },
          },
        },
      });

      return updatedAlbum;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  createAlbum: async function (data: CreateAlbumInput, author_id: bigint) {
    try {
      let topicId: bigint | undefined = undefined;

      if (data.topic) {
        const tag = await prismaClient.post_app_tag.upsert({
          where: {
            name: typeof data.topic === "string" ? data.topic : data.topic.name,
          },
          update: {},
          create: {
            name: typeof data.topic === "string" ? data.topic : data.topic.name,
          },
        });
        topicId = tag.id;
      }

      const dataToCreate: any = {
        author_id,
        name: data.name,
        shown: true,
        created_at: new Date(),
      };

      if (topicId !== undefined) {
        dataToCreate.topic_id = topicId;
      }

      const album = await prismaClient.post_app_album.create({
        data: dataToCreate,
        include: {
          post_app_tag: true,
          post_app_album_images: {
            include: { post_app_image: true },
          },
        },
      });

      return album;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  deleteAlbumImage: async function (imageId: bigint) {
    try {
      await prismaClient.post_app_album_images.deleteMany({
        where: { image_id: imageId },
      });

      const deletedImage = await prismaClient.post_app_image.delete({
        where: { id: imageId },
      });

      return deletedImage;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  deleteAlbum: async function (albumId: bigint) {
    try {
      await prismaClient.post_app_album_images.deleteMany({
        where: { album_id: albumId },
      });

      await prismaClient.post_app_album.delete({
        where: { id: albumId },
      });

      return "album deleted";
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};
