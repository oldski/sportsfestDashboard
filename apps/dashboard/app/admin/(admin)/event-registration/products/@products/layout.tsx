import {Button} from "@workspace/ui/components/button";
import Link from "next/link";
import {EditIcon, PlusIcon, TrashIcon} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@workspace/ui/components/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@workspace/ui/components/table";
import {Badge} from "@workspace/ui/components/badge";
import * as React from "react";

export default function ProductTableLayout({
  children
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Products Catalog</h3>
          <p className="text-sm text-muted-foreground">
            Manage all products available for organization registration
          </p>
        </div>
      </div>

      {children}
      {/*/!* Products Table *!/*/}
      {/*<Card className="pb-0">*/}
      {/*  <CardHeader>*/}
      {/*    <CardTitle>Product Catalog</CardTitle>*/}
      {/*    <CardDescription>*/}
      {/*      All products available for SportsFest event registration*/}
      {/*    </CardDescription>*/}
      {/*  </CardHeader>*/}
      {/*  <CardContent className="p-0">*/}
      {/*      */}
      {/*  </CardContent>*/}
      {/*</Card>*/}
    </div>
  );
}
