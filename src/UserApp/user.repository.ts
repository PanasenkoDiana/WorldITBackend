// user.repository.ts
import { prismaClient } from "../prisma/client";
import { changeUserPartTwo, CreateUser, secondRegister } from "./user.type";

export const UserRepositories = {
	createUser: async (data: CreateUser) => {
		const existingUser = await prismaClient.user.findUnique({
			where: { email: data.email },
		});
		if (existingUser) {
			throw new Error("Email already in use");
		}

		const count = await prismaClient.user.count();
		const username = `user${count + 1}`;

		const user = await prismaClient.user.create({
			data: {
				username,
				...data,
			},
		});

		await prismaClient.profile.create({
			data: {
				user: { connect: { id: user.id } },
				date_of_birth: new Date(),
			},
		});

		return user;
	},

	findUserById: async (id: number) =>
		prismaClient.user.findUnique({
			where: { id },
			include: {
				images: true,
				albums: { include: { images: true } },
				Profile: {
					include: {
						avatars: {
							include: {
								image: true,
							},
						},
					},
				},
			},
		}),

	findUserByEmail: async (email: string) =>
		prismaClient.user.findUnique({
			where: { email },
			include: {
				images: true,
				albums: { include: { images: true } },
				Profile: {
					include: {
						avatars: {
							include: {
								image: true,
							},
						},
					},
				},
			},
		}),

	secondRegister: async (data: secondRegister, id: number) =>
		prismaClient.user.update({
			where: { id },
			data: {
				name: data.name,
				surname: data.surname,
				username: data.username,
			},
			include: { images: true, albums: true },
		}),

	changeUserPartOne: async (filename: string, id: number) => {
		const profile = await prismaClient.profile.findUnique({
			where: { user_id: id },
		});
		if (!profile) throw new Error("Profile not found");

		await prismaClient.profile.update({
			where: { id: profile.id },
			data: {
				avatars: {
					create: {
						image: {
							create: {
								filename,
								file: filename,
							},
						},
					},
				},
			},
		});

		return "avatar changed";
	},

	changeUserPartTwo: async (data: changeUserPartTwo, id: number) => {
		await prismaClient.user.update({
			where: { id },
			data: {
				name: data.name,
				surname: data.surname,
				email: data.email,
				username: data.username,
				password: data.password,
			},
			include: {
				albums: true,
				Profile: {
					include: {
						avatars: {
							include: {
								image: true,
							},
						},
					},
				},
			},
		});

		return "changed part two";
	},

	addMyPhoto: async (filename: string, id: number) => {
		const profile = await prismaClient.profile.findUnique({
			where: { user_id: id },
		});
		if (!profile) throw new Error("Profile not found");

		await prismaClient.profile.update({
			where: { user_id: id },
			data: {
				avatars: {
					create: {
						image: {
							create: {
								filename,
								file: filename,
							},
						},
					},
				},
			},
			include: {
				avatars: {
					include: {
						image: true,
					},
				},
			},
		});

		return "new photo added";
	},

	deleteMyPhoto: async (id: number) => {
		const avatar = await prismaClient.avatar.findUnique({
			where: { id },
			include: { image: true },
		});
		if (!avatar) throw new Error("Avatar not found");

		await prismaClient.avatar.delete({
			where: { id },
		});

		return avatar.image.filename;
	},

	changePassword: async (password: string, userId: number) => {
		await prismaClient.user.update({
			where: { id: userId },
			data: { password },
		});
	},

	changeUsername: async (userId: number, username: string) => {
		await prismaClient.user.update({
			where: { id: userId },
			data: { username },
		});

		return "username changed";
	},
};
