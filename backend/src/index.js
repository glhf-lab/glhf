'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) { },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    strapi.db.lifecycles.subscribe({
      models: ['plugin::users-permissions.user'],

      async afterCreate(event) {
        // check if max users reached
        const currentUsers = await strapi.db
          .query("plugin::users-permissions.user")
          .count();
        const loginPage = await strapi.service(
          'api::login-page.login-page'
        ).find({
          fields: [], populate: { closeSignUp: true }
        });
        const { closeSignUp } = loginPage
        if (currentUsers >= closeSignUp.maxUsers) {
          console.log("Max number of users reached, closing sign up");
          const advancedSettings = await strapi
            .store({ type: 'plugin', name: 'users-permissions', key: 'advanced' })
            .get();
          strapi
            .store({ type: 'plugin', name: 'users-permissions', key: 'advanced' })
            .set({
              value: {
                ...advancedSettings,
                allow_register: false,
              }
            });
          // display sign up closed on login page
          strapi.entityService.update(
            "api::login-page.login-page",
            loginPage.id,
            {
              data: { closeSignUp: { id: closeSignUp.id, signUpEnabled: false } },
            }
          );
        }
      },
    });
  },
};