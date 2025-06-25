import { Router } from "express";
import { authTokenMiddleware } from "../middlewares/authMiddlewares";
import { tagController } from "./tag.controller";

const tagRouter = Router();

tagRouter.post("/findOrCreate", tagController.findOrCreate);

tagRouter.get('/all', tagController.getAllTags)

export default tagRouter;
