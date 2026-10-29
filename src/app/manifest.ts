import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SIGNAL",
    short_name: "SIGNAL",
    description: "Know what matters. Understand why. Speak with confidence.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f5f9",
    theme_color: "#231e4b",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
