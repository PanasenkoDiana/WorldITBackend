import { Request, Response } from "express"
import { AlbumService } from "./album.service"

export const AlbumController = {
    getAllAlbums: async function(req: Request, res: Response){
        const id = res.locals.userId as string | number | bigint
        const result = await AlbumService.getAllAlbums(typeof id === "bigint" ? id : BigInt(id))

        res.json(result)
    },

    changeAlbum: async function(req:  Request, res: Response){
        const id = req.params.id
        const data = req.body
        const result = await AlbumService.changeAlbum(data, BigInt(id))

        res.json(result)
    },

    addPhotoToAlbum: async function(req: Request, res: Response){
        const id = req.params.id
        const data = req.body
        const result = await AlbumService.addPhotoToAlbum(data, BigInt(id))

        res.json(result)
    },

    createAlbum: async function(req: Request, res: Response){
        const id = res.locals.userId as string | number | bigint
        const data = req.body
        const result = await AlbumService.createAlbum(data, typeof id === "bigint" ? id : BigInt(id))

        res.json(result)
    },

    deleteAlbumImage: async function(req: Request, res: Response){
        const id = req.body.id
        const result = await AlbumService.deleteAlbumImage(BigInt(id))

        res.json(result)
    },

    deleteAlbum: async function(req: Request, res: Response){
        const data = req.body
        const result = await AlbumService.deleteAlbum(BigInt(data.id))

        res.json(result)
    },
}
