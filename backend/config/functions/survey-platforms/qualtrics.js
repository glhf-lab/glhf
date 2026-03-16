const axios = require("axios");
const axiosRetry = require("axios-retry").default;
const NodeCache = require("node-cache");
const tokenCache = new NodeCache();

const getStudyName = async () => {
  try {
    const global = await strapi.entityService.findMany("api::global.global", {
      fields: ["studyName"],
    });
    return global?.studyName || "GLHF";
  } catch {
    return "GLHF";
  }
};

// Find these under https://oii.eu.qualtrics.com/Q/QualtricsIdsSection/IdsSection
const QUALTRICS_CONF = {
  datacenterId: process.env.QUALTRICS_DATACENTER_ID,
  surveyId: process.env.QUALTRICS_SURVEY_ID,
  directoryId: process.env.QUALTRICS_DIRECTORY_ID,
  mailingListId: process.env.QUALTRICS_MAILINGLIST_ID,
  libraryId: process.env.QUALTRICS_LIBRARY_ID,
  messageInviteId: process.env.QUALTRICS_MESSAGE_INVITE_ID,
  messageReminderId: process.env.QUALTRICS_MESSAGE_REMINDER_ID,
};

const getToken = async () => {
  let token = tokenCache.get("access_token");
  if (token == undefined) {
    console.log("Fetching new Qualtrics token");
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append(
      "scope",
      "write:mailing_list_contacts write:distributions read:distributions"
    );
    // no token
    const { data } = await axios.post(
      `https://${QUALTRICS_CONF.datacenterId}.qualtrics.com/oauth2/token`,
      params,
      {
        auth: {
          username: process.env.QUALTRICS_CLIENT_ID,
          password: process.env.QUALTRICS_CLIENT_SECRET,
        },
      }
    );
    tokenCache.set("access_token", data.access_token, data.expires_in - 60);
    console.log("Using new Qualtrics token");
    return data.access_token;
  } else {
    console.log("Using cached Qualtrics token");
    return token;
  }
};

// API Client
const qualtrics = axios.create({
  baseURL: `https://${QUALTRICS_CONF.datacenterId}.qualtrics.com/API/v3`,
});

axiosRetry(qualtrics, {
  retries: 3,
  retryCondition: (e) => {
    console.log("retryCondition", e);
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(e) ||
      e?.response?.status === 429
    );
  },
  retryDelay: (retryCount) => {
    console.log(`Qualtrics retry attempt: ${retryCount}`);
    return retryCount * 60 * 1000;
  },
});

const createQualtricsMalinglistContact = async ({ email, userId }) => {
  const payload = {
    firstName: "Study",
    lastName: "Participant",
    email: email,
    extRef: userId,
    unsubscribed: false,
  };
  try {
    const accessToken = await getToken();
    const res = await qualtrics.post(
      `/directories/${QUALTRICS_CONF.directoryId}/mailinglists/${QUALTRICS_CONF.mailingListId}/contacts`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    console.log(`Imported user to Qualtrics mailing list: ${userId}`)
    return res;
  } catch (error) {
    console.log("catch error", error);
    return error;
  }
};

const distributeQualtricsSurvey = async ({ contactId, surveySendDate }) => {
  const studyName = await getStudyName();
  surveyLinkExpirationDate = new Date(surveySendDate);
  // Link expires after x days
  surveyLinkExpirationDate.setDate(
    surveyLinkExpirationDate.getDate() +
      Number(process.env.STUDY_SURVEY_EXPIRATION_DAYS)
  );
  const payload = {
    message: {
      libraryId: QUALTRICS_CONF.libraryId,
      messageId: QUALTRICS_CONF.messageInviteId,
    },
    recipients: {
      mailingListId: QUALTRICS_CONF.mailingListId,
      contactId: contactId,
    },
    header: {
      fromName: studyName,
      replyToEmail: "noreply@qualtrics.com",
      fromEmail: "noreply@qualtrics.com",
      subject: `${studyName} survey invite`,
    },
    surveyLink: {
      surveyId: QUALTRICS_CONF.surveyId,
      expirationDate: surveyLinkExpirationDate,
      type: "Individual",
    },
    sendDate: surveySendDate,
  };
  try {
    const accessToken = await getToken();
    const res = await qualtrics.post("/distributions", payload, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log(`Created Qualtrics distribution for contactId: ${contactId}`)
    return res;
  } catch (error) {
    console.log("catch error distributeQualtricsSurvey", error);
    return error;
  }
};

const getQualtricsDistributions = async ({ distributionId }) => {
  try {
    const accessToken = await getToken();
    const res = await qualtrics.get(`/distributions/${distributionId}/links`, {
      params: {
        surveyId: QUALTRICS_CONF.surveyId,
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res;
  } catch (error) {
    console.log("catch error getQualtricsDistributions", error);
    return error;
  }
};
const createReminderDistribution = async ({
  distributionId,
  surveySendDate,
}) => {
  try {
    const studyName = await getStudyName();
    const accessToken = await getToken();
    const surveyReminderDate = new Date(surveySendDate);
    // Send the reminder after x days
    surveyReminderDate.setDate(
      surveyReminderDate.getDate() +
        Number(process.env.STUDY_SURVEY_REMINDER_DAYS)
    );
    const payload = {
      message: {
        libraryId: QUALTRICS_CONF.libraryId,
        messageId: QUALTRICS_CONF.messageReminderId,
      },
      header: {
        fromName: studyName,
        replyToEmail: "noreply@qualtrics.com",
        fromEmail: "noreply@qualtrics.com",
        subject: `${studyName} survey reminder`,
      },
      sendDate: surveyReminderDate,
    };
    const res = await qualtrics.post(
      `/distributions/${distributionId}/reminders`,
      payload,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    console.log(`Created Qualtrics survey reminder for distributionId: ${distributionId}`)
    return res;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const setupQualtricsSurvey = async ({ user }) => {
  try {
    const contactLookupId = user?.qualtricsContactLookupId;
    let distributionId;
    if (typeof contactLookupId === "string") {
      // Distribute survey to contact
      const qualtricsDistributeResponse = await distributeQualtricsSurvey({
        contactId: contactLookupId,
        surveySendDate: user.surveySendDate,
      });
      distributionId = qualtricsDistributeResponse?.data?.result?.id;
    }

    // Get the distribution data
    if (typeof distributionId === "string") {
      const qualtricsReminderResponse = await createReminderDistribution({
        distributionId,
        surveySendDate: user.surveySendDate,
      });
      const qualtricsDistributionData = await getQualtricsDistributions({
        distributionId: distributionId,
      });
      return qualtricsDistributionData.data?.result?.elements?.filter(
        (d) => d.contactId == user.qualtricsId
      )[0];
    }
  } catch (error) {
    console.log("error", error);
  }
};

module.exports = {
  setupQualtricsSurvey,
  createQualtricsMalinglistContact,
};
