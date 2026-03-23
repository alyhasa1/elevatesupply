import { Edit3, ImageIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency, getAvailabilityLabel } from "@/lib/catalog/format";
import type { CatalogProduct } from "@/lib/catalog/types";

function parseCheckbox(value: FormDataEntryValue | null): boolean {
  return value === "on" || value === "true";
}

function parseGalleryUrls(value: FormDataEntryValue | null): string[] {
  return String(value || "")
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function formatGalleryUrls(images: string[]): string {
  return images.join("\n");
}

function formatVariationOptions(selects: Record<string, string>) {
  return (
    Object.entries(selects)
      .filter(([key, value]) => !key.endsWith("_signal") && Boolean(value))
      .map(([key, value]) => `${key}: ${value}`)
      .join(" · ") || "Single variation"
  );
}

interface ProductEditorProps {
  product: CatalogProduct;
  busyKey: string | null;
  onRunAction: (key: string, action: () => Promise<void>, successMessage: string) => Promise<void>;
  saveListingPrice: (payload: {
    trackerId: CatalogProduct["trackerId"];
    listingId: string;
    basePrice?: number;
    clearOverride?: boolean;
  }) => Promise<void>;
  saveVariationPrice: (payload: {
    trackerId: CatalogProduct["trackerId"];
    listingId: string;
    variationId: string;
    basePrice?: number;
    clearOverride?: boolean;
  }) => Promise<void>;
  saveShippingPrice: (payload: { listingId: string; shippingPrice?: number; clearOverride?: boolean }) => Promise<void>;
  saveListingContent: (payload: {
    trackerId: CatalogProduct["trackerId"];
    listingId: string;
    description?: string;
    image?: string | null;
    images?: string[] | null;
    clearDescription?: boolean;
    clearImages?: boolean;
  }) => Promise<void>;
  saveVariationHeroImage: (payload: {
    trackerId: CatalogProduct["trackerId"];
    listingId: string;
    variationId: string;
    heroImage?: string | null;
    clearOverride?: boolean;
  }) => Promise<void>;
  saveJacketListing: (listingId: string, payload: Record<string, unknown>) => Promise<void>;
  saveJacketVariation: (variationId: string, payload: Record<string, unknown>) => Promise<void>;
}

export function AdminProductEditor({
  product,
  busyKey,
  onRunAction,
  saveListingPrice,
  saveVariationPrice,
  saveShippingPrice,
  saveListingContent,
  saveVariationHeroImage,
  saveJacketListing,
  saveJacketVariation,
}: ProductEditorProps) {
  const isReadOnly = product.trackerId === "account_building";
  const isJacket = product.trackerId === "pakistani_jackets";

  return (
    <details className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <summary className="list-none cursor-pointer px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              {product.image ? (
                <img src={product.image} alt={product.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-slate-100 to-white" />
              )}
            </div>
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{product.trackerName}</Badge>
                <Badge variant="outline">{getAvailabilityLabel(product.availability)}</Badge>
                {isReadOnly ? <Badge variant="outline">Read only</Badge> : null}
              </div>
              <div className="font-semibold text-slate-900">{product.title}</div>
              <div className="text-sm text-slate-500">
                {product.listingId} · {product.variations.length > 0 ? `${product.variations.length} variations` : "Single item"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div>
              <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">Public</div>
              <div className="font-semibold text-slate-900">{formatCurrency(product.displayPrice, product.currency)}</div>
            </div>
            <div>
              <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">Base</div>
              <div className="font-semibold text-slate-900">{formatCurrency(product.basePrice, product.currency)}</div>
            </div>
            <div>
              <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">Shipping</div>
              <div className="font-semibold text-slate-900">
                {product.shippingPrice !== null ? formatCurrency(product.shippingPrice, product.currency) : "n/a"}
              </div>
            </div>
            <div className="flex items-center gap-2 font-medium text-indigo-600">
              <Edit3 className="h-4 w-4" />
              Expand
            </div>
          </div>
        </div>
      </summary>

      <div className="space-y-6 border-t border-slate-100 px-4 pb-6 pt-6 sm:px-6">
        {!isReadOnly ? (
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Storefront Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form
                className="grid gap-4 lg:grid-cols-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  const formData = new FormData(event.currentTarget);
                  void onRunAction(
                    `${product.id}:content`,
                    () =>
                      saveListingContent({
                        trackerId: product.trackerId,
                        listingId: product.listingId,
                        description: String(formData.get("description") || ""),
                        image: String(formData.get("image") || "").trim() || null,
                        images: parseGalleryUrls(formData.get("images")),
                      }),
                    `Saved content overrides for ${product.title}.`,
                  );
                }}
              >
                <div className="space-y-2 lg:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <textarea
                    name="description"
                    defaultValue={product.description}
                    rows={5}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Primary image URL</label>
                  <Input name="image" defaultValue={product.image || ""} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Gallery URLs</label>
                  <textarea
                    name="images"
                    defaultValue={formatGalleryUrls(product.images)}
                    rows={5}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    placeholder="One image URL per line"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-slate-700">Current hero image</div>
                  <div className="flex h-36 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {product.image ? (
                      <img src={product.image} alt={product.title} className="h-full w-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <ImageIcon className="h-4 w-4" />
                        No image
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-slate-700">Current gallery count</div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                    {product.images.length > 0 ? `${product.images.length} gallery images stored` : "No gallery images stored"}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 lg:col-span-2">
                  <Button type="submit" disabled={busyKey === `${product.id}:content`}>
                    Save Content
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busyKey === `${product.id}:clear-description`}
                    onClick={() => {
                      void onRunAction(
                        `${product.id}:clear-description`,
                        () =>
                          saveListingContent({
                            trackerId: product.trackerId,
                            listingId: product.listingId,
                            clearDescription: true,
                          }),
                        `Cleared description for ${product.title}.`,
                      );
                    }}
                  >
                    Clear Description
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busyKey === `${product.id}:clear-images`}
                    onClick={() => {
                      void onRunAction(
                        `${product.id}:clear-images`,
                        () =>
                          saveListingContent({
                            trackerId: product.trackerId,
                            listingId: product.listingId,
                            clearImages: true,
                          }),
                        `Cleared image overrides for ${product.title}.`,
                      );
                    }}
                  >
                    Reset Images To Source
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {!isReadOnly && !isJacket ? (
          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Listing Price Override</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <form
                  className="flex flex-col gap-3 sm:flex-row"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    void onRunAction(
                      `${product.id}:listing`,
                      () =>
                        saveListingPrice({
                          trackerId: product.trackerId,
                          listingId: product.listingId,
                          basePrice: Number(formData.get("basePrice") || 0),
                        }),
                      `Updated listing price for ${product.title}.`,
                    );
                  }}
                >
                  <Input
                    name="basePrice"
                    type="number"
                    step="0.01"
                    defaultValue={String(product.projectOverrideBasePrice ?? product.basePrice)}
                  />
                  <Button type="submit" disabled={busyKey === `${product.id}:listing`}>
                    Save
                  </Button>
                </form>
                <Button
                  variant="outline"
                  disabled={busyKey === `${product.id}:listing-clear`}
                  onClick={() => {
                    void onRunAction(
                      `${product.id}:listing-clear`,
                      () =>
                        saveListingPrice({
                          trackerId: product.trackerId,
                          listingId: product.listingId,
                          clearOverride: true,
                        }),
                      `Cleared listing price override for ${product.title}.`,
                    );
                  }}
                >
                  Clear Listing Override
                </Button>
              </CardContent>
            </Card>

            {product.trackerId === "wholesale_items" ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Wholesale Shipping Override</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <form
                    className="flex flex-col gap-3 sm:flex-row"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const formData = new FormData(event.currentTarget);
                      void onRunAction(
                        `${product.id}:shipping`,
                        () =>
                          saveShippingPrice({
                            listingId: product.listingId,
                            shippingPrice: Number(formData.get("shippingPrice") || 0),
                          }),
                        `Updated shipping override for ${product.title}.`,
                      );
                    }}
                  >
                    <Input
                      name="shippingPrice"
                      type="number"
                      step="0.01"
                      defaultValue={String(product.projectOverrideShippingPrice ?? product.shippingPrice ?? 0)}
                    />
                    <Button type="submit" disabled={busyKey === `${product.id}:shipping`}>
                      Save
                    </Button>
                  </form>
                  <Button
                    variant="outline"
                    disabled={busyKey === `${product.id}:shipping-clear`}
                    onClick={() => {
                      void onRunAction(
                        `${product.id}:shipping-clear`,
                        () =>
                          saveShippingPrice({
                            listingId: product.listingId,
                            clearOverride: true,
                          }),
                        `Cleared shipping override for ${product.title}.`,
                      );
                    }}
                  >
                    Clear Shipping Override
                  </Button>
                </CardContent>
              </Card>
            ) : null}
          </div>
        ) : null}

        {!isReadOnly && product.variations.length > 0 ? (
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Variation Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.variations.map((variation) => (
                <form
                  key={`${variation.id}:media`}
                  className="grid gap-4 rounded-xl border border-slate-100 p-4 xl:grid-cols-[minmax(0,1fr)_240px]"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    void onRunAction(
                      `${variation.id}:hero`,
                      () =>
                        saveVariationHeroImage({
                          trackerId: product.trackerId,
                          listingId: product.listingId,
                          variationId: variation.id,
                          heroImage: String(formData.get("heroImage") || "").trim() || null,
                        }),
                      `Saved variation image for ${variation.name}.`,
                    );
                  }}
                >
                  <div className="space-y-3">
                    <div>
                      <div className="font-medium text-slate-900">{variation.name}</div>
                      <div className="text-xs text-slate-500">{formatVariationOptions(variation.selects)}</div>
                    </div>
                    <Input name="heroImage" defaultValue={variation.heroImage || ""} placeholder="Variation image URL" />
                    <div className="flex flex-wrap gap-3">
                      <Button type="submit" disabled={busyKey === `${variation.id}:hero`}>
                        Save Variation Image
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={busyKey === `${variation.id}:hero-clear`}
                        onClick={() => {
                          void onRunAction(
                            `${variation.id}:hero-clear`,
                            () =>
                              saveVariationHeroImage({
                                trackerId: product.trackerId,
                                listingId: product.listingId,
                                variationId: variation.id,
                                clearOverride: true,
                              }),
                            `Cleared variation image override for ${variation.name}.`,
                          );
                        }}
                      >
                        Reset To Listing Image
                      </Button>
                    </div>
                  </div>
                  <div className="flex h-40 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {variation.heroImage || product.image ? (
                      <img
                        src={variation.heroImage || product.image || ""}
                        alt={variation.name}
                        className="h-full w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <ImageIcon className="h-4 w-4" />
                        No image
                      </div>
                    )}
                  </div>
                </form>
              ))}
            </CardContent>
          </Card>
        ) : null}

        {!isReadOnly && !isJacket && product.variations.length > 0 ? (
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Variation Price Overrides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {product.variations.map((variation) => (
                <form
                  key={`${variation.id}:price`}
                  className="grid items-center gap-3 rounded-xl border border-slate-100 p-3 lg:grid-cols-[minmax(0,1.5fr)_180px_auto_auto]"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    void onRunAction(
                      `${variation.id}:price-save`,
                      () =>
                        saveVariationPrice({
                          trackerId: product.trackerId,
                          listingId: product.listingId,
                          variationId: variation.id,
                          basePrice: Number(formData.get("basePrice") || 0),
                        }),
                      `Updated variation price for ${variation.name}.`,
                    );
                  }}
                >
                  <div>
                    <div className="font-medium text-slate-900">{variation.name}</div>
                    <div className="text-xs text-slate-500">{formatVariationOptions(variation.selects)}</div>
                  </div>
                  <Input
                    name="basePrice"
                    type="number"
                    step="0.01"
                    defaultValue={String(variation.projectOverrideBasePrice ?? variation.basePrice)}
                  />
                  <Button type="submit" disabled={busyKey === `${variation.id}:price-save`}>
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busyKey === `${variation.id}:price-clear`}
                    onClick={() => {
                      void onRunAction(
                        `${variation.id}:price-clear`,
                        () =>
                          saveVariationPrice({
                            trackerId: product.trackerId,
                            listingId: product.listingId,
                            variationId: variation.id,
                            clearOverride: true,
                          }),
                        `Cleared variation override for ${variation.name}.`,
                      );
                    }}
                  >
                    Clear
                  </Button>
                </form>
              ))}
            </CardContent>
          </Card>
        ) : null}

        {isJacket ? (
          <>
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Pakistani Jacket Listing</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  className="grid gap-4 lg:grid-cols-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    void onRunAction(
                      `${product.id}:jacket-listing`,
                      () =>
                        saveJacketListing(product.listingId, {
                          title: String(formData.get("title") || ""),
                          url: String(formData.get("url") || ""),
                          base_price: Number(formData.get("basePrice") || 0),
                          ended: parseCheckbox(formData.get("ended")),
                          out_of_stock: parseCheckbox(formData.get("outOfStock")),
                        }),
                      `Updated jacket listing ${product.title}.`,
                    );
                  }}
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Title</label>
                    <Input name="title" defaultValue={product.title} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Base price</label>
                    <Input name="basePrice" type="number" step="0.01" defaultValue={String(product.basePrice)} />
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Source URL</label>
                    <Input name="url" defaultValue={product.url || ""} />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input name="outOfStock" type="checkbox" defaultChecked={product.availability === "out_of_stock"} />
                    Out of stock
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input name="ended" type="checkbox" defaultChecked={product.availability === "ended"} />
                    Ended
                  </label>
                  <div className="lg:col-span-2">
                    <Button type="submit" disabled={busyKey === `${product.id}:jacket-listing`}>
                      Save Jacket Listing
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {product.variations.length > 0 ? (
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Jacket Variations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {product.variations.map((variation) => (
                    <form
                      key={`${variation.id}:jacket`}
                      className="grid gap-3 rounded-xl border border-slate-100 p-3 lg:grid-cols-[minmax(0,1fr)_auto]"
                      onSubmit={(event) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        void onRunAction(
                          `${variation.id}:jacket-variation`,
                          () =>
                            saveJacketVariation(variation.id, {
                              name: String(formData.get("name") || ""),
                              base_price: Number(formData.get("basePrice") || 0),
                              out_of_stock: parseCheckbox(formData.get("outOfStock")),
                            }),
                          `Updated jacket variation ${variation.name}.`,
                        );
                      }}
                    >
                      <div className="grid gap-3 md:grid-cols-3">
                        <Input name="name" defaultValue={variation.name} />
                        <Input name="basePrice" type="number" step="0.01" defaultValue={String(variation.basePrice)} />
                        <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700">
                          <input name="outOfStock" type="checkbox" defaultChecked={variation.availability === "out_of_stock"} />
                          Out of stock
                        </label>
                      </div>
                      <Button type="submit" disabled={busyKey === `${variation.id}:jacket-variation`}>
                        Save
                      </Button>
                    </form>
                  ))}
                </CardContent>
              </Card>
            ) : null}
          </>
        ) : null}

        {isReadOnly ? (
          <Card className="border-slate-200">
            <CardContent className="pt-6 text-sm text-slate-600">
              Account Building stays a fixed single product in v1, so this tracker is intentionally read-only.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </details>
  );
}
