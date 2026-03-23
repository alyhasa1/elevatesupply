import assert from "node:assert/strict";
import test from "node:test";

import { getCheckoutModalLayoutClasses } from "./checkoutModalLayout";

test("getCheckoutModalLayoutClasses keeps the footer visible with a scrollable middle section", () => {
  assert.deepEqual(getCheckoutModalLayoutClasses(), {
    viewport: "fixed inset-0 z-[100] overflow-y-auto p-4 sm:p-6",
    viewportInner: "flex min-h-full items-start justify-center sm:items-center",
    shell:
      "my-auto flex w-full max-w-2xl max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#11100f] text-white shadow-2xl sm:max-h-[90vh]",
    body: "min-h-0 flex-1 overflow-y-auto p-6 space-y-5",
    footer: "shrink-0 border-t border-white/10 bg-black/20 px-6 py-5",
  });
});
