import * as React from 'react';
import {Badge} from "@workspace/ui/components/badge";
import {Progress} from "@workspace/ui/components/progress";
import {CardDescription} from "@workspace/ui/components/card";
import {Button} from "@workspace/ui/components/button";
import Link from "next/link";
import {replaceOrgSlug, routes} from "@workspace/routes";

export default async function OrdersTablePage(): Promise<React.JSX.Element> {

  //TODO: Add an actual order table component
  return(
    <>
      <div>datatable will go here with actions to view order details in dialog (modal) component, other actions will include pay balance and something else i can't recall.</div>
    </>
  )
}
