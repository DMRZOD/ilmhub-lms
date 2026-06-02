import { PublicHeader } from "@/components/layout/public-header";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-ilm-paper">
      <PublicHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
