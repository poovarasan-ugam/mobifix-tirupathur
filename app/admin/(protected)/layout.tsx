import AdminGuard from "@/components/AdminGuard";
import AdminBackLink from "@/components/AdminBackLink";

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <AdminBackLink />
      {children}
    </AdminGuard>
  );
}
