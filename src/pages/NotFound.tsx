import { useSeoMeta } from "@unhead/react";
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useSeoMeta({
    title: "404 — Not Found | KUR4TEK",
    description: "The page you are looking for could not be found.",
  });

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.5em] mb-6" style={{ color: "rgba(200,144,64,0.7)" }}>
          Lost in the desert
        </p>
        <h1 className="text-8xl font-bold mb-4 text-foreground" style={{ fontFamily: "var(--font-display, Georgia, serif)" }}>
          404
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-sm mx-auto">
          This page doesn't exist. The road ends here.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-colors"
          style={{
            background: "rgba(200,144,64,0.9)",
            color: "#060810",
          }}
        >
          ← Return to KUR4TEK
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
