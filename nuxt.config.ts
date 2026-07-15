// https://nuxt.com/docs/guide/directory-structure/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxtjs/tailwindcss"],

  css: ["~/assets/css/main.css"],

  // Nuxt 4 默认使用 app/ 作为 srcDir，无需额外配置
  // 应用层元信息
  app: {
    head: {
      title: "幻兽帕鲁 · 监控面板",
      htmlAttrs: { lang: "zh-CN" },
    },
  },

  // 运行时变量（服务端）
  runtimeConfig: {
    // 代理请求超时（毫秒），可在 .env 覆盖为 PAL_PROXY_TIMEOUT
    palProxyTimeout: 30000,
  },

  nitro: {},

  compatibilityDate: "2025-07-15",

  // 禁用 devtools（需要时去掉此项即可）
  devtools: { enabled: false },
});
