import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  BoltIcon,
  PuzzlePieceIcon,
  SparklesIcon,
  VariableIcon,
} from "@heroicons/react/24/outline";
import FeaturesList from "../shared/features-list";

export interface Step {
  name: string;
  status: "current" | "upcoming" | "complete";
}

const features = {
  Embedding: ArrowsPointingOutIcon,
  "Plug-in functionality": PuzzlePieceIcon,
  "Custom actions": BoltIcon,
  "External API calls": ArrowTopRightOnSquareIcon,
  "Custom Theming": VariableIcon,
  "Data Hooks": SparklesIcon,
};

type Props = {
  fileName: string;
  onClick: Function;
  showSpace: boolean;
};

const Workspace = ({ fileName, onClick, showSpace }: Props) => {
  return (
    <div className="mb-12">
      <p className="text-2xl mb-8">
        Your embedded Flatfile space is configured and ready for import. 🎉
      </p>

      <div className="flex flex-row justify-between">
        <div>
          <p className="font-semibold mb-4">Launch Flatfile</p>
          <p className="text-gray-400 mb-2 max-w-lg">
            Launch Flatfile via the “Import Benefit Elections” button below.
          </p>
          <p className="text-gray-400 mb-2 max-w-lg">
            Use the Sidebar in the embedded application to guide you through the
            import process!
          </p>

          <div className="flex flex-row items-center mb-8">
            <button
              onClick={() => onClick()}
              className={`px-4 py-2 inline-flex items-center justify-center rounded-md border text-sm font-medium shadow-sm mt-4 button-bg`}
            >
              {showSpace ? "Close Portal" : "Import Benefit Elections"}
              {showSpace ? (
                <ArrowsPointingInIcon className="w-4 h-4 ml-2" />
              ) : (
                <ArrowsPointingOutIcon className="w-4 h-4 ml-2" />
              )}
            </button>
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

        <FeaturesList
          type="embedded-portal"
          githubUrl="https://github.com/FlatFilers/hcm-show-config/blob/main/workflows/embedded/index.ts"
          features={features}
        />
      </div>
    </div>
  );
};

export default Workspace;
