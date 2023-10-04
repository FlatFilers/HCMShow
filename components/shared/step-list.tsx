import { CheckCircleIcon } from "@heroicons/react/20/solid";

export interface Step {
  name: string;
  status: "current" | "upcoming" | "complete";
}

type Props = { type: string; steps: Step[] };

const StepList = ({ type, steps }: Props) => {
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
                        className={`text-gray-400 h-full w-full`}
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
                    <span
                      className={`bg-white opacity-30 absolute h-4 w-4 rounded-full`}
                    />
                    <span
                      className={`bg-white relative block h-2 w-2 rounded-full`}
                    />
                  </span>
                  <span className={`text-white ml-3 text-sm font-medium`}>
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
                      <div className="h-2 w-2 rounded-full bg-gray-500" />
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
