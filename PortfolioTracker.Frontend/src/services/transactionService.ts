import { api } from "../api/httpClient";
import type {
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionQuery,
} from "../types/transaction";

function toQueryString(params?: TransactionQuery) {
  const query = new URLSearchParams();
  if (params?.type) query.set("type", params.type);
  if (params?.search?.trim()) query.set("search", params.search.trim());
  if (params?.symbol?.trim()) query.set("symbol", params.symbol.trim());

  const value = query.toString();
  return value ? `?${value}` : "";
}

export const transactionService = {
  getAll: (params?: TransactionQuery) =>
    api.get<Transaction[]>(`/api/transactions${toQueryString(params)}`),
  getById: (id: number) => api.get<Transaction>(`/api/transactions/${id}`),
  create: (dto: CreateTransactionDto) =>
    api.post<Transaction>("/api/transactions", dto),
  update: (id: number, dto: UpdateTransactionDto) =>
    api.put<Transaction>(`/api/transactions/${id}`, dto),
  delete: (id: number) => api.delete<void>(`/api/transactions/${id}`),
};
