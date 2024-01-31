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
    <div className="text-white">
      <p className="text-2xl mb-8 md:max-w-lg">
        Your embedded Flatfile space is configured and ready for import. 🎉
      </p>

      <div className="flex flex-col md:flex-row justify-between lg:justify-start lg:space-x-12 space-y-12 md:space-y-0">
        <div className="md:max-w-md">
          <p className="font-semibold mb-4">Launch Flatfile</p>
          <p>
            Launch Flatfile via the “Import Benefit Elections” button below.
          </p>
          <p>
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
      </div>
    </div>
  );
};

export default Workspace;
