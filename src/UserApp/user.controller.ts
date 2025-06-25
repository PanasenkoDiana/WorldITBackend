import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service";

export const UserController = {
    createUser: async function(req: Request, res: Response) {
        const data = req.body;
        const result = await UserService.createUser(data);
        res.json(result);
    },

    findUserByEmail: async function(req: Request, res: Response) {
        const data = req.body;
        // Пока закомментировано, так как метод не используется
        // const result = await UserService.findUserByEmail(data.email, data);
        // res.json(result);
    },

    authUser: async function(req: Request, res: Response) {
        const { email, password } = req.body;
        const result = await UserService.authUser(email, password);
        res.json(result);
    },

    findUserById: async function(req: Request, res: Response) {
        const id = res.locals.userId;
        const result = await UserService.getUserByid(id);
        res.json(result);
    },

    verifyUser: async function(req: Request, res: Response) {
        const { email, code } = req.body;
        const result = await UserService.verifyUser(email, code);
        res.json(result);
    },

    secondRegister: async function(req: Request, res: Response) {
        const id = +req.params.id;
        const data = req.body;
        const result = await UserService.secondRegister(data, id);
        res.json(result);
    },

    changeUserPartOne: async function(req: Request, res: Response, next: NextFunction) {
        try {
            const id = res.locals.userId;
            const data = req.body;
            const result = await UserService.changeUserPartOne(data, id);
            res.json(result);
        } catch (err) {
            next(err);
        }
    },

    changeUserPartTwo: async function(req: Request, res: Response, next: NextFunction) {
        try {
            const id = res.locals.userId;
            const data = req.body;
            const result = await UserService.changeUserPartTwo(data, id);
            res.json(result);
        } catch (err) {
            next(err);
        }
    },

    addMyPhoto: async function(req: Request, res: Response, next: NextFunction) {
        try {
            const id = +res.locals.userId;
            const data = req.body;
            const result = await UserService.addMyPhoto(data, id);
            res.json(result);
        } catch (err) {
            next(err);
        }
    },

    deleteMyPhoto: async function(req: Request, res: Response, next: NextFunction) {
        try {
            const id = +res.locals.userId;
            const data = req.body;
            const result = await UserService.deleteMyPhoto(data.id);
            res.json(result);
        } catch (err) {
            next(err);
        }
    },

    changePasswordPartOne: async function(req: Request, res: Response, next: NextFunction) {
        try {
            const id = +res.locals.userId

            const result = await UserService.changePasswordPartOne(id)
            res.json(result);
        } catch(err){
            next(err);
        }
    },

    changePasswordPartTwo: async function(req: Request, res: Response, next: NextFunction) {
        try {
            const code = req.body.code
            const password = req.body.password
            const id = +res.locals.userId

            const result = await UserService.changePasswordPartTwo(code, id, password)
            res.json(result);
        } catch(err){
            next(err);
        }
    },

    getMyPhotos: async function(req: Request, res: Response, next: NextFunction) {
        try {
            const id = +res.locals.userId
            const result = await UserService.getMyPhotos(id)

            res.json(result)
            
        } catch(err){
            next(err);
        }
    },

    getRecipient: async function(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.body.id

            const result = await UserService.getUserByid(id)

            res.json(result)

        } catch(err){
            next(err)
        }
    } 
};
