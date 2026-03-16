module.exports = ({ env }) => ({
email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        host: env("EMAIL_SERVER_HOST"),
        port: env("EMAIL_SERVER_PORT", 25),
        auth: {
            user: env("EMAIL_SERVER_USER"),
            pass: env("EMAIL_SERVER_PASSWORD"),
          },
      },
      settings: {
        defaultFrom: env("EMAIL_FROM", "'GLHF' <no-reply@example.com>"),
        defaultReplyTo: env("EMAIL_REPLY_TO", "no-reply@example.com"),
      },
    },
  },
})