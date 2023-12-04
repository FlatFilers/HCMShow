import {
  ArrowTopRightOnSquareIcon,
  BoltIcon,
  PuzzlePieceIcon,
  SparklesIcon,
  UserGroupIcon,
  VariableIcon,
} from "@heroicons/react/24/outline";
import FeaturesList from "../shared/features-list";
import GoToSpace from "../shared/go-to-space";
import { SupportedLanguage } from "../language-context";

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
  flatfileSpaceId: string;
  language: SupportedLanguage;
};

const Workspace = ({ fileName, flatfileSpaceId, language }: Props) => {
  return (
    <div className="text-white">
      <p className="text-2xl mb-8">Your Flatfile space is configured. 🎉</p>

      <div className="flex flex-col md:flex-row justify-between lg:justify-start lg:space-x-12 space-y-12 md:space-y-0">
        <div className="md:max-w-md space-y-2">
          <p className="font-semibold mb-4">Upload Records in Flatfile</p>
          <p>
            Click the "Visit Flatfile Space" button below to access your
            dedicated space in Flatfile and receive a sign-in link via email.
          </p>
          <p>
            Upload the previously downloaded sample data after accessing the
            space.
          </p>
          <p>
            Once the data is uploaded and loaded into HCM Show, return to this
            page to review the data within the application.
          </p>

          <div className="space-y-4">
            <div className="flex flex-row items-center">
              <GoToSpace
                workflow="onboarding"
                flatfileSpaceId={flatfileSpaceId}
                language={language}
              >
                <button className="button-bg inline-flex flex-row items-center justify-between rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 mr-4">
                  Visit Flatfile Space
                  <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
                </button>
              </GoToSpace>
            </div>

            <p className="text-xs block text-gray-400">
              To download the sample data again{" "}
              <a
                className="underline text-gray-400"
                download={fileName}
                href={fileName}
              >
                click here.
              </a>
            </p>
          </div>
        </div>

        <FeaturesList
          type="project-onboarding"
          githubUrl="https://github.com/FlatFilers/hcm-show-config/blob/main/workflows/project/index.ts"
          features={features}
        />
      </div>
    </div>
  );
};

export default Workspace;
