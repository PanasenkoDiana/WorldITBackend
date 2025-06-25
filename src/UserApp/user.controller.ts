import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service";

function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "bigint") {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }

  if (typeof obj === "object") {
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = serializeBigInt(obj[key]);
      }
    }
    return newObj;
  }

  return obj;
}

export const UserController = {
  startRegister: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const message = await UserService.startRegister(req.body);
      res.json({ message });
    } catch (err) {
      next(err);
    }
  },

  confirmRegister: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, code } = req.body;
      const user = await UserService.confirmRegister(email, code);
      res.json(serializeBigInt(user));
    } catch (err) {
      next(err);
    }
  },

  authUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const token = await UserService.authUser(email, password);
      res.json({ token });
    } catch (err) {
      next(err);
    }
  },

  findUserById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = res.locals.userId;
      const user = await UserService.findUserById(id);
      res.json(serializeBigInt(user));
    } catch (err) {
      next(err);
    }
  },

  secondRegister: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const updatedUser = await UserService.secondRegister(req.body, id);
      res.json(serializeBigInt(updatedUser));
    } catch (err) {
      next(err);
    }
  },

  changeUserPartOne: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = res.locals.userId;
      const { filename } = req.body;
      const result = await UserService.changeUserPartOne(filename, id);
      res.json({ message: result });
    } catch (err) {
      next(err);
    }
  },

  changeUserPartTwo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = res.locals.userId;
      const result = await UserService.changeUserPartTwo(req.body, id);
      res.json(serializeBigInt(result));
    } catch (err) {
      next(err);
    }
  },

  addMyPhoto: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = res.locals.userId;
      const { filename } = req.body;
      const result = await UserService.addMyPhoto(filename, id);
      res.json({ message: result });
    } catch (err) {
      next(err);
    }
  },

  deleteMyPhoto: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.body;
      const filename = await UserService.deleteMyPhoto(id);
      res.json({ deletedFilename: filename });
    } catch (err) {
      next(err);
    }
  },

  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = res.locals.userId;
      const { password } = req.body;
      await UserService.changePassword(password, id);
      res.json({ message: "Password changed" });
    } catch (err) {
      next(err);
    }
  },

  changeUsername: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = res.locals.userId;
      const { username } = req.body;
      const result = await UserService.changeUsername(id, username);
      res.json({ message: result });
    } catch (err) {
      next(err);
    }
  },
};
