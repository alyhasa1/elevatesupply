import { AlertCircle, Archive, Boxes, Clock4, Layers3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCatalog } from "@/lib/catalog/context";
import { getAvailabilityLabel, isUpdatedWithinHours } from "@/lib/catalog/format";
import { TRACKERS } from "@/lib/catalog/trackers";

export default function Dashboard() {
  const { products, status, error, snapshot } = useCatalog();

  const totalActive = products.filter((product) => product.availability === "in_stock").length;
  const totalOutOfStock = products.filter((product) => product.availability === "out_of_stock").length;
  const totalEnded = products.filter((product) => product.availability === "ended").length;
  const updatedIn24Hours = products.filter((product) => isUpdatedWithinHours(product, 24)).length;
  const recentProducts = products.slice(0, 8);

  const trackerRows = TRACKERS.map((tracker) => {
    const trackerProducts = products.filter((product) => product.trackerId === tracker.id);
    return {
      ...tracker,
      total: trackerProducts.length,
      active: trackerProducts.filter((product) => product.availability === "in_stock").length,
      outOfStock: trackerProducts.filter((product) => product.availability === "out_of_stock").length,
      ended: trackerProducts.filter((product) => product.availability === "ended").length,
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Inventory-only view of the worker-backed Elevate Supply catalog.</p>
      </div>

      {status === "error" && <div className="text-sm text-rose-700">{error || "Catalog could not be loaded."}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Total Active</CardTitle>
            <Boxes className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalActive}</div>
            <p className="text-xs text-slate-500 mt-1">Products currently in stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Out Of Stock</CardTitle>
            <AlertCircle className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalOutOfStock}</div>
            <p className="text-xs text-slate-500 mt-1">No low-stock state is used in this project</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Ended</CardTitle>
            <Archive className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalEnded}</div>
            <p className="text-xs text-slate-500 mt-1">Listings marked as ended by the source or manual jacket data</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Updated In 24h</CardTitle>
            <Clock4 className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{updatedIn24Hours}</div>
            <p className="text-xs text-slate-500 mt-1">Last catalog refresh: {new Date(snapshot.updatedAt).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers3 className="w-5 h-5 text-indigo-600" />
              Tracker Coverage
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracker</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Active</TableHead>
                  <TableHead className="text-right">Out Of Stock</TableHead>
                  <TableHead className="text-right">Ended</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trackerRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="font-medium text-slate-900">{row.name}</div>
                      <div className="text-xs text-slate-500">{row.description}</div>
                    </TableCell>
                    <TableCell className="text-right">{row.total}</TableCell>
                    <TableCell className="text-right">{row.active}</TableCell>
                    <TableCell className="text-right">{row.outOfStock}</TableCell>
                    <TableCell className="text-right">{row.ended}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Product Updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentProducts.map((product) => (
              <div key={product.id} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <div>
                  <div className="font-medium text-slate-900 line-clamp-2">{product.title}</div>
                  <div className="text-xs text-slate-500">{product.trackerName}</div>
                </div>
                <Badge variant="secondary">{getAvailabilityLabel(product.availability)}</Badge>
              </div>
            ))}

            {status === "loading" && <div className="text-sm text-slate-500">Loading inventory snapshot...</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
