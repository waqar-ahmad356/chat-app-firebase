import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

export const signUpSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Include uppercase, lowercase, and a number",
    )
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

export const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),
});

export const profileSchema = yup.object({
  displayName: yup
    .string()
    .trim()
    .min(2, "Username must be at least 2 characters")
    .max(30, "Username must be 30 characters or less")
    .required("Username is required"),
  bio: yup.string().trim().max(160, "Bio must be 160 characters or less").default(""),
  status: yup.string().trim().max(60, "Status must be 60 characters or less").default(""),
});

export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Include uppercase, lowercase, and a number",
    )
    .required("New password is required"),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your new password"),
});

export type LoginFormValues = yup.InferType<typeof loginSchema>;
export type SignUpFormValues = yup.InferType<typeof signUpSchema>;
export type ForgotPasswordFormValues = yup.InferType<typeof forgotPasswordSchema>;
export type ProfileFormValues = yup.InferType<typeof profileSchema>;
export type ChangePasswordFormValues = yup.InferType<typeof changePasswordSchema>;
