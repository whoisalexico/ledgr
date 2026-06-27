import { z } from "zod";
import { SUPPORTED_CURRENCIES } from "@/lib/currency-constants";

export const operationTypeSchema = z.enum(["INCOME", "EXPENSE"]);
export const currencySchema = z.enum(SUPPORTED_CURRENCIES);

export const createOperationSchema = z.object({
  title: z.string().min(1, "Введите название").max(120, "Слишком длинное название"),
  amount: z.coerce
    .number({ message: "Введите сумму" })
    .positive("Сумма должна быть больше нуля")
    .max(1_000_000_000, "Слишком большая сумма"),
  currency: currencySchema,
  type: operationTypeSchema,
  date: z.string().min(1, "Укажите дату"),
  categoryId: z.string().min(1, "Выберите категорию"),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Введите название категории").max(40, "Слишком длинное название"),
  type: operationTypeSchema,
});

export type OperationType = z.infer<typeof operationTypeSchema>;
export type Currency = z.infer<typeof currencySchema>;
export type CreateOperationInput = z.infer<typeof createOperationSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
