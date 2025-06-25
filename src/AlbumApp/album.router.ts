import { Router } from "express";
import { authTokenMiddleware } from "../middlewares/authMiddlewares";
import { AlbumController } from "./album.controller";

const albumRouter = Router()

albumRouter.get("/all", authTokenMiddleware, AlbumController.getAllAlbums ) // надо id пользователя
albumRouter.patch("/change/:id", AlbumController.changeAlbum ) // надо id альбома
albumRouter.post("/add/:id", AlbumController.addPhotoToAlbum ) //надо id альбома
albumRouter.post("/create", authTokenMiddleware, AlbumController.createAlbum )  // надо id пользователя
albumRouter.delete("/delete/image", authTokenMiddleware ,AlbumController.deleteAlbumImage ) // надо id альбома
albumRouter.delete("/delete", authTokenMiddleware, AlbumController.deleteAlbum ) // надо id пользователя

export default albumRouter