module.exports = {
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
