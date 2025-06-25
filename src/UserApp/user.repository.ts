import { prismaClient } from "../prisma/client";
import {
	changeUserPartOne,
	changeUserPartTwo,
	createMyPhoto,
	CreateUser,
	secondRegister,
} from "./user.type";

export const UserRepositories = {
	createUser: async (data: CreateUser) => {
		const id = (await prismaClient.user.count()) + 1;
		const user = await prismaClient.user.create({
			data: {
				username: `user${id}`,
				...data,
			},
		});

		// Создаём профиль после создания пользователя
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

	changeUserPartOne: async (filename: string, id: number,) => {
		// Найдём профиль пользователя
		const profile = await prismaClient.profile.findUnique({
			where: { user_id: id },
		});
		if (!profile) throw new Error("Profile not found");

		const updatedProfile = await prismaClient.profile.update({
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
			include: {
				avatars: {
					include: { image: true },
				},
			},
		});

		// const newAvatar = await PrismaClient.avatar.create({
		// 	// where: { profile_id: profile.id },
		// 	data: {
		//         profile_id: profile.id,
		//         // profile: profile.id,
		//         profile_id: profile.id,
		//         // profile: profile.id,
		// 		image: {
		// 			create: {
		//                 filename,
		//                 file: filename,
		//                 filename,
		//                 file: filename,
		// 			}
		// 		},
		// 	},
		// });

		return "avatar changed";
	},

	changeUserPartTwo: async (data: changeUserPartTwo, id: number) => {
		const uupdatedUser = await prismaClient.user.update({
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
	
	addMyPhoto: async (data: string, id: number) => {
		// Находим профиль по user_id
		const profile = await prismaClient.profile.findUnique({
			where: { user_id: id },
		});
		if (!profile) throw new Error("Profile not found");

		// Создаём новый аватар с изображением
		// const newAvatar = await PrismaClient.avatar.create({
		// 	data: {
		// 		profile: { connect: { id: profile.id } },
		// 		active: true,
		// 		shown: true,
		// 		image: {
		// 			create: {
		// 				filename: data,
		// 			},
		// 		},
		// 	},
		// 	include: { image: true },
		// });
		const newAvatar = await prismaClient.profile.update({
			where: { user_id: id },

			data: {
				avatars: {
					create: {
						image: {
							create: {
								filename: data,
								file: data,
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

		// Удаляем аватар и связанное изображение
		await prismaClient.avatar.delete({
			where: { id },
		});

		// Возвращаем имя файла удалённого изображения
		return avatar.image.filename;
	},

	changePassword: async (password: string, userId: number) => {
		const newPassword = await prismaClient.user.update({
			where: {
				id: userId,
			},
			data: {
				password,
			},
		});
	},
	changeUsername: async (userId: number, username: string) => {
		const newUsername = await prismaClient.user.update({
			where: {id: userId},
			data: {
				username
			}
		})

		return 'username '
	},
};
