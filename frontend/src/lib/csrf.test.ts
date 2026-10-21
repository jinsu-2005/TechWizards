import { afterEach, expect, it, vi } from "vitest";
import { csrfHeaders } from "./csrf";
afterEach(() => vi.unstubAllGlobals());
it("uses the host-scoped CSRF cookie and never a session cookie", () => {
  vi.stubGlobal("document", { cookie: "other=x; __Host-at_csrf=csrf-token" });
  expect(csrfHeaders()).toEqual({ "x-csrf-token": "csrf-token" });
});
it("does not manufacture authentication in local mode", () => {
  vi.stubGlobal("document", { cookie: "at_session=not-a-csrf-token" });
  expect(csrfHeaders()).toEqual({});
});
