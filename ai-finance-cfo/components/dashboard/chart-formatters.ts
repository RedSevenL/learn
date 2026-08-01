// ── 图表专用的金额格式化 ──────────────────────────
// 坐标轴使用紧凑格式（万），Tooltip 使用完整格式

export function formatAxisMoney(value: number): string {
  if (Math.abs(value) >= 10000) {
    return `${(value / 10000).toFixed(1)}万`;
  }

  return `${Math.round(value)}`;
}

export function formatTooltipMoney(value: number): string {
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const fixed = absValue.toFixed(2);
  const [integerPart, decimalPart] = fixed.split(".");
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return `${isNegative ? "-" : ""}¥${groupedInteger}.${decimalPart}`;
}

export function formatTooltipPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}