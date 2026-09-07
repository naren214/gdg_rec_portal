import React from "react";

// Fixed page field. The visual structure lives in CSS so it remains quiet and
// never competes with the recruitment content.
export default function Backdrop() {
  return <div className="app-background" aria-hidden="true" />;
}
