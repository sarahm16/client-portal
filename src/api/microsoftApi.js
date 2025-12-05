import axios from "axios";

export const getMicrosoftAccessToken = async () => {
  try {
    const tokenResponse = await axios.get(
      `${import.meta.VITE_PROXY_URL}/${
        import.meta.VITE_AZURE_FUNCTIONS_URL
      }/getAuth`
    );
    console.log("tokenResponse", tokenResponse);
    const accessToken = tokenResponse.data?.access_token;

    return accessToken;
  } catch (err) {
    console.error("Error fetching Microsoft auth token:", err);
    throw new Error("Failed to fetch Microsoft auth token");
  }
};

export const sendEmailViaMicrosoft = async (emailData) => {
  try {
    const accessToken = await getMicrosoftAccessToken();

    const emailResponse = await axios.post(
      "https://graph.microsoft.com/v1.0/users/no-reply@nationalfacilitycontractors.com/sendMail",
      {
        message: {
          subject: emailData.subject,
          body: {
            contentType: "HTML",
            content: emailData.body,
          },
          toRecipients: emailData.to.map((recipient) => ({
            emailAddress: { address: recipient },
          })),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return emailResponse.data;
  } catch (err) {
    console.error("Error sending email via Microsoft Graph:", err);
    throw new Error("Failed to send email via Microsoft Graph");
  }
};
