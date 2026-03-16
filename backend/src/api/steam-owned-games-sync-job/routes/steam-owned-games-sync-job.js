'use strict';

/**
 * steam-owned-games-sync-job router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::steam-owned-games-sync-job.steam-owned-games-sync-job');
