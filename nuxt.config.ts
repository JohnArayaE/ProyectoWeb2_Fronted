export default defineNuxtConfig({
  modules: [
    "@vite-pwa/nuxt",
    "@pinia/nuxt"
  ],

  runtimeConfig: {
    public: {
      apiBase: "http://localhost:4000"
    }
  },

  app: {
    head: {
      title: "Proyecto Web 2",

      meta: [
        {
          name: "description",
          content: "Aplicación web progresiva de Proyecto Web 2"
        },
        {
          name: "theme-color",
          content: "#ffffff"
        }
      ],

      link: [
        {
          rel: "icon",
          href: "/favicon.ico"
        },
        {
          rel: "apple-touch-icon",
          href: "/apple-touch-icon-180x180.png"
        }
      ]
    }
  },

  pwa: {
    registerType: "autoUpdate",

    manifest: {
      id: "/",

      name: "Proyecto Web 2",
      short_name: "ProyectoWeb2",

      description:
        "Aplicación web progresiva de Proyecto Web 2",

      theme_color: "#ffffff",
      background_color: "#ffffff",

      display: "standalone",

      start_url: "/",
      scope: "/",

      icons: [
        {
          src: "/pwa-192x192.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "/pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any"
        },
        {
          src: "/maskable-icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable"
        }
      ]
    },

    workbox: {
      navigateFallback: "/"
    }
  }
})