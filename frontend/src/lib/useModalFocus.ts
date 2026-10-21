import { useEffect, useRef, type RefObject } from "react";

const controls = 'button, a[href], input, select, textarea, summary, [tabindex]';

/** Keep keyboard and assistive-technology navigation inside an open modal. */
export function useModalFocus(
  open: boolean,
  ref: RefObject<HTMLElement>,
  onClose: () => void,
  initialFocus: string,
) {
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);
  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const background: Array<[HTMLElement, boolean]> = [];
    let branch: HTMLElement | null = dialog;
    while (branch?.parentElement) {
      for (const sibling of branch.parentElement.children) {
        if (sibling !== branch && sibling instanceof HTMLElement && !sibling.hasAttribute("data-dialog-backdrop")) {
          background.push([sibling, sibling.inert]);
          sibling.inert = true;
        }
      }
      if (branch.parentElement === document.body) break;
      branch = branch.parentElement;
    }
    const tabbable = () => Array.from(dialog.querySelectorAll<HTMLElement>(controls)).filter((el) =>
      el.tabIndex >= 0 && !el.matches(':disabled') && !el.closest('[inert]') &&
      el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden",
    );
    (dialog.querySelector<HTMLElement>(initialFocus) ?? tabbable()[0] ?? dialog).focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close.current();
        return;
      }
      if (event.key !== "Tab") return;
      const items = tabbable(), first = items[0], last = items[items.length - 1];
      if (!first) { event.preventDefault(); dialog.focus(); return; }
      if (!dialog.contains(document.activeElement) || (event.shiftKey && document.activeElement === first)) {
        event.preventDefault(); (event.shiftKey ? last : first)?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      document.body.style.overflow = overflow;
      for (const [element, inert] of background) element.inert = inert;
      if (previous?.isConnected && !previous.closest('[inert]')) previous.focus();
    };
  }, [open, ref, initialFocus]);
}
