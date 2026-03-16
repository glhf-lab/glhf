---
sidebar_position: 2
title: Survey Platforms
---

# Survey Platforms

GLHF integrates with **Qualtrics** and **Prolific** for survey distribution and participant recruitment.

## Qualtrics

Qualtrics integration handles automated survey distribution: importing participant emails into a mailing list, distributing personalized survey links, and sending reminders.

### Setup

1. **Create an OAuth2 application** in your Qualtrics account (Account Settings → Qualtrics IDs → OAuth)
2. **Grant scopes:** `write:mailing_list_contacts`, `write:distributions`, `read:distributions`
3. **Find your IDs** under Account Settings → Qualtrics IDs:
   - Datacenter ID
   - Directory ID
   - Survey ID, Library ID, Mailing List ID
   - Message IDs for invite and reminder templates

### Environment Variables

```bash
# OAuth2
QUALTRICS_CLIENT_ID=your_client_id
QUALTRICS_CLIENT_SECRET=your_client_secret

# IDs (found in Qualtrics IDs section)
QUALTRICS_DATACENTER_ID=oii.eu        # your datacenter
QUALTRICS_SURVEY_ID=SV_...
QUALTRICS_DIRECTORY_ID=POOL_...
QUALTRICS_MAILINGLIST_ID=CG_...
QUALTRICS_LIBRARY_ID=UR_...
QUALTRICS_MESSAGE_INVITE_ID=MS_...     # invite email template
QUALTRICS_MESSAGE_REMINDER_ID=MS_...   # reminder email template
```

### Cron Workflows

#### Email Import (`qualtricsEmailImport`)

- **Schedule:** `SURVEY_EMAIL_IMPORT_CRON_SCHEDULE` (default: every 2 hours)
- **Toggle:** `SURVEY_EMAIL_IMPORT_CRON_SCHEDULE_ENABLED`
- Finds consented participants not yet in Qualtrics
- Imports their email as a mailing list contact
- Replaces the stored email with a hashed version (`{hash}@{EMAIL_DOMAIN}`)
- Stores the Qualtrics `contactLookupId` and `qualtricsId` for later use

#### Survey Activation (`activateSurveys`)

- **Schedule:** `SURVEY_ACTIVATE_CRON_SCHEDULE` (default: every 15 minutes)
- **Toggle:** `SURVEY_ACTIVATE_CRON_SCHEDULE_ENABLED`
- Checks if participants have passed `STUDY_DAYS_BEFORE_SURVEY` since enrollment
- Distributes a personalized Qualtrics survey link to eligible participants
- Creates a reminder distribution for `STUDY_SURVEY_REMINDER_DAYS` days later
- If Discord is linked, sends the survey link via Discord DM
- Also checks for study completion (`STUDY_END_DAYS_AFTER_SURVEY`)

### Token Handling

The Qualtrics integration uses OAuth2 client credentials flow. Tokens are cached in memory (via `node-cache`) and automatically refreshed when expired. API calls use `axios-retry` with up to 3 retries and exponential backoff for rate limiting (HTTP 429).

---

## Prolific

Prolific integration supports participant recruitment workflows.

### Setup

Configure the Prolific environment variables:

```bash
PROLIFIC_DIGEST_CRON_SCHEDULE="0 7 * * *"     # daily at 7 AM
PROLIFIC_DIGEST_CRON_SCHEDULE_ENABLED=true
```

### Cron Workflow

#### Prolific Digest (`prolificDigest`)

- **Schedule:** `PROLIFIC_DIGEST_CRON_SCHEDULE` (default: daily at 7:00 AM)
- **Toggle:** `PROLIFIC_DIGEST_CRON_SCHEDULE_ENABLED`
- Processes Prolific participant data and triggers survey activation for Prolific-sourced participants

The `prolific-invite` API (`backend/src/api/prolific-invite/`) handles Prolific-specific recruitment logic, including email pattern detection for identifying Prolific-sourced participants.
