import fs from "fs";
import open from "open";
import { google } from "googleapis";
import { waitForFile } from "../base/inputOutputModule.js";
import { clientId, clientSecret, redirectUri } from "../../configuration.js";

const OAUTH_CODE_PATH = "auth/googleOAuthCode.txt";
const TOKEN_PATH = "auth/googleToken.json";

const SCOPES = [
  "https://www.googleapis.com/auth/youtube",
  "https://www.googleapis.com/auth/drive",
];

const oAuth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  redirectUri
);

function _isTokenExpired(expiry_date) {
  const now = new Date().getTime();
  const expiryDate = new Date(expiry_date);
  return now >= expiryDate.getTime();
}

async function _saveOAuthCode() {
  try {
    if (!fs.existsSync("auth/googleOAuthCode.txt")) {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
      });

      console.warn(`Google Auth Url: ${authUrl}`);
      console.log("Google Auth: Opening browser for authentication.");

      await open(authUrl);

      await waitForFile(OAUTH_CODE_PATH);
    }
  } catch (err) {
    console.error("Google Auth: Error getting OAuth code");
    throw err;
  }
}

async function _saveToken() {
  try {
    const code = fs.readFileSync(OAUTH_CODE_PATH, "utf8");

    oAuth2Client.getToken(code, async (err, token) => {
      console.log("Google Auth: Saving token...");

      if (err) {
        console.error("Google Auth: Error retrieving token");
        throw err;
      }

      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token), { flag: "w" });

      console.info("Google Auth: Token stored.");
    });

    await waitForFile(TOKEN_PATH);
  } catch (err) {
    console.error("Google Auth: Error saving token");
    throw err;
  }
}

async function _refreshToken() {
  try {
    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH));

    console.info(`${JSON.stringify(tokens)}`);

    oAuth2Client.setCredentials(tokens);

    oAuth2Client.refreshAccessToken(async (err, newToken) => {
      console.info("Google Auth: Refreshing token...");

      if (err) {
        console.error("Google Auth: Error refreshing token");
        throw err;
      }

      console.info(`newToken: ${JSON.stringify(newToken.tokens)}`);

      fs.writeFileSync(TOKEN_PATH, JSON.stringify(newToken.tokens), {
        flag: "w",
      });

      console.info("Google Auth: Token stored.");
    });

    await waitForFile(TOKEN_PATH);
  } catch (err) {
    console.error("Google Auth: Error saving token");
    throw err;
  }
}

export async function authenticateGoogleClient() {
  try {
    // Check if dont have googleOAuthCode.txt file
    if (!fs.existsSync(OAUTH_CODE_PATH)) {
      await _saveOAuthCode();
    }

    // Check if dont have googleToken.json file
    if (!fs.existsSync(TOKEN_PATH)) {
      console.log("Google Auth: No token found, getting new token.");
      await _saveToken();
    } else {
      const isExpired = _isTokenExpired(
        JSON.parse(fs.readFileSync(TOKEN_PATH)).expiry_date
      );
      if (isExpired) {
        console.log("Google Auth: Token is expired, getting new token.");
        await _refreshToken();
      }
    }

    // Load tokens from file
    const tokens = fs.readFileSync(TOKEN_PATH);

    oAuth2Client.setCredentials(JSON.parse(tokens));

    google.options({
      auth: oAuth2Client,
    });
  } catch (err) {
    console.error("Google Auth: Error authorizing client");
    throw err;
  }
}
