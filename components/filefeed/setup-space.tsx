import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

export const SetupSpace = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  let defaultText = "Setup Flatfile";
  const [buttonText, setButtonText] = useState<string>(defaultText);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    setButtonText("Setting up Flatfile...");
  };

  interface Step {
    name: string;
    status: "current" | "upcoming" | "complete";
  }

  const initialSteps: Step[] = [
    {
      name: "Setup Flatfile",
      status: "current",
    },
    {
      name: "Listen for File Uploads",
      status: "upcoming",
    },
  ];

  return (
    <div className="flex flex-row justify-between max-w-5xl">
      <div>
        <h2 className="text-2xl font-semibold mb-2">
          Let's get ready to listen for file feed uploads.
        </h2>
        <p className="text-gray-600 mb-4">
          First, let's setup Flatfile to listen for file uploads. 👇
        </p>
        <form
          action="/api/flatfile/create-filefeed-space"
          onSubmit={handleSubmit}
          className="mb-8"
        >
          <input type="hidden" name="focusBgColor" value="#616A7D" />
          <input type="hidden" name="backgroundColor" value="#090B2B" />
          <button
            onClick={() => toast.loading("Setting up Flatfile")}
            disabled={isSubmitting}
            className={`${
              isSubmitting ? "hover:cursor-not-allowed" : ""
            } bg-file-feed inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-file-feed focus:ring-offset-2 sm:w-auto}`}
            type="submit"
          >
            {buttonText}
          </button>
        </form>
      </div>

      <nav className="flex justify-center" aria-label="Progress">
        <ol role="list" className="space-y-6">
          {initialSteps.map((step) => (
            <li key={step.name}>
              {step.status === "complete" ? (
                <a className="group">
                  <span className="flex items-start">
                    <span className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center">
                      <CheckCircleIcon
                        className="h-full w-full text-file-feed"
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
                    <span className="relative block h-2 w-2 rounded-full bg-file-feed" />
                  </span>
                  <span className="ml-3 text-sm font-medium text-file-feed">
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
