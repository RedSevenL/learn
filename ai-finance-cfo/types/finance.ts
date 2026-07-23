export type AccountType = "cash" | "bank" | "credit" | "investment";

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  balance: string;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
};