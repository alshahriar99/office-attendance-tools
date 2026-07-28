import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

const getOrigins = () => {
  const origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:3004"
  ];
  if (process.env.NEXT_PUBLIC_APP_URL) {
    origins.push(process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, ""));
  }
  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL.replace(/\/$/, "")}`);
  }
  return origins;
};

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: getOrigins(),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      console.log(`Password reset requested for ${user.email}: ${url}`);

      if (process.env.RESEND_API_KEY) {
        try {
          await resend.emails.send({
            from: "Acme Corp <onboarding@resend.dev>",
            to: user.email,
            subject: "Reset your password",
            html: `
              <div style="font-family: sans-serif; max-w-xl mx-auto; padding: 20px;">
                <h2>Password Reset Request</h2>
                <p>Hello ${user.name},</p>
                <p>We received a request to reset your password. Click the button below to set a new password:</p>
                <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
                <p>If you didn't request this, you can safely ignore this email.</p>
              </div>
            `,
          });
          console.log("Email sent successfully via Resend");
        } catch (error) {
          console.error("Failed to send email:", error);
        }
      } else {
        console.warn("RESEND_API_KEY is not set. Email was not sent.");
      }
    }
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  }
});
