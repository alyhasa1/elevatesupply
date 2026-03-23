import assert from "node:assert/strict";
import test from "node:test";

import { getAuthRedirectPath } from "./authRedirects";

test("admins land on the admin dashboard after auth", () => {
  assert.equal(getAuthRedirectPath({ isAdmin: true }), "/admin");
});

test("non-admin users land on the orders page after auth", () => {
  assert.equal(getAuthRedirectPath({ isAdmin: false }), "/orders");
});
