import { Prisma } from "../generated/prisma";





type Image = Prisma.ImageGetPayload<{}>
export type Album = Prisma.AlbumGetPayload<{
	include: { topic: true, images: true }
}>

export type CreateAlbumInput = {
	name: string;
	userId: number;
	topic?: string | { name: string }
	// previewImageId?: number;
	// shown?: boolean;
};

export type CreateAlbum = Omit<Prisma.AlbumCreateInput, 'images'>
// export type CreateAlbum =
export type AddPhotoToAlbum = Pick<Image, 'filename' | 'file'>
export type AddPhotoToAlbumCredentials = { image: string }

// export type ChangeAlbum