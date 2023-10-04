import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import StepList from "../shared/step-list";

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
    <div className="flex flex-row justify-between max-w-5xl text-white">
      <div>
        <h2 className="text-2xl font-semibold mb-2">
          Let's get ready to listen for file feed uploads.
        </h2>
        <p className="text-gray-400 mb-4">
          First, let's setup Flatfile to listen for file uploads. 👇
        </p>
        <form
          action="/api/flatfile/create-filefeed-space"
          onSubmit={handleSubmit}
          className="mb-8"
        >
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

      <StepList steps={initialSteps} />
    </div>
  );
};
