import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, X, ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  createOperationSchema,
  type CreateOperationInput,
  type OperationType,
} from "@/lib/operation-schemas";
import { listCategoriesFn, createCategoryFn } from "@/routes/api/operations/-categories";
import { createOperationFn } from "@/routes/api/operations/-operations";
import { SUPPORTED_CURRENCIES, type SupportedCurrency } from "@/lib/currency-constants";
import { CURRENCY_SYMBOLS } from "@/lib/currency-format";
import { useDisplayCurrency } from "@/lib/display-currency";

function todayIso() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export function AddOperationDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const { currency: displayCurrency } = useDisplayCurrency();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateOperationInput>({
    resolver: zodResolver(createOperationSchema),
    defaultValues: {
      type: "EXPENSE",
      date: todayIso(),
      title: "",
      categoryId: "",
      amount: undefined,
      currency: displayCurrency,
    },
  });

  const type = watch("type");
  const categoryId = watch("categoryId");
  const currency = watch("currency");

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategoriesFn(),
    enabled: open,
  });

  const visibleCategories = (categoriesQuery.data ?? []).filter((c) => c.type === type);

  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => createCategoryFn({ data: { name, type } }),
    onSuccess: (category) => {
      queryClient.setQueryData(["categories"], (prev: typeof categoriesQuery.data) =>
        prev ? [...prev, category] : [category],
      );
      setValue("categoryId", category.id, { shouldValidate: true });
      setIsAddingCategory(false);
      setNewCategoryName("");
    },
    onError: (err) => {
      setServerError(err instanceof Error ? err.message : "Не удалось создать категорию");
    },
  });

  const createOperationMutation = useMutation({
    mutationFn: (data: CreateOperationInput) => createOperationFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      reset({
        type: "EXPENSE",
        date: todayIso(),
        title: "",
        categoryId: "",
        amount: undefined,
        currency: displayCurrency,
      });
      onOpenChange(false);
    },
    onError: (err) => {
      setServerError(err instanceof Error ? err.message : "Не удалось сохранить операцию");
    },
  });

  const onSubmit = (data: CreateOperationInput) => {
    setServerError(null);
    createOperationMutation.mutate(data);
  };

  const handleTypeChange = (next: OperationType) => {
    setValue("type", next);
    setValue("categoryId", "");
    setIsAddingCategory(false);
  };

  const handleCreateCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    setServerError(null);
    createCategoryMutation.mutate(name);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setServerError(null);
          setIsAddingCategory(false);
          setNewCategoryName("");
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="w-[calc(100%-2rem)] sm:w-full max-w-lg rounded-2xl sm:rounded-3xl border-line p-0 gap-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-4 sm:px-6 pt-6 pb-2 pr-10">
          <DialogTitle className="font-display text-xl font-bold text-ink">
            Новая операция
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-4 sm:px-6 pb-6 pt-2 space-y-5">
          {serverError && (
            <div className="rounded-xl bg-loss/10 border border-loss/20 px-4 py-2.5 text-sm text-loss">
              {serverError}
            </div>
          )}

          {/* Тип операции */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleTypeChange("EXPENSE")}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors",
                type === "EXPENSE"
                  ? "bg-loss/10 border-loss/30 text-loss"
                  : "bg-bg border-line text-ink-muted hover:bg-line/40",
              )}
            >
              <ArrowDownRight className="size-4" />
              Расход
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("INCOME")}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors",
                type === "INCOME"
                  ? "bg-gain/10 border-gain/30 text-gain"
                  : "bg-bg border-line text-ink-muted hover:bg-line/40",
              )}
            >
              <ArrowUpRight className="size-4" />
              Доход
            </button>
          </div>

          {/* Название */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-ink">
              Название
            </Label>
            <Input
              id="title"
              placeholder="Например, Пятёрочка"
              className="rounded-xl border-line h-10 focus-visible:ring-brand"
              {...register("title")}
            />
            {errors.title && <p className="text-xs text-loss">{errors.title.message}</p>}
          </div>

          {/* Сумма и дата */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-y-1 gap-x-2">
                <Label htmlFor="amount" className="text-ink leading-none">
                  Сумма
                </Label>
                <div className="flex items-center gap-0.5">
                  {SUPPORTED_CURRENCIES.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setValue("currency", code)}
                      className={cn(
                        "px-1.5 py-0.5 rounded-md text-[11px] font-bold leading-none transition-colors",
                        currency === code
                          ? "bg-brand text-white"
                          : "text-ink-muted hover:bg-line/60",
                      )}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted text-sm pointer-events-none">
                  {CURRENCY_SYMBOLS[currency as SupportedCurrency]}
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  placeholder="0"
                  className="rounded-xl border-line h-10 pl-8 focus-visible:ring-brand"
                  {...register("amount")}
                />
              </div>
              {errors.amount && <p className="text-xs text-loss">{errors.amount.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-ink leading-none">
                Дата
              </Label>
              <Input
                id="date"
                type="date"
                className="rounded-xl border-line h-10 focus-visible:ring-brand"
                {...register("date")}
              />
              {errors.date && <p className="text-xs text-loss">{errors.date.message}</p>}
            </div>
          </div>

          {/* Категории */}
          <div className="space-y-1.5">
            <Label className="text-ink">Категория</Label>
            <Controller
              control={control}
              name="categoryId"
              render={() => (
                <div className="flex flex-wrap gap-2">
                  {visibleCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setValue("categoryId", cat.id, { shouldValidate: true })}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                        categoryId === cat.id
                          ? "bg-brand text-white border-brand shadow-brand"
                          : "bg-bg border-line text-ink-muted hover:bg-line/40",
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}

                  {!isAddingCategory && (
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(true)}
                      className="inline-flex items-center gap-1 rounded-full border border-dashed border-line px-3.5 py-1.5 text-sm font-medium text-ink-muted hover:bg-line/40 transition-colors"
                    >
                      <Plus className="size-3.5" />
                      Добавить
                    </button>
                  )}
                </div>
              )}
            />

            {isAddingCategory && (
              <div className="flex items-center gap-2 pt-1">
                <Input
                  autoFocus
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Название категории"
                  maxLength={40}
                  className="rounded-xl border-line h-9 text-sm focus-visible:ring-brand"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateCategory();
                    }
                    if (e.key === "Escape") {
                      setIsAddingCategory(false);
                      setNewCategoryName("");
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={createCategoryMutation.isPending || !newCategoryName.trim()}
                  className="shrink-0 rounded-xl bg-ink text-white p-2 disabled:opacity-40 transition-opacity"
                >
                  <Plus className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCategory(false);
                    setNewCategoryName("");
                  }}
                  className="shrink-0 rounded-xl border border-line p-2 text-ink-muted hover:bg-line/40 transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}

            {errors.categoryId && <p className="text-xs text-loss">{errors.categoryId.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || createOperationMutation.isPending}
            className="w-full inline-flex items-center justify-center gap-2 bg-brand text-white px-5 py-2.5 rounded-2xl text-sm font-bold shadow-brand hover:scale-[1.01] active:scale-[0.99] transition-transform disabled:opacity-60 disabled:hover:scale-100"
          >
            {createOperationMutation.isPending ? "Сохраняем…" : "Сохранить операцию"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
