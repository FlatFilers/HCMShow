import { CheckCircleIcon } from "@heroicons/react/20/solid";

export interface Step {
  name: string;
  status: "current" | "upcoming" | "complete";
}

type Props = { steps: Step[] };

const StepList = ({ steps }: Props) => {
  return (
    <div className="">
      <nav className="flex justify-center" aria-label="Progress">
        <ol role="list" className="space-y-6">
          {steps.map((step) => (
            <li key={step.name}>
              {step.status === "complete" ? (
                <a className="group">
                  <span className="flex items-start">
                    <span className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center">
                      <CheckCircleIcon
                        className="h-full w-full text-project-onboarding"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="ml-3 text-sm font-medium text-gray-500">
                      {step.name}
                    </span>
                  </span>
                </a>
              ) : step.status === "current" ? (
                <a className="flex items-start" aria-current="step">
                  <span
                    className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="absolute h-4 w-4 rounded-full bg-blue-200" />
                    <span className="relative block h-2 w-2 rounded-full bg-project-onboarding" />
                  </span>
                  <span className="ml-3 text-sm font-medium text-project-onboarding">
                    {step.name}
                  </span>
                </a>
              ) : (
                <a className="group">
                  <div className="flex items-start">
                    <div
                      className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center"
                      aria-hidden="true"
                    >
                      <div className="h-2 w-2 rounded-full bg-gray-300" />
                    </div>
                    <p className="ml-3 text-sm font-medium text-gray-500">
                      {step.name}
                    </p>
                  </div>
                </a>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};

export default StepList;
