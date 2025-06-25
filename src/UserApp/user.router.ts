import { Router } from "express";
import { authTokenMiddleware } from "../middlewares/authMiddlewares";
import { UserController } from "./user.controller";

const userRouter = Router();

// 1) Первый шаг регистрации — отправляем код на почту
userRouter.post("/register/start", UserController.startRegister);

// 2) Второй шаг регистрации — подтверждаем код и создаём пользователя
userRouter.post("/register/confirm", UserController.confirmRegister);

// Остальные роуты

userRouter.post("/login", UserController.authUser);
// userRouter.post("/email", UserController.findUserByEmail);

userRouter.get("/me", authTokenMiddleware, UserController.findUserById);

userRouter.post("/register/second/:id", UserController.secondRegister);

userRouter.post("/change/part-one", authTokenMiddleware, UserController.changeUserPartOne);
userRouter.post("/change/part-two", authTokenMiddleware, UserController.changeUserPartTwo);

userRouter.post("/photo/create", authTokenMiddleware, UserController.addMyPhoto);
userRouter.delete("/photo/delete", authTokenMiddleware, UserController.deleteMyPhoto);

// userRouter.get("/photo/all", authTokenMiddleware, UserController.getMyPhotos);

userRouter.post("/change-password", authTokenMiddleware, UserController.changePassword);

userRouter.post("/change-username", authTokenMiddleware, UserController.changeUsername);

export default userRouter;
