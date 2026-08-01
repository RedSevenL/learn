type MetricCardProps = {
  label: string;
  value: string;
  description?: string;
};

export function MetricCard({
  label,
  value,
  description,
}: MetricCardProps) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>

      <p className="mt-2 text-xl font-semibold text-gray-900">
        {value}
      </p>

      {description && (
        <p className="mt-1 text-xs text-gray-400">{description}</p>
      )}
    </article>
  );
}