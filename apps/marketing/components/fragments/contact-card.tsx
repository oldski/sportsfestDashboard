import {CardTitle} from "@workspace/ui/components/card";
import * as React from "react";

export function ContactCard () {
  return (
    <div>
      <CardTitle className="text-lg text-primary">
        Contact Information
      </CardTitle>
      <p className="text-sm leading-relaxed">
        For questions or concerns, contact us at:
        <br />
        <a
          href="mailto:prem@sportsfest.com"
          className="text-blue-500 hover:underline"
        >
          prem@sportsfest.com
        </a>
      </p>
    </div>
  )
}
