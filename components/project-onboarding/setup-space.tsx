import { CheckCircleIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export interface Step {
  name: string;
  status: "current" | "upcoming" | "complete";
}

type Props = {
  fileName: string;
  handleSubmit: Function;
  isSubmitting: boolean;
  buttonText: string;
};

const SetupSpace = ({
  fileName,
  handleSubmit,
  isSubmitting,
  buttonText,
}: Props) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">
        🎉 Great! Now let's setup Flatfile to import those records.
      </h2>
      <p className="text-gray-600 mb-4">
        Click the button below and we'll configure the upload space and invite
        you to it. 👇
      </p>
      <form
        action="/api/flatfile/create-space"
        onSubmit={() => handleSubmit}
        className="mb-8"
      >
        <button
          onClick={() => toast.loading("Setting up Flatfile")}
          disabled={isSubmitting}
          className={`${
            isSubmitting
              ? "bg-project-onboarding hover:cursor-not-allowed"
              : "bg-project-onboarding hover:bg-project-onboarding "
          } inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-project-onboarding focus:ring-offset-2 sm:w-auto}`}
          type="submit"
        >
          {buttonText}
        </button>
      </form>

      <p className="text-xs block text-gray-600">
        To download the sample data again{" "}
        <a
          className="underline text-project-onboarding"
          download={fileName}
          href={fileName}
        >
          click here.
        </a>
      </p>
    </div>
  );
};

export default SetupSpace;
