import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/research")({
  component: () => <Navigate to="/" />,
});
