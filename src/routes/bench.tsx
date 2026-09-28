import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/bench")({
  component: () => <Navigate to="/energia" />,
});
