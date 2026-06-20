import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Имя должно содержать минимум 2 символа").max(100),
    email: z.string().email("Некорректный email"),
    password: z.string().min(8, "Пароль должен быть минимум 8 символов").max(100),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
