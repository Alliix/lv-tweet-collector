import { TwitterClient } from "twitter-api-client";

const twitterClient = new TwitterClient({
  apiKey: process.env.apiKey,
  apiSecret: process.env.apiSecret,
  accessToken: process.env.accessToken,
  accessTokenSecret: process.env.accessTokenSecret,
});

const getTweets = async (sinceId) => {
  const data = sinceId
    ? await twitterClient.tweets.search({
        q: "locale:lv",
        since_id: sinceId,
      })
    : await twitterClient.tweets.search({
        q: "locale:lv",
        count: 200,
      }); //geocode: "56.95623,24.12363,10000km"
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
  return tweetObjects;
};
