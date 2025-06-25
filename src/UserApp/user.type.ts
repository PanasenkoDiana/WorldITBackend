import type { PrismaClient } from '@prisma/client'
import { Prisma } from "../generated/prisma";

export interface IError {
    status: 'error',
    message: string
}

export interface ISuccess<T>{
    status: 'success',
    data: T
}

export type User = Prisma.UserGetPayload<{
    include: {
        images: true,
        albums: true,
    }
}>

export type UserWithAllIncludes = Prisma.UserGetPayload<{}>

export type UserWithoutIncludes = Prisma.UserGetPayload<{}>

export type Avatar = Prisma.AvatarGetPayload<{}>

export type Image = Prisma.ImageGetPayload<{}>

export type CreateUser = Prisma.UserCreateInput
export type secondRegister = Pick<User, 'name' | 'surname' | 'username'>
export type changeUserPartOne = { profileImage?: string, username?: string }
export type changeUserPartTwo = Omit<UserWithoutIncludes, 'profileImage' | 'id'>
export type createMyPhoto = { image: string }