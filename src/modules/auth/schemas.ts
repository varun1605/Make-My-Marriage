import { z } from "zod";

const email = z.string().trim().max(254, "Use an email address of at most 254 characters.")
  .pipe(z.email("Enter a valid email address."));
// Never trim or otherwise normalize passwords.
export const signupSchema = z.strictObject({
  name: z.string().trim().min(1, "Enter your name.").max(120, "Use a name of at most 120 characters."),
  email,
  password: z.string().min(15, "Use at least 15 characters.").max(128, "Use at most 128 characters."),
});
export const loginSchema = z.strictObject({
  email,
  password: z.string().min(1, "Enter your password.").max(128, "Use at most 128 characters."),
});
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
