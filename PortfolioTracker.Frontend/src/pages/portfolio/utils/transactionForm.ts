import { z } from "zod";
import type {
  FieldErrors as HookFormFieldErrors,
  Resolver,
} from "react-hook-form";
import type { Transaction, TransactionType } from "@/types/transaction";
import { isDecimalInput, parseDecimalInput } from "./portfolioUiUtils";

export type TransactionFormFieldErrors = Partial<
  Record<"symbol" | "quantity" | "unitPrice" | "date", string>
>;

export interface TransactionFormState {
  type: TransactionType;
  assetId: number | null;
  symbol: string;
  quantity: string;
  unitPrice: string;
  note: string;
  date: string;
}

export function toLocalDateTimeInput(date: Date) {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 19);
}

export function getInitialFormState(
  transaction?: Transaction,
): TransactionFormState {
  return {
    type: transaction?.type ?? "Buy",
    assetId: transaction?.assetId ?? null,
    symbol: transaction?.symbol ?? "",
    quantity: transaction ? String(transaction.quantity) : "",
    unitPrice: transaction ? String(transaction.unitPrice) : "",
    note: transaction?.note ?? "",
    date: toLocalDateTimeInput(
      transaction ? new Date(transaction.transactionDate) : new Date(),
    ),
  };
}

export const transactionFormSchema = z
  .object({
    type: z.enum(["Buy", "Sell"]),
    assetId: z.number().nullable().optional(),
    symbol: z.string(),
    quantity: z.string(),
    unitPrice: z.string(),
    note: z.string(),
    date: z.string(),
  })
  .superRefine((state, ctx) => {
    if (!state.symbol.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["symbol"],
        message: "Varlık adı zorunlu.",
      });
    }

    if (!state.quantity.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["quantity"],
        message: "Adet zorunlu.",
      });
    } else if (!isDecimalInput(state.quantity)) {
      ctx.addIssue({
        code: "custom",
        path: ["quantity"],
        message: "Adet sayı olmalı.",
      });
    } else if (parseDecimalInput(state.quantity) <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["quantity"],
        message: "Adet 0’dan büyük olmalı.",
      });
    }

    if (!state.unitPrice.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["unitPrice"],
        message: "Birim fiyat zorunlu.",
      });
    } else if (!isDecimalInput(state.unitPrice)) {
      ctx.addIssue({
        code: "custom",
        path: ["unitPrice"],
        message: "Birim fiyat sayı olmalı.",
      });
    } else if (parseDecimalInput(state.unitPrice) <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["unitPrice"],
        message: "Birim fiyat 0’dan büyük olmalı.",
      });
    }

    if (!state.date.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["date"],
        message: "Tarih ve saat zorunlu.",
      });
    } else if (Number.isNaN(new Date(state.date).getTime())) {
      ctx.addIssue({
        code: "custom",
        path: ["date"],
        message: "Geçerli tarih gir.",
      });
    }
  });

export function getFieldErrors(
  state: TransactionFormState,
): TransactionFormFieldErrors {
  const result = transactionFormSchema.safeParse(state);
  if (result.success) return {};

  const errors: TransactionFormFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (
      (field === "symbol" ||
        field === "quantity" ||
        field === "unitPrice" ||
        field === "date") &&
      !errors[field]
    ) {
      errors[field] = issue.message;
    }
  }

  return errors;
}

export const transactionFormResolver: Resolver<TransactionFormState> = async (
  values,
) => {
  const state = values as TransactionFormState;
  const fieldErrors = getFieldErrors(state);
  if (Object.keys(fieldErrors).length === 0) {
    return { values: state, errors: {} };
  }

  const errors = Object.fromEntries(
    Object.entries(fieldErrors).map(([field, message]) => [
      field,
      { type: "validation", message },
    ]),
  ) as HookFormFieldErrors<TransactionFormState>;

  return { values: {}, errors };
};

export function hasTransactionFormChanges(
  current: TransactionFormState,
  initial: TransactionFormState,
) {
  return (
    current.type !== initial.type ||
    current.assetId !== initial.assetId ||
    current.symbol !== initial.symbol ||
    current.quantity !== initial.quantity ||
    current.unitPrice !== initial.unitPrice ||
    current.note !== initial.note ||
    current.date !== initial.date
  );
}

export function hasCreateTransactionInput(
  current: TransactionFormState,
  initial: TransactionFormState,
) {
  return (
    current.symbol.trim() !== "" ||
    current.assetId !== initial.assetId ||
    current.quantity.trim() !== "" ||
    current.unitPrice.trim() !== "" ||
    current.note.trim() !== "" ||
    current.type !== initial.type ||
    current.date !== initial.date
  );
}
