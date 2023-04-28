import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

type Props = {
  fileName: string;
  onClick: Function;
  type: string;
};

const DownloadFile = ({ fileName, onClick, type }: Props) => {
  let buttonClasses = "";
  if (type === "project-onboarding") {
    buttonClasses =
      "text-project-onboarding border-project-onboarding hover:bg-project-onboarding hover:text-white";
  } else if (type === "embedded-portal") {
    buttonClasses =
      "text-embedded-portal border-embedded-portal hover:bg-embedded-portal hover:text-white";
  } else if (type === "file-feed") {
    buttonClasses =
      "text-file-feed border-file-feed hover:bg-file-feed hover:text-white";
  } else if (type === "dynamic-portal") {
    buttonClasses =
      "text-dynamic-portal border-dynamic-portal hover:bg-dynamic-portal hover:text-white";
  }

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
          className={`${buttonClasses} mb-12 inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold shadow-sm`}
          download={fileName}
          href={fileName}
          onClick={() => onClick()}
        >
          Download sample data
          <ArrowDownTrayIcon className="w-4 h-4 ml-2" />
        </a>
      </div>
    </div>
  );
};

export default DownloadFile;
