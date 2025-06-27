import { error, Result, success } from "../tools/result";
import { userPostRepository } from "./userPost.repository";
import {
	CreateUserPost,
	ImageCreateMany,
	UpdateUserPost,
	UserPost,
	UserPostWithoutIncludes,
} from "./userPost.type";
import { base64ToImage } from "../tools/base64ToImage";
import fs from "fs";
import path from "path";
// export interface Image {
//     id: number;
//     userId: number;
//     filename: string;
//     file: string;
//     postId?: number;
//     post?: UserPost;
// }

// export interface UserPost {
//     id: number;
//     userId: number;
//     title: string;
//     content: string;
//     images?: Image[];
// }
export const userPostService = {
	createPost: async function (
		profileId: bigint,
		data: CreateUserPost,
		images: string[],
		links: string[]
	): Promise<Result<UserPost>> {
		const imagesData = await Promise.all(
			images.map((base64) => base64ToImage(base64))
		);

		const linksWithUrl = (links || []).map(link => ({ url: link }));

		const newPost = await userPostRepository.createPost(
			Number(profileId),
			data,
			imagesData,
			linksWithUrl
		);

		return success<UserPost>(newPost);
	},

	deletePost: async function (
		profileId: bigint,
		postId: bigint
	): Promise<Result<string>> {
		try {
			const post = await userPostRepository.getPostById(postId);
			if (!post) {
				return error("Post not found");
			}

			if (post.author_id !== profileId) {
				return error("Unauthorized to delete this post");
			}

			if (post.post_app_post_images && post.post_app_post_images.length > 0) {
				for (const postImage of post.post_app_post_images) {
					const image = postImage.post_app_image;
					if (image) {
						await fs.promises.unlink(
							path.join(__dirname, "../../media", image.filename)
						);
					}
				}
			}

			const deletedPost = await userPostRepository.deletePost(
				profileId,
				postId
			);
			return success(deletedPost);
		} catch (err) {
			console.error("Delete post error:", err);
			return error("Failed to delete post");
		}
	},

	updatePost: async function (
		profileId: bigint,
		postId: bigint,
		data: UpdateUserPost,
		images: string[]
	): Promise<Result<UserPostWithoutIncludes>> {
		try {
			const existingPost = await userPostRepository.getPostById(postId);
			if (!existingPost) {
				return error("Post not found");
			}

			if (existingPost.author_id !== profileId) {
				return error("Unauthorized to update this post");
			}

			const newImages = await Promise.all(
				images.map((base64) => base64ToImage(base64))
			);

			const updatedPost = await userPostRepository.updatePost(
				profileId,
				postId,
				data,
				newImages
			);

			if (!updatedPost) {
				return error("Failed to update post");
			}

			return success(updatedPost);
		} catch (err) {
			console.error("Update post error:", err);
			return error("Failed to update post");
		}
	},

	getPostById: async function (id: bigint): Promise<Result<UserPost>> {
		try {
			const post = await userPostRepository.getPostById(id);
			if (!post) {
				return error("getPostById error");
			}

			return success(post);
		} catch (err) {
			console.log(err);
			return error("getPostById error");
		}
	},

	getAllPosts: async function (): Promise<Result<UserPost[]>> {
		try {
			const allPosts = await userPostRepository.getAllPosts();
			return success(allPosts);
		} catch (err) {
			console.log(err);
			return error("getAllPosts error");
		}
	},
	getMyPosts: async function (profileId: bigint): Promise<Result<UserPost[]>> {
		try {
			const myPosts = await userPostRepository.getMyPosts(profileId);
			// if (typeof myPosts === string) return error
			return success(myPosts);
		} catch (err) {
			console.log(err);
			return error("getMyPosts error");
		}
	},
	// deleteImage: async function(userId: number, imageId: number): Promise<Result<string>> {
	//     try {
	//         const image = await userPostRepository.getImageById(imageId);
	// 		if (!image) {
	// 			return error("Image not found");
	// 		}

	//         if (image.userId !== userId) {
	//             return error("Unauthorized to delete this image");
	//         }

	//         await fs.promises.unlink(
	//             path.join(__dirname, "../../media", image.filename)
	//         );

	//         const deleted = await userPostRepository.deleteImage(imageId);

	//         if (!deleted) {
	//             return error("Failed to delete image");
	//         }

	//         return success("Image deleted successfully");
	//     } catch (err) {
	//         console.error("Delete image error:", err);
	//         return error("Failed to delete image");
	//     }
	// }
};
