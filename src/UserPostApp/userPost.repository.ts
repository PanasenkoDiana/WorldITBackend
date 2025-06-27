import { prismaClient } from "../prisma/client";
import { replaceBigInt } from "./userPost.controller";
import {
	CreateUserPost,
	UpdateUserPost,
	UserPost,
	Image,
	UserPostWithoutIncludes,
} from "./userPost.type";

export const userPostRepository = {
	createPost: async function (
		authUserId: number, // был profileId, теперь передаем auth_user.id
		data: CreateUserPost,
		imagesData: { filename: string; file: string }[],
		links: { url: string }[]
	): Promise<UserPost> {
		try {
			// Получаем профиль пользователя по user_id
			const profile = await prismaClient.user_app_profile.findFirst({
				where: { user_id: authUserId },
			});

			if (!profile) {
				throw new Error("User profile not found");
			}

			const now = new Date();

			// Сохраняем изображения
			const imagesWithDate = imagesData.map((img) => ({
				filename: img.filename,
				file: img.file,
				uploaded_at: now,
			}));

			await prismaClient.post_app_image.createMany({
				data: imagesWithDate,
				skipDuplicates: true,
			});

			const images = await prismaClient.post_app_image.findMany({
				where: {
					filename: { in: imagesData.map((img) => img.filename) },
				},
				orderBy: { id: "desc" },
				take: imagesData.length,
			});

			const imageIds = images.map((img) => ({ image_id: img.id }));

			// Создание поста
			const newPost = await prismaClient.post_app_post.create({
				data: {
					title: data.title,
					content: data.content,
					topic: data.topic,
					author_id: profile.id, // теперь используется корректный user_app_profile.id
					post_app_link: {
						createMany: {
							data: links,
						},
					},
					post_app_post_images: {
						
						createMany: {
							data: imageIds,
						},
					},
					...(data.tags
						? {
								post_app_post_tags: {
									create: (
										data.tags as Array<
											{ name: string } | string
										>
									).map((tag) => {
										let tagName =
											typeof tag === "string"
												? tag
												: tag.name;
										if (!tagName.startsWith("#")) {
											tagName = `#${tagName}`;
										}
										return {
											post_app_tag: {
												connectOrCreate: {
													where: { name: tagName },
													create: { name: tagName },
												},
											},
										};
									}),
								},
						  }
						: {}),
				},
				include: {
					post_app_post_tags: {
						include: { post_app_tag: true },
					},
					post_app_link: true,
					post_app_post_images: {
						include: { post_app_image: true },
					},
					user_app_profile: {
						include: {
							user_app_avatar: true,
							auth_user: true,
						},
					},
				},
			});

			return newPost as any;
		} catch (error) {
			console.log(error);
			throw error;
		}
	},

	deletePost: async function (profileId: bigint, postId: bigint) {
		try {
			const post = await prismaClient.post_app_post.findFirst({
				where: {
					id: postId,
				},
			});

			if (post?.author_id !== profileId) {
				return "you're not the owner";
			}

			await prismaClient.post_app_post.delete({
				where: {
					id: postId,
				},
			});
			return `Post ${postId} successfully deleted`;
		} catch (error) {
			console.log(error);
			throw error;
		}
	},

	updatePost: async function (
		profileId: bigint,
		postId: bigint,
		data: UpdateUserPost,
		imagesData: { filename: string; file: string }[]
	) {
		try {
			await prismaClient.post_app_post_images.deleteMany({
				where: {
					post_id: postId,
				},
			});
			const now = new Date();
			const imagesWithDate = imagesData.map((img) => ({
				filename: img.filename,
				file: img.file,
				uploaded_at: now,
			}));
			await prismaClient.post_app_image.createMany({
				data: imagesWithDate,
				skipDuplicates: true,
			});
			const images = await prismaClient.post_app_image.findMany({
				where: {
					filename: { in: imagesData.map((img) => img.filename) },
				},
				orderBy: { id: "desc" },
				take: imagesData.length,
			});
			const imageIds = images.map((img) => ({ image_id: img.id }));

			const updatedPost = await prismaClient.post_app_post.update({
				where: {
					id: postId,
				},
				data: {
					...data,
					post_app_post_images: {
						createMany: {
							data: imageIds,
						},
					},
				},
				include: {
					user_app_profile: true,
					post_app_post_images: {
						include: { post_app_image: true },
					},
					post_app_post_tags: {
						include: { post_app_tag: true },
					},
				},
			});

			return updatedPost as any;
		} catch (err) {
			console.log(err);
			throw err;
		}
	},

	getPostById: async function (id: bigint) {
		try {
			const post = await prismaClient.post_app_post.findUnique({
				where: { id },
				include: {
					post_app_post_tags: {
						include: { post_app_tag: true },
					},
					post_app_link: true,
					post_app_post_images: {
						include: { post_app_image: true },
					},
					user_app_profile: {
						include: {
							user_app_avatar: true,
						},
					},
				},
			});
			return post as any;
		} catch (error) {
			console.log(error);
			throw error;
		}
	},

	getAllPosts: async function () {
		try {
			const allPosts = await prismaClient.post_app_post.findMany({
				include: {
					post_app_post_tags: {
						include: { post_app_tag: true },
					},
					post_app_link: true,
					post_app_post_images: {
						include: { post_app_image: true },
					},
					user_app_profile: {
						include: {
							user_app_avatar: true,
							auth_user: true,
						},
					},
				},
			});
			return allPosts;
		} catch (error) {
			console.log(error);
			throw error;
		}
	},

	getMyPosts: async function (userId: bigint) {
		try {
			const user = await prismaClient.user.findUnique({
				where: {
					id: Number(userId),
				},
				include: {
					user_app_profile: true
				},
			});

			if (!user) {
				throw new Error("User profile not found");
			}

			// Получаем посты по author_id = profile.id
			const myPosts = await prismaClient.post_app_post.findMany({
				where: {
					author_id: user.user_app_profile?.id,
				},
				include: {
					post_app_post_tags: {
						include: { post_app_tag: true },
					},
					post_app_link: true,
					post_app_post_images: {
						include: { post_app_image: true },
					},
					user_app_profile: {
						include: {
							user_app_avatar: true,
							auth_user: true,
						},
					},
				},
			});

			return myPosts;
		} catch (error) {
			console.log(error);
			throw error;
		}
	},
};  
