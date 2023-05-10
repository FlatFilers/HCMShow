import { useEffect, RefObject } from "react";

type Handler = (event: MouseEvent | TouchEvent) => void;

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

    document.addEventListener("mousedown", mouseDownListener);
    document.addEventListener("touchstart", touchStartListener);

    return () => {
      document.removeEventListener("mousedown", mouseDownListener);
      document.removeEventListener("touchstart", touchStartListener);
    };
  }, [ref, handler]);
}
