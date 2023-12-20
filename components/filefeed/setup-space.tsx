import { FormEvent, useContext, useState } from "react";
import toast from "react-hot-toast";
import { LanguageContext } from "../language-context";

export const SetupSpace = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  let defaultText = "Setup Flatfile";
  const [buttonText, setButtonText] = useState<string>(defaultText);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    setButtonText("Setting up Flatfile...");
  };

  const context = useContext(LanguageContext);
  const { language } = context;

  return (
    <div className="text-white space-y-4 md:max-w-lg">
      <h2 className="text-2xl font-semibold">
        Let's get ready to listen for file feed uploads.
      </h2>
      <p className="">
        First, let's setup Flatfile to listen for file uploads. 👇
      </p>
      <form
        method="post"
        action="/api/flatfile/create-filefeed-space"
        onSubmit={handleSubmit}
      >
        <input type="hidden" name="language" value={language} />

        <button
          onClick={() => toast.loading("Setting up Flatfile")}
          disabled={isSubmitting}
          className={`${
            isSubmitting ? "hover:cursor-not-allowed" : ""
          } button-bg inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-file-feed focus:ring-offset-2 sm:w-auto}`}
          type="submit"
        >
          {buttonText}
        </button>
      </form>
    </div>
  );
};
