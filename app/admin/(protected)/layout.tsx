import AdminGuard from "@/components/AdminGuard";

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminGuard>{children}</AdminGuard>;
}
