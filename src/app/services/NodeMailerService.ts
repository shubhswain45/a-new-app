import dotenv from 'dotenv';
import { transporter } from '../config/nodeMailer';
import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE } from '../templates/emailTemplates';

dotenv.config();

class NodeMailerService {
    private static async sendEmail(to: string, subject: string, html: string) {
        try {
            const info = await transporter.sendMail({
                from: process.env.NODEMAILER_SENDEREMAIL, // sender address
                to, // list of receivers
                subject, // Subject line
                html, // HTML body content
            });
        } catch (error) {
            console.error("Error sending email:", error);
            throw new Error("Failed to send email");
        }
    }

    public static async sendVerificationEmail(email: string, verificationToken: string) {
        const subject = "Verify Your Email";
        const html = VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken);
        await this.sendEmail(email, subject, html);
    }

    public static async sendWelcomeEmail(email: string, username: string) {
        const subject = "Welcome!";
        const html = WELCOME_EMAIL_TEMPLATE.replace("{username}", username);
        await this.sendEmail(email, subject, html);
    }

    public static async sendPasswordResetEmail(email: string, resetURL: string) {
        const subject = "Password Reset Request";
        const html = PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL);
        await this.sendEmail(email, subject, html);
    }

    public static async sendResetSuccessEmail(email: string) {
        const subject = "Password Reset Successful";
        const html = PASSWORD_RESET_SUCCESS_TEMPLATE;
        await this.sendEmail(email, subject, html);
    }
}

export default NodeMailerService;


