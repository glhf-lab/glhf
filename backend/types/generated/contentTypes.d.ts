import type { Attribute, Schema } from '@strapi/strapi';

export interface AdminApiToken extends Schema.CollectionType {
  collectionName: 'strapi_api_tokens';
  info: {
    description: '';
    displayName: 'Api Token';
    name: 'Api Token';
    pluralName: 'api-tokens';
    singularName: 'api-token';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    expiresAt: Attribute.DateTime;
    lastUsedAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::api-token',
      'oneToMany',
      'admin::api-token-permission'
    >;
    type: Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Attribute.Required &
      Attribute.DefaultTo<'read-only'>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_api_token_permissions';
  info: {
    description: '';
    displayName: 'API Token Permission';
    name: 'API Token Permission';
    pluralName: 'api-token-permissions';
    singularName: 'api-token-permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    token: Attribute.Relation<
      'admin::api-token-permission',
      'manyToOne',
      'admin::api-token'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminPermission extends Schema.CollectionType {
  collectionName: 'admin_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'Permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Attribute.JSON & Attribute.DefaultTo<{}>;
    conditions: Attribute.JSON & Attribute.DefaultTo<[]>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    properties: Attribute.JSON & Attribute.DefaultTo<{}>;
    role: Attribute.Relation<'admin::permission', 'manyToOne', 'admin::role'>;
    subject: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminRole extends Schema.CollectionType {
  collectionName: 'admin_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'Role';
    pluralName: 'roles';
    singularName: 'role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    description: Attribute.String;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::role',
      'oneToMany',
      'admin::permission'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    users: Attribute.Relation<'admin::role', 'manyToMany', 'admin::user'>;
  };
}

export interface AdminTransferToken extends Schema.CollectionType {
  collectionName: 'strapi_transfer_tokens';
  info: {
    description: '';
    displayName: 'Transfer Token';
    name: 'Transfer Token';
    pluralName: 'transfer-tokens';
    singularName: 'transfer-token';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    expiresAt: Attribute.DateTime;
    lastUsedAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::transfer-token',
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    description: '';
    displayName: 'Transfer Token Permission';
    name: 'Transfer Token Permission';
    pluralName: 'transfer-token-permissions';
    singularName: 'transfer-token-permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    token: Attribute.Relation<
      'admin::transfer-token-permission',
      'manyToOne',
      'admin::transfer-token'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminUser extends Schema.CollectionType {
  collectionName: 'admin_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'User';
    pluralName: 'users';
    singularName: 'user';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    blocked: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    firstname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    isActive: Attribute.Boolean &
      Attribute.Private &
      Attribute.DefaultTo<false>;
    lastname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    preferedLanguage: Attribute.String;
    registrationToken: Attribute.String & Attribute.Private;
    resetPasswordToken: Attribute.String & Attribute.Private;
    roles: Attribute.Relation<'admin::user', 'manyToMany', 'admin::role'> &
      Attribute.Private;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    username: Attribute.String;
  };
}

export interface ApiDataDeletionRequestDataDeletionRequest
  extends Schema.CollectionType {
  collectionName: 'data_deletion_requests';
  info: {
    description: '';
    displayName: 'Data Deletion Requests';
    pluralName: 'data-deletion-requests';
    singularName: 'data-deletion-request';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::data-deletion-request.data-deletion-request',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    dataDeleted: Attribute.Boolean & Attribute.DefaultTo<false>;
    discord_user: Attribute.Relation<
      'api::data-deletion-request.data-deletion-request',
      'oneToOne',
      'api::discord-user.discord-user'
    >;
    steam_user: Attribute.Relation<
      'api::data-deletion-request.data-deletion-request',
      'oneToOne',
      'api::steam-user.steam-user'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::data-deletion-request.data-deletion-request',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    userId: Attribute.Integer & Attribute.Required & Attribute.Unique;
    users_user: Attribute.Relation<
      'api::data-deletion-request.data-deletion-request',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiDiscordUserDiscordUser extends Schema.CollectionType {
  collectionName: 'discord_users';
  info: {
    description: '';
    displayName: 'Discord User';
    pluralName: 'discord-users';
    singularName: 'discord-user';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::discord-user.discord-user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    discordId: Attribute.String & Attribute.Unique;
    discordIdHashed: Attribute.String & Attribute.Unique;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::discord-user.discord-user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user: Attribute.Relation<
      'api::discord-user.discord-user',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiGlobalGlobal extends Schema.SingleType {
  collectionName: 'globals';
  info: {
    displayName: 'Global';
    name: 'global';
    pluralName: 'globals';
    singularName: 'global';
  };
  options: {
    draftAndPublish: false;
    increments: true;
    timestamps: true;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::global.global',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    favicon: Attribute.Media<'images'> &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    footer: Attribute.Component<'layout.footer'> &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::global.global',
      'oneToMany',
      'api::global.global'
    >;
    metadata: Attribute.Component<'meta.metadata'> &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    metaTitleSuffix: Attribute.String &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    navbar: Attribute.Component<'layout.navbar'> &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    notificationBanner: Attribute.Component<'elements.notification-banner'> &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    studyName: Attribute.String &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }> &
      Attribute.DefaultTo<'GLHF'>;
    supportEmail: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::global.global',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiLeadFormSubmissionLeadFormSubmission
  extends Schema.CollectionType {
  collectionName: 'lead_form_submissions';
  info: {
    displayName: 'Lead form submission';
    name: 'lead-form-submission';
    pluralName: 'lead-form-submissions';
    singularName: 'lead-form-submission';
  };
  options: {
    draftAndPublish: false;
    increments: true;
    timestamps: true;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::lead-form-submission.lead-form-submission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    email: Attribute.String;
    location: Attribute.String;
    status: Attribute.Enumeration<['seen', 'contacted', 'ignored']>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::lead-form-submission.lead-form-submission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiLoginPageLoginPage extends Schema.SingleType {
  collectionName: 'login_pages';
  info: {
    description: '';
    displayName: 'Login page';
    pluralName: 'login-pages';
    singularName: 'login-page';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    closeSignUp: Attribute.Component<'elements.close-sign-up'>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::login-page.login-page',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.RichText;
    FAQ: Attribute.Component<'sections.accordion'>;
    metadata: Attribute.Component<'meta.metadata'>;
    publishedAt: Attribute.DateTime;
    showLoginSection: Attribute.Boolean & Attribute.DefaultTo<true>;
    title: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::login-page.login-page',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiPagePage extends Schema.CollectionType {
  collectionName: 'pages';
  info: {
    description: '';
    displayName: 'Page';
    name: 'page';
    pluralName: 'pages';
    singularName: 'page';
  };
  options: {
    draftAndPublish: true;
    increments: true;
    timestamps: true;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    contentSections: Attribute.DynamicZone<
      [
        'sections.bottom-actions',
        'sections.feature-columns-group',
        'sections.feature-rows-group',
        'sections.hero',
        'sections.large-video',
        'sections.lead-form',
        'sections.rich-text',
        'sections.team',
        'sections.logos'
      ]
    > &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::page.page', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::page.page',
      'oneToMany',
      'api::page.page'
    >;
    metadata: Attribute.Component<'meta.metadata'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    publishedAt: Attribute.DateTime;
    shortName: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    slug: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'api::page.page', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface ApiProfileProfile extends Schema.SingleType {
  collectionName: 'profiles';
  info: {
    description: '';
    displayName: 'Profile Page';
    pluralName: 'profiles';
    singularName: 'profile';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    accounts: Attribute.DynamicZone<
      ['integrations.steam', 'integrations.discord']
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::profile.profile',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    deleteAccount: Attribute.Component<'profile.account-data'>;
    FAQ: Attribute.Component<'sections.accordion'>;
    feedback: Attribute.Component<'profile.feedback', true>;
    metadata: Attribute.Component<'meta.metadata'>;
    researchConsent: Attribute.RichText & Attribute.Required;
    title: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::profile.profile',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiProlificInviteProlificInvite extends Schema.CollectionType {
  collectionName: 'prolific_invites';
  info: {
    description: '';
    displayName: 'Prolific Invites';
    pluralName: 'prolific-invites';
    singularName: 'prolific-invite';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    addedToProlific: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::prolific-invite.prolific-invite',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    prolificIds: Attribute.Text;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::prolific-invite.prolific-invite',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiSteamOwnedGamesSyncJobSteamOwnedGamesSyncJob
  extends Schema.CollectionType {
  collectionName: 'steam_owned_games_sync_jobs';
  info: {
    description: '';
    displayName: 'Steam Owned Games Sync Job';
    pluralName: 'steam-owned-games-sync-jobs';
    singularName: 'steam-owned-games-sync-job';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    attempts: Attribute.Integer & Attribute.DefaultTo<0>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::steam-owned-games-sync-job.steam-owned-games-sync-job',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    errorMessage: Attribute.Text;
    lastAttemptAt: Attribute.DateTime;
    status: Attribute.Enumeration<
      ['pending', 'processing', 'completed', 'failed', 'retry']
    > &
      Attribute.DefaultTo<'pending'>;
    steamUser: Attribute.Relation<
      'api::steam-owned-games-sync-job.steam-owned-games-sync-job',
      'manyToOne',
      'api::steam-user.steam-user'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::steam-owned-games-sync-job.steam-owned-games-sync-job',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiSteamProfileSyncJobSteamProfileSyncJob
  extends Schema.CollectionType {
  collectionName: 'steam_profile_sync_jobs';
  info: {
    description: "Job to fetch and update a user's Steam profile information.";
    displayName: 'Steam Profile Sync Job';
    pluralName: 'steam-profile-sync-jobs';
    singularName: 'steam-profile-sync-job';
  };
  options: {
    comment: '';
    draftAndPublish: false;
  };
  attributes: {
    attempts: Attribute.Integer & Attribute.Required & Attribute.DefaultTo<0>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::steam-profile-sync-job.steam-profile-sync-job',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    errorMessage: Attribute.Text;
    jobDetails: Attribute.JSON;
    lastAttemptAt: Attribute.DateTime;
    status: Attribute.Enumeration<
      ['pending', 'processing', 'completed', 'failed', 'retry']
    > &
      Attribute.Required &
      Attribute.DefaultTo<'pending'>;
    steamUser: Attribute.Relation<
      'api::steam-profile-sync-job.steam-profile-sync-job',
      'manyToOne',
      'api::steam-user.steam-user'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::steam-profile-sync-job.steam-profile-sync-job',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiSteamUserSteamUser extends Schema.CollectionType {
  collectionName: 'steam_users';
  info: {
    description: '';
    displayName: 'Steam User';
    pluralName: 'steam-users';
    singularName: 'steam-user';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    communityvisibilitystate: Attribute.Integer;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::steam-user.steam-user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    entityTag: Attribute.String;
    lastProfileSyncAt: Attribute.DateTime;
    profilestate: Attribute.Integer;
    steam_owned_games_sync_jobs: Attribute.Relation<
      'api::steam-user.steam-user',
      'oneToMany',
      'api::steam-owned-games-sync-job.steam-owned-games-sync-job'
    >;
    steamApiCache: Attribute.JSON;
    steamid: Attribute.String;
    steamidHashed: Attribute.String;
    steamProfileSyncJobs: Attribute.Relation<
      'api::steam-user.steam-user',
      'oneToMany',
      'api::steam-profile-sync-job.steam-profile-sync-job'
    >;
    timecreated: Attribute.BigInteger;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::steam-user.steam-user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user: Attribute.Relation<
      'api::steam-user.steam-user',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiVerificationTokenVerificationToken
  extends Schema.CollectionType {
  collectionName: 'verification_tokens';
  info: {
    displayName: 'Verification Token';
    pluralName: 'verification-tokens';
    singularName: 'verification-token';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::verification-token.verification-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    expires: Attribute.DateTime;
    identifier: Attribute.String;
    token: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::verification-token.verification-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesRelease extends Schema.CollectionType {
  collectionName: 'strapi_releases';
  info: {
    displayName: 'Release';
    pluralName: 'releases';
    singularName: 'release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    actions: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    name: Attribute.String & Attribute.Required;
    releasedAt: Attribute.DateTime;
    scheduledAt: Attribute.DateTime;
    status: Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Attribute.Required;
    timezone: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Schema.CollectionType {
  collectionName: 'strapi_release_actions';
  info: {
    displayName: 'Release Action';
    pluralName: 'release-actions';
    singularName: 'release-action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentType: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    entry: Attribute.Relation<
      'plugin::content-releases.release-action',
      'morphToOne'
    >;
    isEntryValid: Attribute.Boolean;
    locale: Attribute.String;
    release: Attribute.Relation<
      'plugin::content-releases.release-action',
      'manyToOne',
      'plugin::content-releases.release'
    >;
    type: Attribute.Enumeration<['publish', 'unpublish']> & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginI18NLocale extends Schema.CollectionType {
  collectionName: 'i18n_locale';
  info: {
    collectionName: 'locales';
    description: '';
    displayName: 'Locale';
    pluralName: 'locales';
    singularName: 'locale';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Attribute.String & Attribute.Unique;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    name: Attribute.String &
      Attribute.SetMinMax<
        {
          max: 50;
          min: 1;
        },
        number
      >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFile extends Schema.CollectionType {
  collectionName: 'files';
  info: {
    description: '';
    displayName: 'File';
    pluralName: 'files';
    singularName: 'file';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    alternativeText: Attribute.String;
    caption: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    ext: Attribute.String;
    folder: Attribute.Relation<
      'plugin::upload.file',
      'manyToOne',
      'plugin::upload.folder'
    > &
      Attribute.Private;
    folderPath: Attribute.String &
      Attribute.Required &
      Attribute.Private &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    formats: Attribute.JSON;
    hash: Attribute.String & Attribute.Required;
    height: Attribute.Integer;
    mime: Attribute.String & Attribute.Required;
    name: Attribute.String & Attribute.Required;
    previewUrl: Attribute.String;
    provider: Attribute.String & Attribute.Required;
    provider_metadata: Attribute.JSON;
    related: Attribute.Relation<'plugin::upload.file', 'morphToMany'>;
    size: Attribute.Decimal & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    url: Attribute.String & Attribute.Required;
    width: Attribute.Integer;
  };
}

export interface PluginUploadFolder extends Schema.CollectionType {
  collectionName: 'upload_folders';
  info: {
    displayName: 'Folder';
    pluralName: 'folders';
    singularName: 'folder';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    children: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.folder'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    files: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.file'
    >;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    parent: Attribute.Relation<
      'plugin::upload.folder',
      'manyToOne',
      'plugin::upload.folder'
    >;
    path: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    pathId: Attribute.Integer & Attribute.Required & Attribute.Unique;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Schema.CollectionType {
  collectionName: 'up_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    role: Attribute.Relation<
      'plugin::users-permissions.permission',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole extends Schema.CollectionType {
  collectionName: 'up_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'role';
    pluralName: 'roles';
    singularName: 'role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    permissions: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    type: Attribute.String & Attribute.Unique;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    users: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
  };
}

export interface PluginUsersPermissionsUser extends Schema.CollectionType {
  collectionName: 'up_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'user';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    activationDate: Attribute.DateTime;
    blocked: Attribute.Boolean & Attribute.DefaultTo<false>;
    confirmed: Attribute.Boolean & Attribute.DefaultTo<false>;
    consentedToResearch: Attribute.Boolean;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    dataDeletionRequest: Attribute.Boolean & Attribute.DefaultTo<false>;
    discordLinked: Attribute.Boolean;
    email: Attribute.String & Attribute.Private;
    emailHashed: Attribute.String & Attribute.Private;
    provider: Attribute.String;
    qualtricsContactLookupId: Attribute.String & Attribute.Private;
    qualtricsDistributionJson: Attribute.JSON & Attribute.Private;
    qualtricsDistributionLink: Attribute.String;
    qualtricsId: Attribute.String & Attribute.Private;
    requiredAccountsLinked: Attribute.Boolean;
    role: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    steamActivated: Attribute.Boolean;
    steamHasOwnedGames: Attribute.Boolean;
    steamHasOwnedGamesPlaytime: Attribute.Boolean;
    steamHasPlaytimePublic: Attribute.Boolean;
    steamHasRecentPlayedGames: Attribute.Boolean;
    steamLinked: Attribute.Boolean;
    steamPrivate: Attribute.Boolean;
    studyCompleted: Attribute.Boolean & Attribute.DefaultTo<false>;
    studyEndDate: Attribute.DateTime;
    surveyActivationDate: Attribute.DateTime;
    surveyLinkExpirationDate: Attribute.DateTime;
    surveySendDate: Attribute.DateTime;
    timezone: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    utcOffset: Attribute.Integer;
    uuid: Attribute.String & Attribute.Unique;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface ContentTypes {
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::permission': AdminPermission;
      'admin::role': AdminRole;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'admin::user': AdminUser;
      'api::data-deletion-request.data-deletion-request': ApiDataDeletionRequestDataDeletionRequest;
      'api::discord-user.discord-user': ApiDiscordUserDiscordUser;
      'api::global.global': ApiGlobalGlobal;
      'api::lead-form-submission.lead-form-submission': ApiLeadFormSubmissionLeadFormSubmission;
      'api::login-page.login-page': ApiLoginPageLoginPage;
      'api::page.page': ApiPagePage;
      'api::profile.profile': ApiProfileProfile;
      'api::prolific-invite.prolific-invite': ApiProlificInviteProlificInvite;
      'api::steam-owned-games-sync-job.steam-owned-games-sync-job': ApiSteamOwnedGamesSyncJobSteamOwnedGamesSyncJob;
      'api::steam-profile-sync-job.steam-profile-sync-job': ApiSteamProfileSyncJobSteamProfileSyncJob;
      'api::steam-user.steam-user': ApiSteamUserSteamUser;
      'api::verification-token.verification-token': ApiVerificationTokenVerificationToken;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
    }
  }
}
