import { Router } from "express";
import { authTokenMiddleware } from "../middlewares/authMiddlewares";
import { UserController } from "./user.controller";

const userRouter = Router();

userRouter.post("/register/start", UserController.createUser);
userRouter.post("/register/confirm", UserController.createUser);
userRouter.post("/login", UserController.authUser);

userRouter.get("/me", authTokenMiddleware, UserController.findUserById);

userRouter.post("/register/second/:id", UserController.secondRegister);

userRouter.post("/change/part-one", authTokenMiddleware, UserController.changeUserPartOne);
userRouter.post("/change/part-two", authTokenMiddleware, UserController.changeUserPartTwo);

userRouter.post("/photo/create", authTokenMiddleware, UserController.addMyPhoto);
userRouter.delete("/photo/delete", authTokenMiddleware, UserController.deleteMyPhoto);

userRouter.post("/change-password/one", authTokenMiddleware, UserController.changePasswordPartOne)
userRouter.post("/change-password/two", authTokenMiddleware, UserController.changePasswordPartTwo)
// userRouter.post("/change-username", authTokenMiddleware, UserController.changeUsername);

export default userRouter;
