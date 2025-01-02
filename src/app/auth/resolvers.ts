import { prismaClient } from "../../clients/db";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { GraphqlContext } from "../interfaces";
import NodeMailerService from "../services/NodeMailerService";
import JWTService from "../services/JWTService";

interface SignupUserInput {
    username: string; // Required field
    fullName: string; // Required field
    email: string;    // Required field
    password: string; // Required field
}

interface LoginUserInput {
    usernameOrEmail: string; // Required field (username or email)
    password: string;        // Required field (password)
}

interface VerifyEmailInput {
    code: string;
    email: string;
}

interface ResetPasswordInput {
    token: string;
    newPassword: string;
    confirmPassword: string;
}

const queries = {
    getCurrentUser: async (parent: any, args: any, ctx: GraphqlContext) => {
        try {
            const id = ctx.user?.id;
            if (!id) return null;

            const user = await prismaClient.user.findUnique({ where: { id } });
            return user;
        } catch (error) {
            return null;
        }
    }
};

const mutations = {
    signupUser: async (parent: any, { input }: { input: SignupUserInput }, ctx: GraphqlContext) => {
        try {
            const { username, fullName, email, password } = input;

            const existingUser = await prismaClient.user.findFirst({
                where: {
                    OR: [
                        { username },
                        { email },
                    ],
                },
            });

            if (existingUser) {
                if (existingUser.username === username) {
                    throw new Error('Username is already in use');
                }
                if (existingUser.email === email) {
                    throw new Error('Email is already in use');
                }
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
            const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

            const newUser = await prismaClient.user.create({
                data: {
                    email,
                    username,
                    fullName,
                    password: hashedPassword,
                    verificationToken,
                    verificationTokenExpiresAt,
                    isVerified: false,
                },
            });

            await NodeMailerService.sendVerificationEmail(newUser.email, verificationToken);

            return newUser.email;

        } catch (error: any) {
            console.log("Error while signupUser:", error.message);
            throw new Error(error.message || 'An unexpected error occurred');
        }
    },

    verifyEmail: async (parent: any, { input }: { input: VerifyEmailInput }, ctx: GraphqlContext) => {
        try {
            const { email, code } = input;

            let user = await prismaClient.user.findUnique({ where: { email } });

            if (!user) {
                throw new Error("User not found.");
            }

            if (user.isVerified) {
                throw new Error("Your email is already verified.");
            }

            if (user.verificationToken !== code) {
                throw new Error("Invalid verification code.");
            }

            if (user.verificationTokenExpiresAt && user.verificationTokenExpiresAt < new Date()) {
                throw new Error("Verification token has expired.");
            }

            user = await prismaClient.user.update({
                where: { email },
                data: {
                    isVerified: true,
                    verificationToken: null,
                    verificationTokenExpiresAt: null,
                },
            });

            const userToken = JWTService.generateTokenForUser({ id: user.id, username: user.username });

            ctx.res.cookie('__connectify_token', userToken, {
                httpOnly: true,
                secure: false,
                maxAge: 1000 * 60 * 60 * 24,
                sameSite: 'lax',
                path: '/',
            });

            NodeMailerService.sendWelcomeEmail(email, user?.username || "");

            return {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                profileImageURL: user.profileImageURL,
                isVerified: user.isVerified,
                token: userToken
            };

        } catch (error: any) {
            console.log('Error while verifying email:', error.message);
            throw new Error(error.message || 'An unexpected error occurred');
        }
    },

    loginUser: async (parent: any, { input }: { input: LoginUserInput }, ctx: GraphqlContext) => {
        try {
            const { usernameOrEmail, password } = input;

            const existingUser = await prismaClient.user.findFirst({
                where: {
                    OR: [
                        { username: usernameOrEmail },
                        { email: usernameOrEmail },
                    ],
                },
            });

            if (!existingUser) {
                throw new Error('Sorry, user does not exist!');
            }

            const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

            if (!isPasswordCorrect) {
                throw new Error('Incorrect password!');
            }

            const userToken = existingUser.isVerified ? JWTService.generateTokenForUser({ id: existingUser.id, username: existingUser.username }) : null;

            if (existingUser.isVerified) {
                ctx.res.cookie('__connectify_token', userToken, {
                    httpOnly: true,
                    secure: false,
                    maxAge: 1000 * 60 * 60 * 24,
                    sameSite: 'lax',
                    path: '/',
                });
            }

            return {
                id: existingUser.id,
                username: existingUser.username,
                fullName: existingUser.fullName,
                email: existingUser.email,
                profileImageURL: existingUser.profileImageURL,
                isVerified: existingUser.isVerified,
                token: userToken
            };

        } catch (error: any) {
            console.log('Error while logging in user:', error.message);
            throw new Error(error.message || 'An unexpected error occurred');
        }
    },

    forgotPassword: async (parent: any, { usernameOrEmail }: { usernameOrEmail: string }, ctx: GraphqlContext) => {
        try {
            // Check if the user exists by email or username
            const user = await prismaClient.user.findFirst({
                where: {
                    OR: [
                        { email: usernameOrEmail },
                        { username: usernameOrEmail }
                    ]
                }
            });

            if (!user) {
                throw new Error("User not found.");
            }

            // Generate reset token
            const resetToken = crypto.randomBytes(20).toString("hex");
            const resetTokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

            // Save the updated user
            await prismaClient.user.update({
                where: { id: user.id }, // Use the user's ID for the update
                data: { resetPasswordToken: resetToken, resetPasswordTokenExpiresAt: resetTokenExpiresAt },
            });

            // Send reset email
            await NodeMailerService.sendPasswordResetEmail(user.email, `http://localhost:4000/reset-password/${resetToken}`)
            // Send response
            return true;
        } catch (error: any) {
            console.error("Error in forgotPassword: ", error);
            throw new Error(error.message);
        }
    },

    resetPassword: async (parent: any, { input }: { input: ResetPasswordInput }, ctx: GraphqlContext) => {
        try {
            const { token, newPassword, confirmPassword } = input;

            if (newPassword !== confirmPassword) {
                throw new Error("Passwords do not match");
            }

            const user = await prismaClient.user.findUnique({
                where: {
                    resetPasswordToken: token,
                },
            });

            if (!user || !user.resetPasswordTokenExpiresAt || user.resetPasswordTokenExpiresAt <= new Date()) {
                throw new Error("Invalid or expired reset token");
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await prismaClient.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    resetPasswordToken: null,
                    resetPasswordTokenExpiresAt: null,
                },
            });

            NodeMailerService.sendResetSuccessEmail(user?.email || "");
            return true;

        } catch (error: any) {
            throw new Error(error.message);
        }
    },

    logoutUser: async (parent: any, args: any, ctx: GraphqlContext) => {
        try {
            ctx.res.clearCookie("__connectify_token", {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                path: '/',
            });

            return true;
        } catch (error) {
            throw new Error("Logout failed. Please try again.");
        }
    },
};

export const resolvers = { queries, mutations };
