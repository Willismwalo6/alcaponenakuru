"use client";

export default function PrintButton({ label = "Print tickets" }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="btn btn-outline btn-sm print:hidden">
      {label}
    </button>
  );
}
