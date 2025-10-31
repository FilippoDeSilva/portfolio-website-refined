export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Main Content with padding for fixed header */}
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}
