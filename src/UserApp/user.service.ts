import {
	changeUserPartOne,
	changeUserPartTwo,
	createMyPhoto,
	CreateUser,
	IError,
	ISuccess,
	secondRegister,
	User,
	UserWithoutIncludes,
	Avatar
} from "./user.type";
import { UserRepositories } from "./user.repository";
import { sign } from "jsonwebtoken";
import { compare, hash } from "bcryptjs";
import { SECRET_KEY } from "../config/token";
import { EmailService } from "../core/email.service";
import { VerificationService } from "../core/verification.service";
import { base64ToImage } from "../tools/base64ToImage";
import { userPostRepository } from "../UserPostApp/userPost.repository";

const verificationService = new VerificationService(EmailService);

export const UserService = {
	createUser: async function (
		data: CreateUser
	): Promise<IError | ISuccess<string>> {
		const existingUserByEmail = await UserRepositories.findUserByEmail(
			data.email
		);
		if (existingUserByEmail) {
			return {
				status: "error",
				message: "User with this email already exists",
			};
		}

		const emailSent = await verificationService.generateAndSendCode(
			data.email,
			data
		);	
		if (!emailSent) {
			return {
				status: "error",
				message: "Failed to send verification email",
			};
		}

		return { status: "success", data: "Verification code sent" };
	},

	secondRegister: async function (
		data: secondRegister,
		id: number
	): Promise<IError | ISuccess<User>> {
		const user = await UserRepositories.secondRegister(data, id);
		if (!user) {
			return { status: "error", message: "User not found" };
		}
		
		return { status: "success", data: user };
	},

	verifyUser: async function (
		email: string,
		code: string
	): Promise<IError | ISuccess<string>> {
		const userData = await verificationService.verifyCode(email, code);
		if (!userData) {
			return {
				status: "error",
				message: "Invalid or expired verification code",
			};
		}

		const hashedPassword = await hash(userData.password, 10);
		const newUser = await UserRepositories.createUser({
			...userData,
			password: hashedPassword,
		});
		if (!newUser) {
			return { status: "error", message: "Failed to create user" };
		}

		const token = sign({ id: newUser.id }, SECRET_KEY, { expiresIn: "1d" });
		return { status: "success", data: token };
	},

	authUser: async function (
		email: string,
		password: string
	): Promise<IError | ISuccess<string>> {
		const user = await UserRepositories.findUserByEmail(email);
		if (!user) {
			return { status: "error", message: "User not found" };
		}

		const isMatch = await compare(password, user.password);
		if (!isMatch) {
			return { status: "error", message: "Incorrect password" };
		}

		const token = sign({ id: user.id }, SECRET_KEY, { expiresIn: "1d" });
		return { status: "success", data: token };
	},

	getUserByid: async function (id: number): Promise<IError | ISuccess<UserWithoutIncludes>> {
		const user = await UserRepositories.findUserById(id);
		if (!user) {
			return { status: "error", message: "User not found" };
		}

		return { status: "success", data: user };
	},

	changeUserPartOne: async function (
		data: changeUserPartOne,
		id: number
	): Promise<IError | ISuccess<string>> {

		if (data.profileImage) {

			if (!data.profileImage?.startsWith("data:image")) {
				return { status: "error", message: "Invalid image data" };
			}



			const {filename}  = await base64ToImage(data.profileImage);
			// if (!filename) {
			// 	return { status: "error", message: "Invalid image data" };
			// }

			const user = await UserRepositories.changeUserPartOne(filename, id);

			if (!user) return { status: "error", message: "User not found" };
		}

		if (data.username) {
			const user = await UserRepositories.changeUsername(id, data.username)

			if (!user) return { status: "error", message: "User not found" };
			
		}

		return { status: "success", data: 'changed user' };
	},

	changeUserPartTwo: async function (
		data: changeUserPartTwo,
		id: number
	): Promise<IError | ISuccess<string>> {


		if (data.password) {
			data.password = await hash(data.password, 10);
		}

		const user = await UserRepositories.changeUserPartTwo(data, id);
		if (!user) {
			return { status: "error", message: "User not found" };
		}

		return { status: "success", data: user };
	},

	addMyPhoto: async function (
		data: createMyPhoto,
		id: number
	): Promise<IError | ISuccess<string>> {
		try {
			if (!data.image.startsWith("data:image")) {
                return { status: "error", message: "image not in format" }
            }
            const {filename} = await base64ToImage(data.image);

            if (!filename) {
                return { status: "error", message: "Invalid image data" };
            }

			const user = await UserRepositories.addMyPhoto(filename, id);
			if (!user) {
				return { status: "error", message: "photo don't created found" };
			}

			return { status: "success", data: user };
		} catch {
			return {
				status: "error",
				message: "create photo error",
			};
		}
	},

	deleteMyPhoto: async function (
		// photoId: number,
		id: number
	): Promise<IError | ISuccess<string>> {
		try {

			const user = await UserRepositories.deleteMyPhoto(id);
			if (!user) {
				return { status: "error", message: "photo don't created found" };
			}

			return { status: "success", data: user };
		} catch {
			return {
				status: "error",
				message: "create photo error",
			};
		}
	},

	changePasswordPartOne: async function (
		userId: number

	): Promise<IError | ISuccess<string>> {

		const user  = await UserRepositories.findUserById(userId) 


		if (!user) {
			return {
				status: "error",
				message: "user don't found",
			}
		}

		const emailSent = await verificationService.generateAndSendCode(
			user.email,
			user
		);	
		if (!emailSent) {
			return {
				status: "error",
				message: "Failed to send verification email",
			};
		}

		return { status: "success", data: "Verification code sent" };
	},

	changePasswordPartTwo: async function (
		code: string,
		userId : number,
		password: string,
	) {

		const user  = await UserRepositories.findUserById(userId) 


		if (!user) {
			return {
				status: "error",
				message: "user don't found",
			}
		}


		const userData = await verificationService.verifyCode(user.email, code);
		if (!userData) {
			return {
				status: "error",
				message: "Invalid or expired verification code",
			};
		}

		const hashedPassword = await hash(password, 10);
		const changePassword = await UserRepositories.changePassword(hashedPassword, userId)

		return { status: "success", data: "Verification code sent" };
		
	},

	getMyPhotos: async function(userId: number): Promise<ISuccess<Avatar[]> | IError> {
		const user  = await UserRepositories.findUserById(userId) 

		if (!user) {
			return {
				status: "error",
				message: "user don't found",
			}
		}

		const userAvatars = user.Profile?.avatars

		if (!userAvatars){
			return {
				status: "error",
				message: "avatars don't found",
			}
		}



		return { status: "success", data: userAvatars };
	}
};
