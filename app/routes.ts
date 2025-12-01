import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("components", "routes/components.tsx"),
  route("results", "routes/results.tsx"),
  route("details", "routes/details.tsx"),
  route("camera", "routes/camera.tsx"),
] satisfies RouteConfig;
