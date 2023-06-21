import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  BoltIcon,
  PuzzlePieceIcon,
  SparklesIcon,
  UserGroupIcon,
  VariableIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { FlatfileSpaceData } from "../../lib/flatfile-legacy";
import { Space } from "@prisma/client";
import FeaturesList from "../shared/features-list";

export interface Step {
  name: string;
  status: "current" | "upcoming" | "complete";
}

const features = {
  Collaboration: UserGroupIcon,
  "Plug-in functionality": PuzzlePieceIcon,
  "Custom actions": BoltIcon,
  "External API calls": ArrowTopRightOnSquareIcon,
  "Custom Theming": VariableIcon,
  "Data Hooks": SparklesIcon,
};

type Props = {
  fileName: string;
  isSubmitting: boolean;
  handleSubmit: Function;
  buttonText: string;
  space: Space;
};

const Workspace = ({
  fileName,
  isSubmitting,
  handleSubmit,
  buttonText,
  space,
}: Props) => {
  return (
    <>
      <p className="text-2xl mb-8">Your Flatfile space is configured. 🎉</p>

      <div className="flex flex-row justify-between">
        <div>
          <p className="font-semibold mb-4">Upload Records in Flatfile</p>
          <p className="text-gray-600 mb-2 max-w-lg">
            Click the "Visit Flatfile Space" button below to access your
            dedicated space in Flatfile and receive a sign-in link via email.
          </p>
          <p className="text-gray-600 mb-2 max-w-lg">
            Upload the previously downloaded sample data after accessing the
            space.
          </p>
          <p className="text-gray-600 mb-4 max-w-lg">
            Once the data is uploaded and loaded into HCM Show, return to this
            page to review the data within the application.
          </p>

          <div className="flex flex-row items-center mb-8">
            <a
              target="_blank"
              href={
                (space.flatfileData as unknown as FlatfileSpaceData).guestLink
              }
              className="inline-flex flex-row items-center justify-between rounded-md border border-transparent bg-project-onboarding px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-project-onboarding focus:outline-none focus:ring-2 focus:ring-project-onboarding focus:ring-offset-2 mr-4"
            >
              Visit Flatfile Space
              <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
            </a>

            <form
              action="/api/flatfile/sync-records"
              method="post"
              onSubmit={() => handleSubmit}
            >
              <button
                onClick={() => toast.loading("Syncing...")}
                disabled={isSubmitting}
                type="submit"
                className={`${
                  isSubmitting ? "hover:cursor-not-allowed" : ""
                } border border-project-onboarding inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-project-onboarding hover:bg-project-onboarding hover:text-white`}
              >
                {buttonText}
                <ArrowPathIcon className="w-4 h-4 ml-1" />
              </button>
            </form>
          </div>

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

        <FeaturesList
          type="project-onboarding"
          githubUrl="https://github.com/FlatFilers/hcm-show-config/blob/main/workflows/project/index.ts"
          features={features}
        />
      </div>
    </>
  );
};

export default Workspace;
