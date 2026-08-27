import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Harshit Bhuju — Frontend Developer",
    short_name: "Harshit Bhuju",
    description:
      "Frontend Developer and Competitive Tech Builder. Building clean, scalable digital experiences.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0A0A",
    theme_color: "#0A0A0A",
    icons: [
      {
        src: "/profile.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "any",
      },
    ],
  };
}
