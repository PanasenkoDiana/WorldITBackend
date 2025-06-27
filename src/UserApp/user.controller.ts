import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service";
import { serializeBigInt } from "../tools/serializeBigInt";

export const UserController = {
	createUser: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const response = await UserService.createUser(req.body);
			res.json(response);
		} catch (err) {
			next(err);
		}
	},

	verifyUser: async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const { email, code } = req.body;
			const token = await UserService.verifyUser(email, code);
			res.json(token);
		} catch (err) {
			next(err);
		}
	},

	authUser: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { email, password } = req.body;
			const token = await UserService.authUser(email, password);
			res.json(token);
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

	changeUserPartOne: async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const id = res.locals.userId;
			const { profileImage, username } = req.body;
			console.log(req.body);
			const result = await UserService.changeUserPartOne(profileImage, id, username);
			res.json(serializeBigInt(result));
		} catch (err) {
			next(err);
		}
	},

	changeUserPartTwo: async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
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

	// changeUsername: async (req: Request, res: Response, next: NextFunction) => {
	// 	try {
	// 		const id = res.locals.userId;
	// 		const { username } = req.body;
	// 		const result = await UserService.changeUsername(id, username);
	// 		res.json({ message: result });
	// 	} catch (err) {
	// 		next(err);
	// 	}
	// },
};
