import assert from "node:assert/strict";
import test from "node:test";

import { buildPayPalReturnMessage } from "./paypalReturnMessage";

test("buildPayPalReturnMessage shapes the popup return payload", () => {
  assert.deepEqual(
    buildPayPalReturnMessage({
      token: "token-1",
      payerId: "payer-1",
      status: "success",
    }),
    {
      type: "paypal:return",
      token: "token-1",
      payerId: "payer-1",
      status: "success",
    },
  );
});
