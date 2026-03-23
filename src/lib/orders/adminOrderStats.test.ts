import assert from "node:assert/strict";
import test from "node:test";

import { summarizeElevateOrders } from "./adminOrderStats";

test("summarizeElevateOrders ignores non-elevate rows", () => {
  const stats = summarizeElevateOrders([
    { site_key: "elevate_supply", total: 25, status: "processing" },
    { site_key: "ecomwithyasir", total: 100, status: "processing" },
    { site_key: "elevate_supply", total: 10, status: "shipped" },
  ]);

  assert.equal(stats.totalOrders, 2);
  assert.equal(stats.totalValue, 35);
  assert.deepEqual(stats.byStatus, {
    processing: 1,
    shipped: 1,
  });
});
