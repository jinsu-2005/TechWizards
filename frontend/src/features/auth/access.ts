import { createContext, useContext } from "react";
export interface Access { privateMode: boolean; role: "local-demo" | "viewer" | "analyst" | "admin"; email?: string }
export const AccessContext = createContext<Access>({ privateMode: false, role: "local-demo" });
export function useAccess() {
  const access = useContext(AccessContext);
  return { ...access, canAdmin: !access.privateMode || access.role === "admin",
    canInvestigate: !access.privateMode || access.role === "admin" || access.role === "analyst" };
}
