import {
  defineConfig,
  minimal2023Preset as preset,
} from "@vite-pwa/assets-generator/config";

export default defineConfig({
  headLinkOptions: {
    preset: "2023",
  },
  preset,
  images: ["public/favicon.svg"], // Pon aquí la ruta de tu logo original (preferiblemente SVG)
});

//Recomendation
// export default defineConfig({
//   head: {
//     link: [],
//   },
//   preset,
//   images: [
//     'public/logo.svg', // Pon aquí la ruta de tu logo original (preferiblemente SVG)
//   ],
// })
