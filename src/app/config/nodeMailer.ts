import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

// Create a transporter using Ethereal email service
const config = {
  service: 'gmail',
  auth: {
      user: process.env.NODEMAILER_SENDEREMAIL,  // Use environment variables
      pass: process.env.NODEMAILER_PASSWORD
  }
};

export const transporter = nodemailer.createTransport(config);

