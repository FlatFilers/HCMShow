import toast from "react-hot-toast";

type Props = {
  // TODO: Refactor WorkflowType and pass it in here
  workflow: string;
  flatfileSpaceId: string;
  children: React.ReactNode;
};

const GoToSpace = ({ workflow, flatfileSpaceId, children }: Props) => {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();

        const response = await fetch(
          `/api/flatfile/go-to-space?workflow=${workflow}&flatfileSpaceId=${flatfileSpaceId}`
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
