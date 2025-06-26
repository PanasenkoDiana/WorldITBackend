// import { Prisma } from "../generated/prisma";

// export type User = Prisma.UserGetPayload<{
// 	include: {
// 		user_app_profile: {
// 			include: {
// 				user_app_avatar: true;
// 			};
// 		};
// 	};
// }>;

// export type CreateUser = Prisma.UserCreateInput;

// export type UpdateUser = Prisma.UserUpdateInput;

// export type secondRegister = {
// 	name: string;
// 	surname: string;
// 	username: string;
// };

// export interface changeUserPartOne {
//   profileImage: string;
//   username
// }






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
        user_app_profile: {
            include: {
                user_app_avatar: true;
            };
        };
    }
}>


export type changeUserPartOne = {
    profileImage: string
}

export type changeUserPartTwo = Pick<User, 'first_name' | 'last_name' | 'date_joined' | 'email' | 'username' | 'password'   >

export type UpdateUser = Prisma.UserUpdateInput;

export interface secondRegister {
    first_name: string;
    last_name: string;
    username: string;
}

export type CreateUser = Prisma.UserCreateInput

export type createMyPhotoCredentials = { image: string }

export type Avatar = Prisma.user_app_avatarGetPayload<{}>