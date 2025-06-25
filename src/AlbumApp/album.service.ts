import { base64ToImage } from "../tools/base64ToImage";
import { IError, ISuccess } from "../UserApp/user.type";
import { AlbumRepository } from "./album.repository";
import { Album, CreateAlbumInput, AddPhotoToAlbum } from "./album.type";

export const AlbumService = {
  getAllAlbums: async function (
    author_id: bigint
  ): Promise<IError | ISuccess<Album[]>> {
    try {
      const albums = await AlbumRepository.getAllAlbums(author_id);

      if (!albums || albums.length === 0) {
        return { status: "error", message: "Albums not found" };
      }

      return { status: "success", data: albums };
    } catch (error) {
      return { status: "error", message: "Failed to fetch albums" };
    }
  },

  changeAlbum: async function (
    data: CreateAlbumInput,
    albumId: bigint
  ): Promise<IError | ISuccess<Album>> {
    try {
      // Добавляем '#' в начало топика, если нужно
      if (data.topic && typeof data.topic === "string" && !data.topic.startsWith("#")) {
        data = {
          ...data,
          topic: `#${data.topic}`,
        };
      }

      const changedAlbum = await AlbumRepository.changeAlbum(data, albumId);

      if (!changedAlbum) {
        return { status: "error", message: "Album change error" };
      }

      return { status: "success", data: changedAlbum };
    } catch (error) {
      return { status: "error", message: "Failed to change album" };
    }
  },

  addPhotoToAlbum: async function (
    data: { image: string },
    albumId: bigint
  ): Promise<IError | ISuccess<Album>> {
    try {
      if (!data.image.startsWith("data:image")) {
        return { status: "error", message: "Image not in valid format" };
      }

      const { file, filename } = await base64ToImage(data.image);

      if (!file || !filename) {
        return { status: "error", message: "Invalid image data" };
      }

      const album = await AlbumRepository.addPhotoToAlbum({ file, filename } as AddPhotoToAlbum, albumId);

      if (!album) {
        return { status: "error", message: "Album not found" };
      }

      return { status: "success", data: album };
    } catch {
      return { status: "error", message: "Photo not added to album" };
    }
  },

  createAlbum: async function (
    data: CreateAlbumInput,
    author_id: bigint
  ): Promise<IError | ISuccess<Album>> {
    try {
      if (data.topic && typeof data.topic === "string" && !data.topic.startsWith("#")) {
        data = {
          ...data,
          topic: `#${data.topic}`,
        };
      }

      const newAlbum = await AlbumRepository.createAlbum(data, author_id);

      if (!newAlbum) {
        return { status: "error", message: "Album not created" };
      }

      return { status: "success", data: newAlbum };
    } catch (error) {
      return { status: "error", message: "Failed to create album" };
    }
  },

  deleteAlbumImage: async function (
    imageId: bigint
  ): Promise<IError | ISuccess<string>> {
    try {
      const deletedImage = await AlbumRepository.deleteAlbumImage(imageId);

      if (!deletedImage) {
        return { status: "error", message: "Image not found" };
      }

      return { status: "success", data: "Photo in album deleted" };
    } catch (error) {
      return { status: "error", message: "Failed to delete photo" };
    }
  },

  deleteAlbum: async function (
    albumId: bigint
  ): Promise<IError | ISuccess<string>> {
    try {
      const result = await AlbumRepository.deleteAlbum(albumId);

      if (!result) {
        return { status: "error", message: "Album not found" };
      }

      return { status: "success", data: result };
    } catch (error) {
      return { status: "error", message: "Failed to delete album" };
    }
  },
};
