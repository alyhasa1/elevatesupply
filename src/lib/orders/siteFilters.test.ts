import assert from "node:assert/strict";
import test from "node:test";

import { filterElevateOrders } from "./siteFilters";

test("filterElevateOrders keeps only elevate_supply rows", () => {
  const rows = [
    { id: "1", site_key: "elevate_supply" },
    { id: "2", site_key: "ecomwithyasir" },
    { id: "3", site_key: null },
  ];

  assert.deepEqual(filterElevateOrders(rows), [{ id: "1", site_key: "elevate_supply" }]);
});
