// https://nuxt.com/docs/api/configuration/nuxt-config
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
  css: ['~/styles/app.scss'],
})
