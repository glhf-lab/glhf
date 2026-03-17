module.exports = {
  routes: [
    {
      method: "POST",
      path: "/verification-tokens/verify",
      handler: "verification-token.verify",
      config: {
        policies: [
          {
            name: 'global::rate-limit',
            config: { limit: 20, window: 60000, keyFn: (ctx) => ctx.request.body?.identifier },
          },
        ],
      },
    },
  ],
};
