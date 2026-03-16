'use strict';

/**
 * steam-owned-games-sync-job service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::steam-owned-games-sync-job.steam-owned-games-sync-job');
