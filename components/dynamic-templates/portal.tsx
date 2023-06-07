import { XCircleIcon } from "@heroicons/react/24/outline";
import { useRef } from "react";
import { useOnClickOutside } from "../../lib/hooks/usehooks";
import { ISpace, useSpace } from "@flatfile/react";

type Props = {
  closeSpace: Function;
  spaceProps: ISpace;
};

export const Portal = ({ closeSpace, spaceProps }: Props) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  useOnClickOutside(modalRef, () => closeSpace());

  // TODO: Add styled error component
  const { component } = useSpace({ ...spaceProps });

  return (
    <div className="absolute top-0 right-0 w-full h-full bg-black/60">
      <div className="relative mt-16 mx-auto max-w-7xl">
        <XCircleIcon
          className="h-7 w-7 absolute top-[-32px] right-[-20px] hover:cursor-pointer text-white"
          onClick={() => closeSpace()}
        >
          X
        </XCircleIcon>
        <div ref={modalRef}>{component}</div>
      </div>
    </div>
  );
};
