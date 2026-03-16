---
sidebar_position: 2
title: Getting Started
---

# Getting Started

This guide walks you through setting up GLHF for local development.

## Prerequisites

- **Node.js** 18.x–20.x
- **Yarn 4** (the repo uses Yarn PnP)

## Clone & Install

```bash
git clone https://github.com/glhf-lab/glhf.git
cd glhf
```

## Backend Setup

1. Install dependencies:

```bash
cd backend
yarn install
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Generate the required secrets and paste them into `.env`:

```bash
echo "APP_KEYS=$(openssl rand -base64 16),$(openssl rand -base64 16),$(openssl rand -base64 16)"
echo "API_TOKEN_SALT=$(openssl rand -base64 16)"
echo "ADMIN_JWT_SECRET=$(openssl rand -base64 16)"
echo "TRANSFER_TOKEN_SALT=$(openssl rand -base64 16)"
echo "USER_EMAIL_HMAC_KEY=$(openssl rand -base64 32)"
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"
echo "ENCRYPTION_KEY=$(openssl rand -hex 16)"
```

4. Start the backend:

```bash
yarn develop
```

5. Open `http://localhost:1337/admin` and create an admin user.

6. Stop the backend, import the seed data, then restart:

```bash
# Ctrl+C to stop
yarn import
yarn develop
```

## Frontend Setup

1. In a new terminal, install dependencies:

```bash
cd frontend
yarn install
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Copy the `NEXTAUTH_SECRET` value from the backend `.env` into the frontend `.env` — they must match.

4. Create a Strapi API token for the frontend auth flow:
   - Go to the Strapi admin: **Settings → API Tokens**
   - Click **Create new API Token**
   - Name: `Next Auth`
   - Duration: **Unlimited**
   - Type: **Custom**
   - Permissions: `Verification-token: create, verify, findOne` and `User-permissions.Auth: getJwtFromEmail`
   - Save and copy the token into `STRAPI_PASSWORDLESS_TOKEN` in the frontend `.env`

5. Start the frontend:

```bash
yarn dev
```

The app is now available at **http://localhost:3000**.

:::tip No email server?
If no SMTP server is configured, sign-in magic link URLs are printed to the backend console.
:::

## Verify It Works

1. Visit http://localhost:3000 and sign in with an email address
2. Check the backend console for the magic link URL
3. Click the link to complete sign-in
4. You should see the participant dashboard

![Login page with email sign-in and OAuth options](/img/screenshots/login-page.png)

## Configure Your Study

With the app running, open the Strapi admin at **http://localhost:1337/admin** to configure your study — name, consent text, pages, and more. See [CMS Content](configuration/cms-content) for a full guide on what each content type controls.

## Next Steps

- [Architecture](architecture) — Understand the system components
- [CMS Content](configuration/cms-content) — Configure study name, pages, and consent text
- [Environment Variables](configuration/environment-variables) — Full configuration reference
- [Steam Integration](integrations/steam) — Enable Steam account linking
