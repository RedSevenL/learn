import type { CalculationStep } from "@/lib/finance/calculation-step";

export function CalculationSteps({ steps }: { steps: CalculationStep[] }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-gray-900">计算依据</h2>

      <div className="mt-4 space-y-4">
        {steps.map((step, index) => (
          <article
            key={step.id}
            className="rounded-lg border border-gray-200 bg-white p-5"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-xs text-white">
                {index + 1}
              </span>
              <h3 className="font-semibold text-gray-900">{step.title}</h3>
            </div>

            <p className="mt-3 text-sm text-gray-600">{step.description}</p>

            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500">公式</p>
              <code className="mt-1 block overflow-x-auto rounded bg-gray-50 p-3 text-xs text-gray-800">
                {step.formula}
              </code>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <StepValues title="输入" values={step.inputs} />
              <StepValues title="输出" values={step.outputs} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function StepValues({
  title,
  values,
}: {
  title: string;
  values: CalculationStep["inputs"];
}) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500">{title}</p>
      <dl className="mt-2 space-y-1 text-xs">
        {Object.entries(values).map(([key, value]) => (
          <div key={key} className="flex justify-between gap-4">
            <dt className="text-gray-500">{key}</dt>
            <dd className="break-all text-right text-gray-900">
              {String(value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}