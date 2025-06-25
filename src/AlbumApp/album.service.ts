import { base64ToImage } from "../tools/base64ToImage";
import { error } from "../tools/result";
import { IError, ISuccess } from "../UserApp/user.type";
import { AlbumRepository } from "./album.repository";
import { AddPhotoToAlbum, AddPhotoToAlbumCredentials, Album, CreateAlbum, CreateAlbumInput } from "./album.type";




export const AlbumService = {
    getAllAlbums: async function(
        id: number
    ): Promise<IError | ISuccess<Album[]>> {
        const albums = await AlbumRepository.getAllAlbums(
            id
        )

        if (!albums) { 
            return { status: "error", message: "Albums not found" } 
        }

        return { status: 'success', data: albums }
    },

    changeAlbum: async function(
        data: CreateAlbumInput,
        id: number
    ): Promise<IError | ISuccess<Album>> {
        if (data.topic && typeof data.topic === "string" && !data.topic.startsWith("#")) {
            data = {
                ...data,
                topic: `#${data.topic}`,
            };
        }

        const changedAlbum  = await AlbumRepository.changeAlbum(data, id)

        if (!changedAlbum) {
            return { status: "error", message: "Album change error" }
        }

        return { status: 'success', data: changedAlbum }
    },

    addPhotoToAlbum: async function(
        data: { image: string },
        id: number
    ): Promise<IError | ISuccess<Album>> {
        try {
            if (!data.image.startsWith("data:image")) {
                return { status: "error", message: "image not in format" }
            }
            const { file, filename } = await base64ToImage(data.image);

            if (!file || !filename) {
                return { status: "error", message: "Invalid image data" };
            }

            const album = await AlbumRepository.addPhotoToAlbum({ file, filename }, id);
            
            if (!album) {
                return { status: "error", message: "Album not found" };
            }

            return { status: "success", data: album };
        } catch {
            return {
                status: "error",
                message: "Photo don't added to album",
            };
        }
    },

    createAlbum: async function (
        data: CreateAlbumInput,
        id: number
    ): Promise<IError | ISuccess<Album>> {
        if (data.topic && typeof data.topic === "string" && !data.topic.startsWith("#")) {
            data = {
                ...data,
                topic: `#${data.topic}`,
            };
        }

        const newAlbum = await AlbumRepository.createAlbum(data, id);

        if (!newAlbum) {
            return { status: "error", message: "Album don't create" };
        }
        return { status: "success", data: newAlbum };
    },

    deleteAlbumImage: async function(
        id: number
    ) : Promise<IError | ISuccess<string>> {
        const deletedAlbum = await AlbumRepository.deleteAlbumImage(id);

        if (!deletedAlbum) {
            return { status: "error", message: "Album not found" };
        }

        return { status: 'success', data: 'Photo in album deleted' }
    },

    deleteAlbum: async function(
        id: number
    ): Promise<IError | ISuccess<string>> {
        const deletedAlbum = await AlbumRepository.deleteAlbum(id);

        if (!deletedAlbum) {
            return { status: "error", message: "Album not found" };
        }

        return { status: 'success', data: deletedAlbum }
    },

}