import {
	CreateUser,
	secondRegister,
	changeUserPartOne,
	changeUserPartTwo,
	createMyPhotoCredentials,
	User,
	Avatar,
	// Avatar,
} from "./user.type";
import { UserRepositories } from "./user.repository";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { SECRET_KEY } from "../config/token";
import { VerificationService } from "../core/verification.service";
import { EmailService } from "../core/email.service";
import { base64ToImage } from "../tools/base64ToImage";
import { Result, success, error } from "../tools/result";

const verificationService = new VerificationService(EmailService);

export const UserService = {
	createUser: async (data: CreateUser): Promise<Result<string>> => {
		const existing = await UserRepositories.findUserByEmail(data.email);
		if (existing) return error("User already exists");

		const sent = await verificationService.generateAndSendCode(
			data.email,
			data
		);
		if (!sent) return error("Email not sent");

		return success("Verification code sent");
	},

	verifyUser: async (
		email: string,
		code: string
	): Promise<Result<string>> => {
		const userData = await verificationService.verifyCode(email, code);
		if (!userData) return error("Invalid verification code");

		const hashedPassword = await hash(userData.password, 10);
		const newUser = await UserRepositories.createUser({
			...userData,
			password: hashedPassword,
		});
		if (!newUser) return error("User creation failed");

		const token = sign({ id: newUser.id }, SECRET_KEY, { expiresIn: "1d" });
		return success(token);
	},

	authUser: async (
		email: string,
		password: string
	): Promise<Result<string>> => {
		const user = await UserRepositories.findUserByEmail(email);
		if (!user) return error("User not found");

		const isMatch = await compare(password, user.password);
		if (!isMatch) return error("Incorrect password");

		const token = sign({ id: user.id }, SECRET_KEY, { expiresIn: "1d" });
		return success(token);
	},

	findUserById: async (id: number): Promise<Result<User>> => {
		const user = await UserRepositories.findUserById(id);
		if (!user) return error("User not found");
		return success(user);
	},

	secondRegister: async (
		data: secondRegister,
		id: number
	): Promise<Result<User>> => {
		const user = await UserRepositories.secondRegister(data, id);
		if (!user) return error("User not found");
		return success(user);
	},

	changeUserPartOne: async (
		image: string | undefined,
		id: number,
		username: string
	): Promise<Result<User>> => {
		let file
		if (image && image.startsWith("data:image")) {
			file = await base64ToImage(image);
		}

		const user = await UserRepositories.changeUserPartOne(
			file?.filename || "",
			id,
			username
		);
		if (!user) return error("User not found");
		return success(user);
	},

	changeUserPartTwo: async (
		data: changeUserPartTwo,
		id: number
	): Promise<Result<User>> => {
		if (data.password) {
			data.password = await hash(data.password, 10);
		}

		const user = await UserRepositories.changeUserPartTwo(data, id);
		if (!user) return error("User not found");
		return success(user);
	},

	addMyPhoto: async (
		data: createMyPhotoCredentials,
		id: number
	): Promise<Result<string>> => {
		if (!data.image?.startsWith("data:image")) {
			return error("Invalid image data");
		}

		const { file, filename } = await base64ToImage(data.image);
		const result = await UserRepositories.addMyPhoto(filename!, id);
		if (!result) return error("Photo not created");

		return success("Photo added");
	},

	deleteMyPhoto: async (id: number): Promise<Result<string>> => {
		try {
			const user = await UserRepositories.deleteMyPhoto(id);
			if (!user) return error("Photo not found");
			return success("Photo deleted");
		} catch {
			return error("Delete photo error");
		}
	},

	changePasswordPartOne: async function (
		userId: number
	): Promise<Result<string>> {
		const user = await UserRepositories.findUserById(userId);

		if (!user) {
			return {
				status: "error",
				message: "user don't found",
			};
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
		userId: number,
		password: string
	) {
		const user = await UserRepositories.findUserById(userId);

		if (!user) {
			return {
				status: "error",
				message: "user don't found",
			};
		}

		const userData = await verificationService.verifyCode(user.email, code);
		if (!userData) {
			return {
				status: "error",
				message: "Invalid or expired verification code",
			};
		}

		const hashedPassword = await hash(password, 10);
		const changePassword = await UserRepositories.changePassword(
			hashedPassword,
			userId
		);

		return { status: "success", data: "Verification code sent" };
	},

	getMyPhotos: async (userId: number): Promise<Result<Avatar[]>> => {
		const user = await UserRepositories.findUserById(userId);
		if (!user) return error("User not found");

		const avatars = user.user_app_profile?.user_app_avatar;
		if (!avatars || avatars.length === 0) return error("Avatars not found");

		return success(avatars);
	},
};
