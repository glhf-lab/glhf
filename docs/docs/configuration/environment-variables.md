---
sidebar_position: 1
title: Environment Variables
---

# Environment Variables

GLHF uses environment variables for secrets, service connections, and feature flags that are rarely changed during a study. Study content like the study name, consent text, and page content is managed through the [Strapi admin panel](cms-content). Both the backend and frontend have `.env.example` files as starting points.

## Backend

### Core Strapi

| Variable | Description | Example |
|----------|-------------|---------|
| `HOST` | Strapi server host | `localhost` |
| `PORT` | Strapi server port | `1337` |
| `PUBLIC_URL` | Public-facing backend URL | `http://localhost:1337` |
| `BACKEND_URL` | Backend URL (internal) | `http://localhost:1337` |
| `APP_KEYS` | Comma-separated app keys | _(generate with openssl)_ |
| `API_TOKEN_SALT` | Salt for API tokens | _(generate with openssl)_ |
| `ADMIN_JWT_SECRET` | Admin panel JWT secret | _(generate with openssl)_ |
| `JWT_SECRET` | User JWT secret | _(generate with openssl)_ |
| `TRANSFER_TOKEN_SALT` | Transfer token salt | _(generate with openssl)_ |

### Authentication

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXTAUTH_SECRET` | Shared secret with frontend (**must match**) | _(generate with openssl)_ |
| `NEXTAUTH_URL` | Frontend URL for NextAuth callbacks | `http://localhost:3000` |
| `USER_EMAIL_HMAC_KEY` | HMAC key for hashing participant emails | _(generate with openssl)_ |

### Email

| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_FROM` | Sender email address | `study@example.com` |
| `EMAIL_REPLY_TO` | Reply-to email address | `support@example.com` |
| `EMAIL_SERVER_USER` | SMTP username | |
| `EMAIL_SERVER_PASSWORD` | SMTP password | |
| `EMAIL_SERVER_HOST` | SMTP host | `smtp.example.com` |
| `EMAIL_SERVER_PORT` | SMTP port | `587` |
| `EMAIL_DOMAIN` | Domain for hashed email addresses | `example.com` |
| `SUPPORT_EMAIL` | Support email shown in participant emails | |

### Steam

| Variable | Description | Example |
|----------|-------------|---------|
| `STEAM_API_KEY` | [Steam Web API key](https://steamcommunity.com/dev/apikey) | |
| `ENCRYPTION_KEY` | AES-256-CBC key for encrypting sensitive data | _(generate with openssl)_ |

### S3 Storage

| Variable | Description | Example |
|----------|-------------|---------|
| `S3_ACCESS_KEY_ID` | S3 access key | |
| `S3_ACCESS_SECRET` | S3 secret key | |
| `S3_REGION` | S3 region | `us-east-1` |
| `S3_BUCKET` | S3 bucket name (`false` to disable) | `false` |
| `S3_ENDPOINT` | Custom S3 endpoint (for MinIO, etc.) | |

### Study Timeline

| Variable | Description | Default |
|----------|-------------|---------|
| `STUDY_SURVEY_EXPIRATION_DAYS` | Days before survey link expires | `7` |
| `STUDY_SURVEY_REMINDER_DAYS` | Days after survey send to send reminder | `3` |
| `STUDY_DAYS_BEFORE_SURVEY` | Days of data collection before survey | `7` |
| `STUDY_END_DAYS_AFTER_SURVEY` | Days after survey before study ends | `14` |

### Study Requirements

| Variable | Description | Default |
|----------|-------------|---------|
| `STEAM_REQUIRED` | Require Steam account linking | `true` |
| `STEAM_REQUIRE_OWNED_GAMES` | Require participant to have owned games | `false` |
| `STEAM_REQUIRE_PLAYTIME_PUBLIC` | Require public playtime visibility | `true` |
| `STEAM_REQUIRE_RECENT_PLAYTIME` | Require recent playtime data | `false` |
| `DISCORD_REQUIRED` | Require Discord account linking | |

### Cron Schedules

| Variable | Description | Default |
|----------|-------------|---------|
| `STEAM_FETCH_CRON_SCHEDULE` | Recently played games fetch interval | `*/10 * * * *` |
| `STEAM_OWNED_GAMES_SYNC_CRON_SCHEDULE` | Owned games sync interval | `*/10 * * * *` |
| `STEAM_PROFILE_SYNC_CRON_SCHEDULE` | Profile sync interval | `*/15 * * * *` |
| `REMOVE_TOKENS_CRON_SCHEDULE` | Expired token cleanup interval | `0 */5 * * * *` |
| `SURVEY_EMAIL_IMPORT_CRON_SCHEDULE` | Qualtrics email import interval | `0 */2 * * * *` |
| `SURVEY_EMAIL_IMPORT_CRON_SCHEDULE_ENABLED` | Enable Qualtrics email import | `false` |
| `SURVEY_ACTIVATE_CRON_SCHEDULE` | Survey activation check interval | `*/15 * * * *` |
| `SURVEY_ACTIVATE_CRON_SCHEDULE_ENABLED` | Enable survey activation | `false` |
| `PROLIFIC_DIGEST_CRON_SCHEDULE` | Prolific digest interval | `0 7 * * *` |
| `PROLIFIC_DIGEST_CRON_SCHEDULE_ENABLED` | Enable Prolific digest | `false` |
| `PURGE_USERS_CRON_SCHEDULE` | User purge interval | |
| `PURGE_USERS_CRON_SCHEDULE_ENABLED` | Enable user purge | _(off by default)_ |

### Qualtrics

| Variable | Description |
|----------|-------------|
| `QUALTRICS_CLIENT_ID` | OAuth2 client ID |
| `QUALTRICS_CLIENT_SECRET` | OAuth2 client secret |
| `QUALTRICS_DATACENTER_ID` | Qualtrics datacenter (e.g., `oii.eu`) |
| `QUALTRICS_SURVEY_ID` | Target survey ID |
| `QUALTRICS_DIRECTORY_ID` | Default directory ID |
| `QUALTRICS_MAILINGLIST_ID` | Mailing list ID for contacts |
| `QUALTRICS_LIBRARY_ID` | Message library ID |
| `QUALTRICS_MESSAGE_INVITE_ID` | Survey invite message ID |
| `QUALTRICS_MESSAGE_REMINDER_ID` | Survey reminder message ID |

### Discord Bot

| Variable | Description |
|----------|-------------|
| `DISCORD_BOT_TOKEN` | Discord bot token |
| `DISCORD_GUILD` | Discord guild (server) ID |

### Slack

| Variable | Description |
|----------|-------------|
| `SLACK_WEBHOOK_URL` | Slack incoming webhook URL |

---

## Frontend

### Core

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_INTERNAL_STRAPI_API_URL` | Internal Strapi API URL | `http://localhost:1337` |
| `NEXT_PUBLIC_API_URL` | Public-facing API URL | `http://localhost:3000` |
| `NEXT_PUBLIC_UPLOADS_URL` | Strapi uploads URL | `http://localhost:1337` |
| `NEXT_INTERNAL_IMAGE_DOMAIN` | Image optimization domain | `localhost` |
| `NEXT_INTERNAL_IMAGE_DOMAIN_PROTOCOL` | Image domain protocol | `http` |
| `IMAGE_DOMAIN` | External image domain (production) | |
| `PREVIEW_SECRET` | CMS preview mode secret | |

### Authentication

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXTAUTH_SECRET` | Shared secret with backend (**must match**) | |
| `NEXTAUTH_URL` | NextAuth callback URL | `http://localhost:3000` |
| `STRAPI_PASSWORDLESS_TOKEN` | Strapi API token for auth flow | _(from Strapi admin)_ |
| `NEXT_INTERNAL_AUTH_VERIFICATION_SECRET` | Auth verification secret (for external services) | |

### Sign-in Providers

| Variable | Description | Default |
|----------|-------------|---------|
| `EMAIL_SIGNIN_ENABLED` | Enable email magic link sign-in | `true` |
| `DISCORD_SIGNIN_ENABLED` | Enable Discord OAuth sign-in | `false` |
| `DISCORD_CLIENT_ID` | Discord OAuth client ID | |
| `DISCORD_CLIENT_SECRET` | Discord OAuth client secret | |
| `DISCORD_BOT_TOKEN` | Discord bot token (for account linking) | |
| `GOOGLE_SIGNIN_ENABLED` | Enable Google OAuth sign-in | `false` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | |

### Steam

| Variable | Description |
|----------|-------------|
| `STEAM_API_KEY` | Steam Web API key (same as backend) |
