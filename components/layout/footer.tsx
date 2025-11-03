"use client";
import React from "react";

// Get current year at build time
const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="container flex flex-col items-center justify-center gap-4 md:flex-row">
        <p className="text-center text-sm text-muted-foreground">
          © {currentYear}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
