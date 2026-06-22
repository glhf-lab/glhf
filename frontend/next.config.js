const path = require("path")

const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

// Demo mode: a fully static, backend-free export bundled into the docs site at
// /glhf/demo/. i18n routing and the image optimizer are unsupported by
// `output: export`, and every `next-auth/react` import is swapped for a
// localStorage-backed shim so auth works without a server.
const demoConfig = {
  output: "export",
  trailingSlash: true,
  basePath: "/glhf/demo",
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias["next-auth/react"] = path.resolve(
      __dirname,
      "src/demo/next-auth-react.js"
    )
    return config
  },
}

const prodConfig = {
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  images: {
    remotePatterns: [
      {
        protocol: process.env.NEXT_INTERNAL_IMAGE_DOMAIN_PROTOCOL,
        hostname: process.env.NEXT_INTERNAL_IMAGE_DOMAIN,
      },
      ...(process.env.IMAGE_DOMAIN
        ? [
            {
              protocol: "https",
              hostname: process.env.IMAGE_DOMAIN,
            },
            {
              protocol: "https",
              hostname: `*.${process.env.IMAGE_DOMAIN}`,
            },
          ]
        : []),
    ],
  },
  output: "standalone",
}

module.exports = isDemo ? demoConfig : prodConfig
