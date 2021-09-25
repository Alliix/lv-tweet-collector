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
  // let tweetsJson = fs.readFileSync(file, "utf-8");
  // let existingTweets = JSON.parse(tweetsJson);
  // const sinceId = existingTweets.tweets[existingTweets.tweets.length - 1].id;
  // const data = await twitterClient.tweets.search({
  //   q: query,
  //   since_id: sinceId,
  // });
  const data = await twitterClient.tweets.search({ q: query, count: 200 }); //geocode: "56.95623,24.12363,10000km"
  const tweetObjects = data.statuses.map((d) => {
    console.log(d.user);
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

const data = await getTweets("geocode:56.95623,24.12363,300km lang:lv", "");
writeToJson(data, "./tweetsLocationLang/json/tweets.json");
writeUniqueToJson(
  "./tweetsLocationLang/json/tweets.json",
  "./tweetsLocationLang/json/uniqueTweets.json"
);
