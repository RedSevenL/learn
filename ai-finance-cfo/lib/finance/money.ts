import Decimal from "decimal.js";

export type Money = Decimal;
export type MoneyInput = string | Decimal;

export function createMoney(value: MoneyInput): Money {
  const money = new Decimal(value);

  if (!money.isFinite()) {
    throw new Error("金额必须是有限数字");
  }

  return money;
}

export function addMoney(left: MoneyInput, right: MoneyInput): Money {
  return createMoney(left).plus(createMoney(right));
}

export function subtractMoney(left: MoneyInput, right: MoneyInput): Money {
  return createMoney(left).minus(createMoney(right));
}

export function multiplyMoney(
  amount: MoneyInput,
  multiplier: MoneyInput,
): Money {
  return createMoney(amount).times(createMoney(multiplier));
}

export function divideMoney(amount: MoneyInput, divisor: MoneyInput): Money {
  const decimalDivisor = createMoney(divisor);

  if (decimalDivisor.isZero()) {
    throw new Error("除数不能为 0");
  }

  return createMoney(amount).dividedBy(decimalDivisor);
}

export function toMoneyString(value: MoneyInput): string {
  return createMoney(value).toFixed(2, Decimal.ROUND_HALF_UP);
}

export function formatMoney(value: MoneyInput, symbol = "¥"): string {
  const fixedValue = toMoneyString(value);
  const isNegative = fixedValue.startsWith("-");
  const unsignedValue = isNegative ? fixedValue.slice(1) : fixedValue;
  const [integerPart, decimalPart] = unsignedValue.split(".");
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const sign = isNegative ? "-" : "";

  return `${sign}${symbol}${groupedInteger}.${decimalPart}`;
}
