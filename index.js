import { TwitterClient } from "twitter-api-client";
import config from "./config.js";
import fs from "fs";

const twitterClient = new TwitterClient({
  apiKey: config.apiKey,
  apiSecret: config.apiSecret,
  accessToken: config.accessToken,
  accessTokenSecret: config.accessTokenSecret,
});

const getTweets = async (query, file) => {
  let tweetsJson = fs.readFileSync(file, "utf-8");
  let existingTweets = JSON.parse(tweetsJson);
  const sinceId = existingTweets.tweets[existingTweets.tweets.length - 1].id;
  const data = await twitterClient.tweets.search({
    q: query,
    since_id: sinceId,
    count: 200,
  });
  // const data = await twitterClient.tweets.search({ q: query, count: 200 });
  const tweetObjects = data.statuses.map((d) => {
    return {
      id: d.id,
      createdAt: d.created_at,
      text: d.text,
      hashtagsText: d.entities.hashtags.map((h) => h.text),
      symbolsText: d.entities.symbols.map((s) => s.text),
      userMentionsScreenNames: d.entities.user_mentions.map((m) => {
        return { id: m.id, userScreenName: m.screen_name };
      }),
      urls: d.entities.urls.map((u) => u.url),
      favCount: d.favorite_count,
      retweetCount: d.retweet_count,
      lang: d.lang,
      userId: d.user.id,
      userScreenName: d.user.screen_name,
    };
  });
  tweetObjects.sort((a, b) => {
    return a.id - b.id;
  }); //sort by date later first
  tweetObjects.shift(); //remove 1st element so sinceId isn't doubled
  return tweetObjects;
};

const writeToJson = (tweetsArray, file) => {
  let tweetsJson = fs.readFileSync(file, "utf-8");
  const existingTweets = JSON.parse(tweetsJson);
  existingTweets.tweets.push(...tweetsArray);
  tweetsJson = JSON.stringify(existingTweets);
  fs.writeFileSync(file, tweetsJson, "utf-8");
};

const writeUniqueToJson = (fileFrom, fileTo) => {
  let tweetsJson = fs.readFileSync(fileFrom, "utf-8");
  const existingTweets = JSON.parse(tweetsJson);
  const existingTweetsTextCleaned = existingTweets.tweets.map((t) =>
    replaceUrls(t)
  );
  const uniqueTweets = Array.from(
    new Set(existingTweetsTextCleaned.map((a) => a.text))
  ).map((text) => {
    return existingTweetsTextCleaned.find((a) => a.text === text);
  });
  tweetsJson = JSON.stringify({ tweets: uniqueTweets });
  fs.writeFileSync(fileTo, tweetsJson, "utf-8");
};

const replaceUrls = (tweet) => {
  if (tweet.urls.length) {
    tweet.urls.forEach((url) => {
      tweet.text = tweet.text.replace(url, "URL");
    });
  }
  return tweet;
};

const writeTweetIds = (tweetsArray) => {
  const idsFile = fs.readFileSync("./tweetsIds/tweets.json", "utf-8");
  let existingIds = JSON.parse(idsFile);
  let lastIndex = existingIds.tweets[existingIds.tweets.length - 1].index;
  for (const tweet in tweetsArray) {
    lastIndex++;
    existingIds.tweets.push({ index: lastIndex, id: tweet.id });
  }
  const tweetsIdsJson = JSON.stringify(existingIds);
  fs.writeFileSync("./tweetsIds/tweets.json", tweetsIdsJson, "utf-8");
};

const writeAllTweetIds = () => {
  const tweetsFromFile = fs.readFileSync(
    "./tweetsLocationLang/json/tweets.json",
    "utf-8"
  );
  const tweets = JSON.parse(tweetsFromFile);
  const tweetsIds = tweets.tweets.map((t, i) => {
    return { index: i, id: t.id };
  });
  const tweetsIdsJson = JSON.stringify({ tweets: tweetsIds });
  fs.writeFileSync("./tweetsIds/tweets.json", tweetsIdsJson, "utf-8");
};

const writeUniqueTweetIds = () => {
  const tweetsFromUniqueFile = fs.readFileSync(
    "./tweetsLocationLang/json/uniqueTweets.json",
    "utf-8"
  );
  const uniqueTweets = JSON.parse(tweetsFromUniqueFile);
  const uniqueTweetsIds = uniqueTweets.tweets.map((t, i) => {
    return { index: i, id: t.id };
  });
  const tweetsIdsJson = JSON.stringify({ tweets: uniqueTweetsIds });
  fs.writeFileSync("./tweetsIds/uniqueTweets.json", tweetsIdsJson, "utf-8");
};

const data = await getTweets(
  "geocode:56.95623,24.12363,300km lang:lv",
  "./tweetsLocationLang/json/tweets.json"
);
writeToJson(data, "./tweetsLocationLang/json/tweets.json");
writeUniqueToJson(
  "./tweetsLocationLang/json/tweets.json",
  "./tweetsLocationLang/json/uniqueTweets.json"
);
writeTweetIds(data);
writeUniqueTweetIds();
