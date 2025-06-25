// user.controller.ts
import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service";

export const UserController = {
  createUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const result = await UserService.createUser(data);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  findUserByEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const result = await UserService.findUserByEmail(email);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  authUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await UserService.authUser(email, password);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  findUserById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = res.locals.userId;
      const result = await UserService.findUserById(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  verifyUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, code } = req.body;
      const result = await UserService.verifyUser(email, code);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  secondRegister: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const data = req.body;
      const result = await UserService.secondRegister(data, id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  changeUserPartOne: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = res.locals.userId;
      const { filename } = req.body;
      const result = await UserService.changeUserPartOne(filename, id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  changeUserPartTwo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = res.locals.userId;
      const data = req.body;
      const result = await UserService.changeUserPartTwo(data, id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  addMyPhoto: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = res.locals.userId;
      const { filename } = req.body;
      const result = await UserService.addMyPhoto(filename, id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  deleteMyPhoto: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.body;
      const result = await UserService.deleteMyPhoto(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  changePasswordPartOne: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = res.locals.userId;
      const result = await UserService.changePasswordPartOne(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  changePasswordPartTwo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = res.locals.userId;
      const { code, password } = req.body;
      const result = await UserService.changePasswordPartTwo(code, id, password);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  getMyPhotos: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = res.locals.userId;
      const result = await UserService.getMyPhotos(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  getRecipient: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.body;
      const result = await UserService.findUserById(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
