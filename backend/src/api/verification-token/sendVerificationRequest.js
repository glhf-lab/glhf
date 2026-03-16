const { createTransport } = require("nodemailer")


const getStudyConfig = async () => {
  const global = await strapi.entityService.findMany("api::global.global", {
    fields: ["studyName", "supportEmail"],
  });
  return {
    studyName: global?.studyName || "GLHF",
    supportEmail: global?.supportEmail || process.env.SUPPORT_EMAIL || "",
  };
};

const sendVerificationRequest = async (params) => {


  const { identifier, url, provider, token } = params
  const { host } = new URL(url)
  const { studyName, supportEmail } = await getStudyConfig();
  console.log({env: process.env.EMAIL_SERVER_HOST})
  if(process.env.NODE_ENV == "development" && process.env.EMAIL_SERVER_HOST == "") {
    console.log(text({ url, host }))
    return { ok: true }
  }
  // Send message using Prolific's Message API if Prolific participant
  if (/^[a-f\d]{24}@email\.prolific\.co$/.test(identifier)) {
    const prolificId = identifier.replace("@email.prolific.co", "")
    const result = await sendProlificMessage({
      prolificId,
      message: textProlific({ token, host, studyName }),
    })
    if (result.status === 204) {
      console.log("Prolific message sent")
    } else {
      console.log(result)
      throw new Error("Could not send prolific message")
    }
  } else {
    try {
      const res = await strapi.plugin('email').service('email').send({
        to: identifier,
        from: provider.from,
        subject: `Sign in to ${host}`,
        text: text({ url, host }),
        html: html({ url, host, studyName, supportEmail }),
      });

      return { ok: true }
    } catch (error) {
      console.error("Error sending verification token email")
      console.error(error)
      return { ok: false }
    }
  }
}

const sendProlificMessage = async ({ prolificId, message }) => {
  const res = await fetch(`https://api.prolific.co/api/v1/messages/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${process.env.PROLIFIC_API_TOKEN}`,
    },
    body: JSON.stringify({
      recipient_id: prolificId,
      body: message,
      study_id: process.env.PROLIFIC_STUDY_ID,
    }),
  })
  return res
}

module.exports = sendVerificationRequest

/**
 * Email HTML body
 * Insert invisible space into domains from being turned into a hyperlink by email
 * clients like Outlook and Apple mail, as this is confusing because it seems
 * like they are supposed to click on it to sign in.
 *
 * @note We don't add the email address to avoid needing to escape it, if you do, remember to sanitize it!
 */
function html(params) {
  const { url, host, studyName, supportEmail } = params

  const escapedHost = host.replace(/\./g, "&#8203;.")

  const brandColor = "#346df1"
  const color = {
    background: "#f9f9f9",
    text: "#444",
    mainBackground: "#fff",
    buttonBackground: brandColor,
    buttonBorder: brandColor,
    buttonText: "#fff",
  }

  return `
<body style="background: ${color.background};">
  <table width="100%" border="0" cellspacing="20" cellpadding="0"
    style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        Sign in to <strong>${escapedHost}</strong>
      </td>
    </tr>
    <tr>
      <td
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        Welcome to ${studyName}! Thank you for signing up and joining our study. To access your account, please click the button below:
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                target="_blank"
                style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Sign
                in</a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        Or copy and paste the URL below into your internet browser: <a href="${url}" target="_blank" style="word-break: break-all">${url}</a>
      </td>
    </tr>
    <tr>
    <tr>
      <td align="center"
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        If you did not request this email you can safely ignore it.
      </td>
    </tr>
    <tr>
      <td
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        ${supportEmail ? `If you have any questions or need assistance, please don't hesitate to reach out to our support team at ${supportEmail}. <br />` : ""}
        <br \>
        Best regards, <br \>
        The ${studyName} Team
      </td>
    </tr>
  </table>
</body>
`
}

/** Email Text body (fallback for email clients that don't render HTML, e.g. feature phones) */
function text({ url, host }) {
  return `Sign in to ${host}\n\nCopy this link to sign in: ${url}\n\n`
}
function textProlific({ token, host, studyName }) {
  return `Sign in to ${studyName} using this code:\n\n${token}\n\nThe code is valid for 1 hour, and can only be used once.\n\n- The ${studyName} Team`
}

