import assert from "node:assert/strict";
import test from "node:test";

import { buildCatalogImageProxyUrl } from "./imageProxy";

test("buildCatalogImageProxyUrl routes remote catalog images through the worker image endpoint", () => {
  assert.equal(
    buildCatalogImageProxyUrl(
      "https://elevate-catalog-worker.yasir-kayani2001.workers.dev/catalog",
      "https://i.ebayimg.com/images/g/KakAAOSwC7NejfcD/s-l500.webp",
    ),
    "https://elevate-catalog-worker.yasir-kayani2001.workers.dev/img?url=https%3A%2F%2Fi.ebayimg.com%2Fimages%2Fg%2FKakAAOSwC7NejfcD%2Fs-l500.webp",
  );
});

test("buildCatalogImageProxyUrl preserves empty and unsupported image values", () => {
  assert.equal(buildCatalogImageProxyUrl("https://elevate-catalog-worker.yasir-kayani2001.workers.dev", null), null);
  assert.equal(buildCatalogImageProxyUrl("https://elevate-catalog-worker.yasir-kayani2001.workers.dev", ""), null);
  assert.equal(
    buildCatalogImageProxyUrl("https://elevate-catalog-worker.yasir-kayani2001.workers.dev", "data:image/png;base64,abc"),
    "data:image/png;base64,abc",
  );
});
