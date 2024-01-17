import toast from "react-hot-toast";
import useLanguage from "../../lib/hooks/use-language";

type Props = {
  // TODO: Refactor WorkflowType and pass it in here
  workflow: string;
  flatfileSpaceId: string;
  children: React.ReactNode;
};

const GoToSpace = ({ workflow, flatfileSpaceId, children }: Props) => {
  const language = useLanguage();

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
