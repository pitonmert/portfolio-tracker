export type TransactionType = "Buy" | "Sell";

export interface Transaction {
  id: number;
  symbol: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  note?: string | null;
  type: TransactionType;
  transactionDate: string;
}

export interface CreateTransactionDto {
  symbol: string;
  quantity: number;
  unitPrice: number;
  note?: string | null;
  type: TransactionType;
  transactionDate: string;
}

export interface UpdateTransactionDto extends CreateTransactionDto {
  id: number;
}

export interface TransactionQuery {
  type?: TransactionType;
  search?: string;
  symbol?: string;
}
