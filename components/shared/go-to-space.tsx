import toast from "react-hot-toast";
import { SupportedLanguage } from "../language-context";

type Props = {
  // TODO: Refactor WorkflowType and pass it in here
  workflow: string;
  flatfileSpaceId: string;
  language: SupportedLanguage;
  children: React.ReactNode;
};

const GoToSpace = ({
  workflow,
  flatfileSpaceId,
  language,
  children,
}: Props) => {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();

        const response = await fetch(
          `/api/flatfile/go-to-space?workflow=${workflow}&flatfileSpaceId=${flatfileSpaceId}&language=${language}`
        );

        if (response.ok) {
          const json = await response.json();
          const guestLink = json.guestLink;
          window.open(guestLink, "_blank");
        } else {
          toast.error("An error occurred opening the Flatfile Space.");
        }
      }}
    >
      {children}
    </form>
  );
};

export default GoToSpace;
