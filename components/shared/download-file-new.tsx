import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

type Props = {
  fileName: string;
  onClick: Function;
};

const DownloadFileNew = ({ fileName, onClick }: Props) => {
  return (
    <div className="text-white space-y-4">
      <h2 className="text-xl font-semibold">
        Let's get ready to upload data into Flatfile.
      </h2>
      <p className="">First, download the sample data. 👇</p>
      <a
        className={`button-bg space-x-2 w-full md:w-1/2 lg:w-1/4 inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold shadow-sm`}
        download={fileName}
        href={fileName}
        onClick={() => onClick()}
      >
        <span>Download sample data</span>
        <ArrowDownTrayIcon className="w-4 h-4" />
      </a>
      <div className="flex text-xs text-gray-400 w-fit space-x-1">
        <div className="block">Already have example data?</div>
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

export default DownloadFileNew;
