import React from "react";

// Fixed full-screen animated background: floating Google-color aurora
// blobs + a dotted grid. Sits behind all content (z-index -2).
export default function Backdrop() {
  return (
    <div className="app-background" aria-hidden="true">
      <div className="dot-grid" />
      <div className="aurora aurora-1" />
      <div className="aurora aurora-2" />
      <div className="aurora aurora-3" />
      <div className="aurora aurora-4" />
    </div>
  );
}
