import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/ahora")({
  component: () => <Navigate to="/plan" />,
});
