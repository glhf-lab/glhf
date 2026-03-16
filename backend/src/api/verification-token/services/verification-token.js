'use strict';

/**
 * verification-token service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::verification-token.verification-token');
