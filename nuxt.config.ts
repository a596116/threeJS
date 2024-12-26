// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'
import type { NuxtConfig } from '@nuxt/schema'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  devServer: {
    port: 3088,
  },
  components: [
    {
      global: true,
      path: '~/components/',
      pathPrefix: false,
      extensions: ['.vue'],
    },
  ],
  modules: ['@vueuse/nuxt', '@nuxt/image'],

  // css
  css: ['~/styles/app.scss', '~/styles/tailwindcss.css'],

  app: {
    head: {
      viewport:
        'width=device-width, initial-scale=1, minimum-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },

  vite: {
    plugins: [tailwindcss()],
  } as NuxtConfig['vite'],
})
