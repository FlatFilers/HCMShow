import { CheckCircleIcon } from "@heroicons/react/24/outline";

export interface Step {
  name: string;
  status: "current" | "upcoming" | "complete";
}

type Props = {
  fileName: string;
  onClick: Function;
};

const DownloadFile = ({ fileName, onClick }: Props) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">
        Let's get ready to upload data into Flatfile.
      </h2>
      <p className="text-gray-600">
        First, download the sample data we'll import into Flatfile. 👇
      </p>
      <div className="mt-4 flex">
        <a
          className="hover:text-white mb-12 inline-flex items-center justify-center rounded-md border text-project-onboarding border-project-onboarding px-4 py-2 text-sm font-medium shadow-sm hover:bg-project-onboarding focus:outline-none focus:ring-2 focus:ring-project-onboarding focus:ring-offset-2 sm:w-auto"
          download={fileName}
          href={fileName}
          onClick={() => onClick()}
        >
          Download sample data
        </a>
      </div>
    </div>
  );
};

export default DownloadFile;
