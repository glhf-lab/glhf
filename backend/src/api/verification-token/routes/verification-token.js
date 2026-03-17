'use strict';

/**
 * verification-token router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::verification-token.verification-token', {
  config: {
    create: {
      policies: [
        {
          name: 'global::rate-limit',
          config: {
            limit: 3,
            window: 900000,
            keyFn: (ctx) => ctx.request.body?.identifier,
          },
        },
      ],
    },
  },
});
