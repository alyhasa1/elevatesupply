# Product Detail Partial Stock Design

## Goal

Make the Elevate Supply product page reflect mixed variation stock more accurately without changing the global catalog availability model.

## Scope

- Add a detail-page-only `Partial stock` status when a product has a mix of in-stock and out-of-stock variations.
- Keep existing catalog-level availability values unchanged:
  - `in_stock`
  - `out_of_stock`
  - `ended`
- Disable variation options on the product page when they cannot lead to an in-stock variation under the current partial selection.
- Prefer an in-stock variation as the default resolved selection when one exists.
- Keep checkout disabled unless the resolved selected variation is in stock.

## Non-Goals

- Do not add a new global catalog availability enum.
- Do not change catalog filters, product cards, admin counts, or worker response contracts.
- Do not change order creation or checkout flow.

## Design

### Detail Status

The product detail page will derive a display-only status from the product and its variations:

- `Ended` if the product is ended
- `Out of stock` if every variation is unavailable
- `Partial stock` if at least one variation is available and at least one variation is unavailable
- `In stock` if every variation is available, or if the product has no variations and is marked in stock

This status is presentation-only and does not replace the stored `CatalogProduct.availability` value.

### Variation Resolution

Variation resolution should remain resilient when a user selects a combination that does not exactly exist, but it should now prefer in-stock variations over out-of-stock ones when scores tie or when choosing an initial variation.

### Option Availability

Each option value in a selector should be evaluated against the current partial selection:

- enabled if selecting it can still resolve to an in-stock variation
- disabled if it only maps to out-of-stock variations

The selector should not let the user pick an unavailable option.

## Testing

- Add a test for mixed variation stock producing a `Partial stock` detail status.
- Add tests proving variation resolution prefers in-stock variations.
- Add tests proving option values are marked unavailable when they only lead to out-of-stock variations.
