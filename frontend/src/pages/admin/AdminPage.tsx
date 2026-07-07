import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import AdminDashboard from "./AdminDashboard";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/login", { state: { from: "/admin" } });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-6 h-96 w-full rounded-xl" />
      </section>
    );
  }

  if (user.role !== "admin") {
    return (
      <section className="mx-auto max-w-md px-4 py-24 text-center">
        <ShieldX className="mx-auto size-10 text-muted-foreground" />
        <h1 className="mt-4 font-heading text-3xl font-medium">Admins only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This area is reserved for the atelier team.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Back to the boutique</Link>
        </Button>
      </section>
    );
  }

  return <AdminDashboard />;
}
