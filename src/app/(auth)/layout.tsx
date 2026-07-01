export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-muted/50 to-background px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Ajentify</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Customer Relationship Management
        </p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
