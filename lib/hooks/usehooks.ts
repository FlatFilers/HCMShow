import { ParsedUrlQuery } from "querystring";
import { useEffect, RefObject } from "react";
import toast from "react-hot-toast";

type Handler = (event: MouseEvent | TouchEvent | KeyboardEvent) => void;

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: Handler
) {
  useEffect(() => {
    const mouseDownListener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    const touchStartListener = (event: TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    const escapeKeyListener = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handler(event);
      }
    };

    document.addEventListener("mousedown", mouseDownListener);
    document.addEventListener("touchstart", touchStartListener);
    document.addEventListener("keydown", escapeKeyListener);

    return () => {
      document.removeEventListener("mousedown", mouseDownListener);
      document.removeEventListener("touchstart", touchStartListener);
      document.removeEventListener("keydown", escapeKeyListener);
    };
  }, [ref, handler]);
}

export function useFlashMessages(
  routerQuery: ParsedUrlQuery,
  replaceUrl: string
) {
  useEffect(() => {
    // console.log("routerQuery", routerQuery);
    // console.log("replaceUrl", replaceUrl);

    if (routerQuery.flash === "success") {
      window.history.replaceState(null, "", replaceUrl);
      toast.success(routerQuery.message as string, {
        id: routerQuery.message as string,
        duration: 4000,
      });
    } else if (routerQuery.flash === "error") {
      window.history.replaceState(null, "", replaceUrl);
      toast.error(routerQuery.message as string, {
        id: routerQuery.message as string,
      });
    } else if (routerQuery.message === "No Records Found") {
      window.history.replaceState(null, "", replaceUrl);
      toast.error("No Records Found", { id: "No Records Found" });
    } else if (routerQuery.message === "Created space") {
      window.history.replaceState(null, "", replaceUrl);
      toast.success("Created space", { id: "Created space" });
    }
  }, []);
}
