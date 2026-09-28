import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/doctrine")({
  component: () => <Navigate to="/ia" />,
});
