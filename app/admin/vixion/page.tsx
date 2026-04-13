import { VixionAdminClient } from "./VixionAdminClient";

export const metadata = {
  title: "VIXION — Admin — XOLID",
  robots: { index: false, follow: false },
};

export default function AdminVixionPage() {
  return <VixionAdminClient />;
}
