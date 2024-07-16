"use server";

import { google } from "googleapis";

export async function submitUrls({ host, key, urlList, apiKey }: { host: string; key: string; urlList: string[]; apiKey: string }) {
  const keyLocation = `https://${host}/${key}.txt`;

  // Ensure all URLs start with the full prefix
  const fullUrlList = urlList.map((url) =>
    url.startsWith("/") ? `https://${host}${url}` : url,
  );

  const indexNowPayload = {
    host,
    key,
    keyLocation,
    urlList: fullUrlList,
  };

  const serviceAccountKey = JSON.parse(apiKey);

  const jwtClient = new google.auth.JWT(
    serviceAccountKey.client_email,
    undefined,
    serviceAccountKey.private_key,
    ["https://www.googleapis.com/auth/indexing"],
    undefined,
  );

  try {
    await jwtClient.authorize();

    const googleAccessToken = await jwtClient.getAccessToken();

    if (!googleAccessToken || !googleAccessToken.token) {
      console.error("Failed to obtain Google Access Token");
      return { message: "Failed to obtain Google Access Token" };
    }

    console.log("Google Access Token obtained successfully");

    // Submit to IndexNow
    const indexNowResponse = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(indexNowPayload),
    });

    let indexNowMessage = "URLs submitted successfully to IndexNow";
    if (!indexNowResponse.ok) {
      const indexNowErrorData = await indexNowResponse.json();
      console.error("IndexNow Error:", indexNowErrorData);
      indexNowMessage = `IndexNow Error: ${indexNowErrorData.message}`;
    } else {
      console.log("URLs submitted successfully to IndexNow");
    }

    // Prepare batch request body
    const boundary = "===============7330845974216740156==";
    let batchBody = "";

    fullUrlList.forEach((url, index) => {
      batchBody += `--${boundary}\r\n`;
      batchBody += "Content-Type: application/http\r\n";
      batchBody += "Content-Transfer-Encoding: binary\r\n";
      batchBody += `Content-ID: <${index + 1}>\r\n\r\n`;
      batchBody += "POST /v3/urlNotifications:publish HTTP/1.1\r\n";
      batchBody += "Content-Type: application/json\r\n";
      batchBody += "accept: application/json\r\n\r\n";
      batchBody += JSON.stringify({ url: url, type: "URL_UPDATED" }) + "\r\n";
    });

    batchBody += `--${boundary}--`;

    // Submit batch request to Google Indexing API
    const batchResponse = await fetch("https://indexing.googleapis.com/batch", {
      method: "POST",
      headers: {
        "Content-Type": `multipart/mixed; boundary=${boundary}`,
        Authorization: `Bearer ${googleAccessToken.token}`,
      },
      body: batchBody,
    });

    if (!batchResponse.ok) {
      const batchErrorData = await batchResponse.text();
      console.error("Batch Request Error:", batchErrorData);
      return { message: `Batch Request Error: ${batchErrorData}` };
    }

    const batchResponseText = await batchResponse.text();
    console.log("Batch Response:", batchResponseText);

    return {
      message: `${indexNowMessage} and URLs submitted successfully to Google Indexing API`,
    };
  } catch (error) {
    console.error("Error submitting URLs:", error);
    return { message: "Internal server error" };
  }
}