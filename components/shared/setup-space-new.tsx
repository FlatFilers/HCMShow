import toast from "react-hot-toast";

type Props = {
  actionHref: string;
  fileName: string;
  handleSubmit: Function;
  isSubmitting: boolean;
  buttonText: string;
};

const SetupSpaceNew = ({
  actionHref,
  fileName,
  handleSubmit,
  isSubmitting,
  buttonText,
}: Props) => {
  return (
    <div className="text-white">
      <h2 className="text-2xl font-semibold mb-2">
        🎉 Great! Now let's setup Flatfile to import those records.
      </h2>
      <p className="text-gray-400 mb-4">
        Click the button below and we'll configure the upload space and invite
        you to it. 👇
      </p>
      <form
        action={actionHref}
        onSubmit={() => handleSubmit()}
        className="mb-8"
      >
        <button
          onClick={() => toast.loading("Setting up Flatfile")}
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
        To download the sample data again,{" "}
        <a
          className={`text-gray-400 underline`}
          download={fileName}
          href={fileName}
        >
          click here.
        </a>
      </p>
    </div>
  );
};

export default SetupSpaceNew;
