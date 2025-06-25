import { UserRepositories } from "./user.repository";
import { CreateUser, UpdateUser, secondRegister } from "./user.type";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { SECRET_KEY } from "../config/token";
import { VerificationService } from "../core/verification.service";
import { EmailService } from "../core/email.service";

const verificationService = new VerificationService(EmailService);

export const UserService = {
  startRegister: async (data: CreateUser) => {
    const existingUser = await UserRepositories.findUserByEmail(data.email);
    if (existingUser) throw new Error("User with this email already exists");

    const sent = await verificationService.generateAndSendCode(data.email, data);
    if (!sent) throw new Error("Failed to send verification email");

    return "Verification code sent to email";
  },

  confirmRegister: async (email: string, code: string) => {
    const userData = verificationService.verifyCode(email, code);
    if (!userData) throw new Error("Invalid or expired verification code");

    const hashedPassword = await hash(userData.password, 10);
    const user = await UserRepositories.createUser({
      ...userData,
      password: hashedPassword,
    });

    return user;
  },

  findUserById: async (id: number) => {
    const user = await UserRepositories.findUserById(id);
    if (!user) throw new Error("User not found");
    return user;
  },

  findUserByEmail: async (email: string) => {
    const user = await UserRepositories.findUserByEmail(email);
    if (!user) throw new Error("User not found");
    return user;
  },

  authUser: async (email: string, password: string) => {
    const user = await UserRepositories.findUserByEmail(email);
    if (!user || !user.password) throw new Error("User not found or no password set");

    const valid = await compare(password, user.password);
    if (!valid) throw new Error("Invalid credentials");

    return sign({ id: user.id }, SECRET_KEY, { expiresIn: "1d" });
  },

  secondRegister: async (data: secondRegister, id: number) =>
    UserRepositories.secondRegister(data, id),

  changeUserPartOne: async (filename: string, id: number) =>
    UserRepositories.changeUserPartOne(filename, id),

  changeUserPartTwo: async (data: UpdateUser, id: number) =>
    UserRepositories.changeUserPartTwo(data, id),

  addMyPhoto: async (filename: string, id: number) =>
    UserRepositories.addMyPhoto(filename, id),

  deleteMyPhoto: async (id: number) =>
    UserRepositories.deleteMyPhoto(id),

  changePassword: async (password: string, userId: number) => {
    await UserRepositories.changePassword(password, userId);
    return "Password changed";
  },

  changeUsername: async (userId: number, username: string) =>
    UserRepositories.changeUsername(userId, username),
};
