import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: () => <main className="mx-auto max-w-2xl p-8"></main>,
});
