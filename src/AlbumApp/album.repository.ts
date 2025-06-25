import { AddPhotoToAlbum, AddPhotoToAlbumCredentials, Album, CreateAlbum, CreateAlbumInput } from "./album.type"
import { create } from "ts-node"
import { prismaClient } from "../prisma/client"
import { connect } from "http2"


export const AlbumRepository = {
    getAllAlbums: async function(id: number) {
        try {
            const albums = await prismaClient.album.findMany({
                where: {
                    userId: id
                },
                include: {
                    images: true,
                    topic: true,
                }
            })
            return albums
        } catch(error) {
            console.log(error)
        }
    },

    changeAlbum: async function(data: CreateAlbumInput, id: number) {
        try {
            const changedAlbum = await prismaClient.album.update({
                where: { id },
                data: {
                    name: data.name,
                    topic: data.topic
                        ? {
                                connectOrCreate: {
                                    where: { name: data.topic as string }, // <- string
                                    create: { name: data.topic as string }, // <- string
                                },
                        }
                        : undefined,
                },
                include: {
                    images: true,
                    topic: true, // если нужно вернуть
                },
            });

            return changedAlbum;
        } catch (error) {
            console.log(error);
        }
    },


    addPhotoToAlbum: async function(data: { file: string, filename: string }, id: number) {
        try {
            const album = await prismaClient.album.update({
                where: { id },
                data: {
                    images: {
                        create: {
                            file: data.file,
                            filename: data.filename,
                        },
                    },
                },
                include: {
                    images: true,
                    topic: true,
                },
            });

            return album;
        } catch (error) {
            console.log(error);
        }
    },


    createAlbum: async function(data: CreateAlbumInput, userId: number) {
        try {

            const album = await prismaClient.album.create({
                data: {
                    user: { connect: { id: userId } },  // связываем пользователя через вложенный объект
                    name: data.name,
                    topic: data.topic
                        ? {
                                connectOrCreate: {
                                    where: { name: data.topic as string }, // <- string
                                    create: { name: data.topic as string }, // <- string
                                },
                        }
                        : undefined,    // используем сформированный объект
                },
                include: {
                    topic: true,
                    images: true,
                },
            });

            return album;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    deleteAlbumImage: async function(id: number) {
        try {
            const deletedAlbum = await prismaClient.image.delete({
                where: { id },
            });

            return deletedAlbum;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    deleteAlbum: async function(id: number) {
        try {
            const deletedAlbum = await prismaClient.album.delete({
                where: { id: id },
            });

            return 'album deleted';
        } catch (error) {
            console.error(error);
            throw error;
        }   
    }






}