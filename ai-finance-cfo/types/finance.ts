export type AccountType = "cash" | "bank" | "credit" | "investment";

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
};