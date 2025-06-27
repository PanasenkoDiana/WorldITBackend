import { prismaClient } from "../prisma/client";
import {
	changeUserPartTwo,
	CreateUser,
	secondRegister,
	UpdateUser,
} from "./user.type";

export const UserRepositories = {
	createUser: async (data: CreateUser) => {
		if (!data.email) throw new Error("Email is required");

		const existingUser = await prismaClient.user.findFirst({
			where: { email: data.email },
		});

		if (existingUser) throw new Error("Email already in use");

		const count = await prismaClient.user.count();
		const username = `user${count + 1}`;

		const user = await prismaClient.user.create({
			data: {
				username,
				email: data.email,
				password: data.password,
				first_name: data.first_name || "",
				last_name: data.last_name || "",
				is_superuser: false,
				is_staff: false,
				is_active: true,
				date_joined: new Date(),
				last_login: null,
			},
		});

		await prismaClient.user_app_profile.create({
			data: {
				user_id: user.id,
				date_of_birth: new Date("1970-01-01"),
			},
		});

		return user;
	},

	findUserById: async (id: number) => {
		return prismaClient.user.findUnique({
			where: { id },
			include: {
				user_app_profile: {
					include: {
						user_app_avatar: true,
					},
				},
			},
		});
	},

	findUserByEmail: async (email: string) => {
		if (!email) return null;

		try {
			const user = await prismaClient.user.findFirst({
				where: { email },
				include: { user_app_profile: true },
			});

			return user || null;
		} catch (error) {
			console.error("Error in findUserByEmail:", error);
			return null;
		}
	},

	secondRegister: async (data: secondRegister, id: number) => {
		return prismaClient.user.update({
			where: { id },
			data: {
				first_name: data.first_name,
				last_name: data.first_name,
				username: data.username,
			},
			include: {
				user_app_profile: {
					include: {
						user_app_avatar: true,
					},
				},
			},
		});
	},

	changeUserPartOne: async (
		filename: string,
		id: number,
		username: string
	) => {
		const profile = await prismaClient.user_app_profile.findUnique({
			where: { user_id: id },
		});

		if (!profile) throw new Error("Profile not found");

		if (filename !== "") {
			await prismaClient.user_app_avatar.create({
				data: {
					profile_id: BigInt(profile.id),
					image: filename,
					active: true,
					shown: true,
				},
			});
		}

		const user = await prismaClient.user.update({
			where: { id },
			data: {
				username,
			},
			include: {
				user_app_profile: {
					include: {
						user_app_avatar: true,
					},
				},
			},
		});

		return user;
	},

	changeUserPartTwo: async (data: changeUserPartTwo, id: number) => {
		const updatedUser = await prismaClient.user.update({
			where: { id },
			data: {
				first_name: data.first_name,
				last_name: data.last_name,
				email: data.email,
				password: data.password,
			},
			include: {
				user_app_profile: { include: { user_app_avatar: true } },
			},
		});

		return updatedUser;
	},

	addMyPhoto: async (filename: string, id: number) => {
		const profile = await prismaClient.user_app_profile.findUnique({
			where: { user_id: id },
		});

		if (!profile) throw new Error("Profile not found");

		await prismaClient.user_app_avatar.create({
			data: {
				profile_id: profile.id,
				image: filename,
				active: false,
				shown: true,
			},
		});

		return "new photo added";
	},

	deleteMyPhoto: async (id: number) => {
		const avatar = await prismaClient.user_app_avatar.findUnique({
			where: { id },
		});
		if (!avatar) throw new Error("Avatar not found");

		await prismaClient.user_app_avatar.delete({ where: { id } });
		return avatar.image;
	},

	changePassword: async (password: string, userId: number) => {
		await prismaClient.user.update({
			where: { id: userId },
			data: { password },
		});
		return "Password changed successfully";
	},

	changeUsername: async (userId: number, username: string) => {
		await prismaClient.user.update({
			where: { id: userId },
			data: { username },
		});

		return "username changed";
	},

	findRecipientByProfileId: async (id: number) => {
		const profile = await prismaClient.user_app_profile.findFirst({
			where: {
				id: id
			},
			include: {
				auth_user: true,
				user_app_avatar: true
			},
		});

		return profile
	},
};
