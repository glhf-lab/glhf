---
sidebar_position: 4
title: Slack
---

# Slack Integration

GLHF sends notifications to a Slack channel via an incoming webhook. This is intended for **researchers** to stay informed about study activity, not for participant communication.

## Setup

### 1. Create a Slack Incoming Webhook

1. Go to your Slack workspace's app management
2. Create a new app (or use an existing one)
3. Enable **Incoming Webhooks**
4. Add a webhook to the channel where you want notifications

### 2. Configure

Add the webhook URL to the backend `.env`:

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../...
```

## Notification Events

The backend sends Slack notifications for key study events such as participant sign-ups and study milestones. If `SLACK_WEBHOOK_URL` is not set, notifications are silently skipped.
