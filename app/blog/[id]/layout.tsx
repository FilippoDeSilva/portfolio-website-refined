import { Suspense } from "react";
import TitleBar from "@/components/titlebar";
import { Footer } from "@/components/footer";

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Static Header */}
      <Suspense fallback={<div className="h-16 bg-background border-b" />}>
        <TitleBar title="Blog Post" />
      </Suspense>
      
      {/* Dynamic Content */}
      <main className="pt-16">
        {children}
      </main>
      
      {/* Static Footer */}
      <Suspense fallback={<div className="h-24 bg-background border-t" />}>
        <Footer />
      </Suspense>
    </>
  );
}
