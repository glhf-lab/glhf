module.exports = {
  routes: [
    {
      method: "POST",
      path: "/verification-tokens/verify",
      handler: "verification-token.verify",
    },
  ],
};
