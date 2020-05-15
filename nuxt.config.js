import {
  relative,
} from "path";
import ShortUniqueId from "short-unique-id";
import normalizePath from "normalize-path";
import cssesc from "cssesc";
import {
  interpolateName,
} from "loader-utils";

// eslint-disable-next-line no-control-regex
const filenameReservedRegex = /[<>:"/\\|?*\x00-\x1F]/g;
// eslint-disable-next-line no-control-regex
const reControlChars = /[\u0000-\u001F\u0080-\u009F]/g;
const reRelativePath = /^\.+/;

const uid = new ShortUniqueId();

const identNameMap = {};

export default {
  mode: "universal",
  /*
   ** Headers of the page
   */
  head: {
    titleTemplate: "%s - JobFair MeetUP",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, minimal-ui" },
      { hid: "description", name: "description", content: process.env.npm_package_description || "" },
      { hid: "theme-color", name: "theme-color", content: "#00003f" },
      { hid: "background-color", name: "background-color", content: "#00003f" },
    ],
  },
  /*
   ** Set settings for the PWA metadata
   */
  pwa: {
    meta: {
      name: "JobFair MeetUP",
      description: "Ulovi karijeru dolaskom na JobFair MeetUP!",
    },
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: "#ecb000" },
  /*
   ** Global CSS
   */
  css: [
    "~/assets/styles/global.scss",
  ],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    { src: "~/plugins/vue-typer", ssr: false },
    { src: "~/plugins/axios" },
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    "@nuxtjs/eslint-module",
    "@nuxtjs/stylelint-module",
    "@nuxtjs/vuetify",
    [
      "nuxt-imagemin",
      {
        optipng: null,
        gifsicle: null,
        pngquant: {
          strip: true,
        },
      },
    ],
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    "@nuxtjs/axios",
    "@nuxtjs/pwa",
    // Doc: https://github.com/nuxt-community/dotenv-module
    "@nuxtjs/dotenv",
    [ "@nuxtjs/router", { keepDefaultRouter: true } ],
    "nuxt-svg-loader",
  ],

  serverMiddleware: [
    "~/api/index.js",
  ],
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {},
  /*
   ** Vuetify options
   */
  vuetify: {
    defaultAssets: false,
    theme: {
      dark: true,

      themes: {
        dark: {
          primary: "#ecb000",
          secondary: "#00003f",
          accent: "#00003f",
        },
      },
    },
  },
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.devtool = isClient ? "eval-source-map" : "inline-source-map";

        config.module.rules.push({
          enforce: "pre",
          test: /\.(js|vue)$/,
          loader: "eslint-loader",
          exclude: /(node_modules)|(\.svg$)/,
        });
      }
    },
    /*
     ** Update loader configurations
     */
    loaders: {
      cssModules: {
        modules: {
          localIdentName: "[path][name]__[local]",
          getLocalIdent({ resource, ...loaderContext }, localIdentName, localName, options) {
            if (!options.context) {
              // eslint-disable-next-line no-param-reassign
              options.context = loaderContext.rootContext;
            }

            const request = normalizePath(
              relative(options.context || "", loaderContext.resourcePath),
            );

            // eslint-disable-next-line no-param-reassign
            options.content = `${ options.hashPrefix + request }+${ unescape(localName) }`;

            const parsedLocalIdentName = cssesc(
              interpolateName(loaderContext, localIdentName, options)
                // For `[hash]` placeholder
                .replace(/^((-?[0-9])|--)/, "_$1")
                .replace(filenameReservedRegex, "-")
                .replace(reControlChars, "-")
                .replace(reRelativePath, "-")
                .replace(/\./g, "-"),
              { isIdentifier: true },
            ).replace(/\\\[local\\]/gi, localName);

            if (!(parsedLocalIdentName in identNameMap)) {
              const id = cssesc(uid.sequentialUUID());

              if (/^\d+/.test(id)) {
                identNameMap[parsedLocalIdentName] = `_${ id }`;
              } else {
                identNameMap[parsedLocalIdentName] = id;
              }
            }

            const className = identNameMap[parsedLocalIdentName];

            if ("production" === process.env.NODE_ENV) {
              return className;
            } else {
              return `${ parsedLocalIdentName }__${ className }`;
            }
          },
        },
      },
      vue: {
        video: [ "src", "poster" ],
        source: "src",
        img: "src",
        image: [ "xlink:href", "href" ],
        use: [ "xlink:href", "href" ],
      },
    },

    filenames: {
      app: ({ isDev }) => isDev ? "[name].js" : "[chunkhash].js",
      chunk: ({ isDev }) => isDev ? "[name].js" : "[id].[chunkhash].js",
      css: ({ isDev }) => isDev ? "[name].css" : "[contenthash].css",
      img: ({ isDev }) => isDev ? "[path][name].[ext]" : "img/[hash].[ext]",
      font: ({ isDev }) => isDev ? "[path][name].[ext]" : "fonts/[hash].[ext]",
      video: ({ isDev }) => isDev ? "[path][name].[ext]" : "videos/[hash].[ext]",
    },

    optimization: {
      concatenateModules: true,
      moduleIds: "hashed",
      splitChunks: {
        chunks: "all",
        maxAsyncRequests: 50,
        maxInitialRequests: 20,
        name: false,
      },
    },
  },

  optimizedImages: {
    optimizeImages: true,
  },
};
