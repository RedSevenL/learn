export type CalculationValue = string | number | boolean | null;

export type CalculationStep = {
  id: string;
  title: string;
  description: string;
  formula: string;
  inputs: Record<string, CalculationValue>;
  outputs: Record<string, CalculationValue>;
};