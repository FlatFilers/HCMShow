import toast from "react-hot-toast";
import { SupportedLanguage } from "../language-context";

type Props = {
  fileName: string;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  buttonText: string;
  language: SupportedLanguage;
};

const SetupSpace = ({
  fileName,
  handleSubmit,
  isSubmitting,
  buttonText,
  language,
}: Props) => {
  return (
    <div className="text-white space-y-4 md:max-w-lg">
      <h2 className="text-2xl font-semibold">
        Let's setup Flatfile to import those records.
      </h2>
      <p className="">Click the button below to create the upload space. 👇</p>

      <form onSubmit={handleSubmit} method="post">
        <input type="hidden" name="language" value={language} />

        <button
          disabled={isSubmitting}
          className={`${
            isSubmitting ? "hover:cursor-not-allowed" : ""
          } button-bg inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm`}
          type="submit"
        >
          {buttonText}
        </button>
      </form>

      <p className="text-xs block text-gray-400">
        Need some sample data?{" "}
        <a
          className={`text-gray-400 underline`}
          download={fileName}
          href={fileName}
        >
          Click here to download.
        </a>
      </p>
    </div>
  );
};

export default SetupSpace;
