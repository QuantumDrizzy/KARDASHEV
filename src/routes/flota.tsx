import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/flota")({
  component: () => <Navigate to="/space" />,
});
