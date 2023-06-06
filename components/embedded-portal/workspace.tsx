import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  BoltIcon,
  PuzzlePieceIcon,
  SparklesIcon,
  UserGroupIcon,
  VariableIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { FlatfileSpaceData } from "../../lib/flatfile";
import { Space } from "@prisma/client";
import FeaturesList from "../shared/features-list";
import { useRef } from "react";
import { useOnClickOutside } from "../../lib/hooks/usehooks";
import { useSpace } from "@flatfile/react";

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
  closeSpace: Function;
  spaceProps: any; // todo
};

const Workspace = ({
  fileName,
  onClick,
  showSpace,
  closeSpace,
  spaceProps,
}: Props) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  useOnClickOutside(modalRef, () => closeSpace());

  const { component } = useSpace({ ...spaceProps });

  return (
    <div className="mb-12">
      <p className="text-2xl mb-8">
        Your embedded Flatfile space is configured and ready for import. 🎉
      </p>

      <div className="flex flex-row justify-between">
        <div>
          <p className="font-semibold mb-4">Launch Flatfile</p>
          <p className="text-gray-600 mb-2 max-w-lg">
            Launch Flatfile via the “Import Benefit Elections” button below.
          </p>
          <p className="text-gray-600 mb-2 max-w-lg">
            Use the Sidebar in the embedded application to guide you through the
            import process!
          </p>

          <div className="flex flex-row items-center mb-8">
            <button
              onClick={() => onClick()}
              className={`px-4 py-2 inline-flex items-center justify-center rounded-md border text-sm font-medium shadow-sm mt-4 ${
                showSpace
                  ? "bg-white text-embedded-portal border-2 border-embedded-portal"
                  : "bg-embedded-portal text-white border-transparent"
              }`}
            >
              {showSpace ? "Close Portal" : "Import Benefit Elections"}
              {showSpace ? (
                <ArrowsPointingInIcon className="w-4 h-4 ml-2" />
              ) : (
                <ArrowsPointingOutIcon className="w-4 h-4 ml-2" />
              )}
            </button>
          </div>

          <p className="text-xs block text-gray-600">
            To download the sample data again{" "}
            <a
              className="underline text-embedded-portal"
              download={fileName}
              href={fileName}
            >
              click here.
            </a>
          </p>
        </div>

        <FeaturesList
          type="embedded-portal"
          githubUrl="https://github.com/FlatFilers/hcm-show-config/blob/main/src/workflows/embedded-workflow/index.ts"
          features={features}
        />
      </div>

      {showSpace && (
        <div className="absolute top-0 right-0 h-full w-full bg-black/60">
          <div className="relative mt-16 mx-auto max-w-7xl">
            <XCircleIcon
              className="h-7 w-7 absolute top-[-32px] right-[-20px] hover:cursor-pointer text-white"
              onClick={() => closeSpace()}
            >
              X
            </XCircleIcon>
            <div ref={modalRef}>{component}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workspace;
