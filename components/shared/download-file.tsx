import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

type Props = {
  fileName: string;
  onClick: Function;
};

const DownloadFile = ({ fileName, onClick }: Props) => {
  return (
    <div className="text-white">
      <p className="text-2xl font-semibold mb-2">
        Let's get ready to upload data into Flatfile.
      </p>
      <p className="text-gray-400">
        First, download the sample data we'll import into Flatfile. 👇
      </p>
      <div className="mt-4 flex">
        <a
          className={`button-bg mb-8 inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold shadow-sm`}
          download={fileName}
          href={fileName}
          onClick={() => onClick()}
        >
          Download sample data
          <ArrowDownTrayIcon className="w-4 h-4 ml-2" />
        </a>
      </div>
      <div className="flex text-xs text-gray-400 w-fit">
        <div className="block mr-1">Already have example data?</div>
        <div
          className="block underline text-xs text-gray-400 hover:cursor-pointer"
          onClick={() => onClick()}
        >
          Click here.
        </div>
      </div>
    </div>
  );
};

export default DownloadFile;
