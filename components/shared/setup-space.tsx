import toast from "react-hot-toast";

type Props = {
  actionHref: string;
  fileName: string;
  handleSubmit: Function;
  isSubmitting: boolean;
  buttonText: string;
  type: string;
};

const SetupSpace = ({
  actionHref,
  fileName,
  handleSubmit,
  isSubmitting,
  buttonText,
  type,
}: Props) => {
  let buttonClasses = "";
  if (type === "project-onboarding") {
    buttonClasses = "bg-project-onboarding";
  } else if (type === "embedded-portal") {
    buttonClasses = "bg-embedded-portal";
  } else if (type === "file-feed") {
    buttonClasses = "bg-file-feed";
  } else if (type === "dynamic-portal") {
    buttonClasses = "bg-dynamic-portal";
  }

  let downloadLinkColors = "";
  if (type === "project-onboarding") {
    downloadLinkColors = "text-project-onboarding";
  } else if (type === "embedded-portal") {
    downloadLinkColors = "text-embedded-portal";
  } else if (type === "file-feed") {
    downloadLinkColors = "text-file-feed";
  } else if (type === "dynamic-portal") {
    downloadLinkColors = "text-dynamic-portal";
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">
        🎉 Great! Now let's setup Flatfile to import those records.
      </h2>
      <p className="text-gray-600 mb-4">
        Click the button below and we'll configure the upload space and invite
        you to it. 👇
      </p>
      <form action={actionHref} onSubmit={() => handleSubmit} className="mb-8">
        <button
          onClick={() => toast.loading("Setting up Flatfile")}
          disabled={isSubmitting}
          className={`${
            isSubmitting ? "hover:cursor-not-allowed" : ""
          } ${buttonClasses} inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm`}
          type="submit"
        >
          {buttonText}
        </button>
      </form>

      <p className="text-xs block text-gray-600">
        To download the sample data again{" "}
        <a
          className={`${downloadLinkColors} underline`}
          download={fileName}
          href={fileName}
        >
          click here.
        </a>
      </p>
    </div>
  );
};

export default SetupSpace;
