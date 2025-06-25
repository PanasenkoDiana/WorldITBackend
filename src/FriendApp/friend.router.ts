import { Router } from "express";
import { friendController } from "./friend.controller";
import { authTokenMiddleware } from "../middlewares/authMiddlewares";

const friendRouter = Router() 

friendRouter.get("/", authTokenMiddleware, friendController.getAllFriends)
friendRouter.get("/requests", authTokenMiddleware, friendController.getRequests)
friendRouter.get("/myRequests", authTokenMiddleware, friendController.getMyRequests)
friendRouter.get("/recommends", authTokenMiddleware, friendController.getRecommends)

friendRouter.post("/send", authTokenMiddleware, friendController.sendRequest)
friendRouter.post("/accept", authTokenMiddleware, friendController.acceptRequest)
friendRouter.post("/cancel", authTokenMiddleware, friendController.cancelRequest)
friendRouter.post("/delete", authTokenMiddleware, friendController.deleteFriend)

export default friendRouter