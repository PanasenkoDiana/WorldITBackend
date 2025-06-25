import { Prisma } from "../generated/prisma";

export type IError = {
  status: "error";
  message: string;
};

export type ISuccess<T> = {
  status: "success";
  data: T;
};

export type CreateUser = Prisma.UserCreateInput;

export type UpdateUser = Prisma.UserUpdateInput;

export type secondRegister = {
  name: string;
  surname: string;
  username: string;
};
