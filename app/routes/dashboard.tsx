import type { Route } from "./+types/dashboard";
import { DashboardScreen } from "~/features/dashboard/components";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Kérastase Collective - Live Dashboard" },
    { name: "description", content: "Live dashboard showcasing user results" },
  ];
}

export default function Dashboard() {
  return <DashboardScreen />;
}
