import dotenv from "dotenv";

dotenv.config();
const config = {
  apiKey: process.env.apiKey,
  apiSecret: process.env.apiSecret,
  accessToken: process.env.accessToken,
  accessTokenSecret: process.env.accessTokenSecret,
};

export default config;
