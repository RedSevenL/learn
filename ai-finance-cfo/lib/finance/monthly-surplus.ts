import { subtractMoney, toMoneyString } from "./money";

export type MonthlySurplusInput = {
  income: string;
  expense: string;
};

export type MonthlySurplusResult = {
  income: string;
  expense: string;
  surplus: string;
};

export function calculateMonthlySurplus(
  input: MonthlySurplusInput,
): MonthlySurplusResult {
  return {
    income: toMoneyString(input.income),
    expense: toMoneyString(input.expense),
    surplus: toMoneyString(subtractMoney(input.income, input.expense)),
  };
}
