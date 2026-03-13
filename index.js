const express = require('express');
const line = require('@line/bot-sdk');

const app = express();

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.Client(config);

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

async function handleEvent(event) {

  if (event.type !== 'message' || event.message.type !== 'text') {
    return null;
  }

  const text = event.message.text;

  if (
    text === "แนะนำร้านอาหาร" ||
    text === "กินอะไรดี" ||
    text === "หิวข้าว"
  ) {

    const flexMessage = {
      type: "flex",
      altText: "เมนูแนะนำ",
      contents: {
        type: "carousel",
        contents: [

          {
            type: "bubble",
            hero: {
              type: "image",
              url: "https://images.unsplash.com/photo-1559314809-0d155014e29e",
              size: "full",
              aspectRatio: "4:3",
              aspectMode: "cover"
            },
            body: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "🍜 ผัดไทยกุ้งสด",
                  weight: "bold",
                  size: "lg"
                },
                {
                  type: "text",
                  text: "ราคา 70 บาท",
                  size: "sm",
                  color: "#888888"
                }
              ]
            }
          },

          {
            type: "bubble",
            hero: {
              type: "image",
              url: "https://images.unsplash.com/photo-1548943487-a2e4e43b4853",
              size: "full",
              aspectRatio: "4:3",
              aspectMode: "cover"
            },
            body: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "🍲 ต้มยำกุ้ง",
                  weight: "bold",
                  size: "lg"
                },
                {
                  type: "text",
                  text: "ราคา 90 บาท",
                  size: "sm",
                  color: "#888888"
                }
              ]
            }
          },

          {
            type: "bubble",
            hero: {
              type: "image",
              url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b",
              size: "full",
              aspectRatio: "4:3",
              aspectMode: "cover"
            },
            body: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "🍤 ข้าวผัดกุ้ง",
                  weight: "bold",
                  size: "lg"
                },
                {
                  type: "text",
                  text: "ราคา 65 บาท",
                  size: "sm",
                  color: "#888888"
                }
              ]
            }
          }

        ]
      }
    };

    return client.replyMessage(event.replyToken, flexMessage);
  }

  return client.replyMessage(event.replyToken, {
    type: "text",
    text: "ฉันไม่เข้าใจ"
  });
}

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server running on port " + port);
});
