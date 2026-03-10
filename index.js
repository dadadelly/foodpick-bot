const express = require(‘express’);
const line = require(‘@line/bot-sdk’);

const config = {
channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || ‘YOUR_CHANNEL_ACCESS_TOKEN’,
channelSecret: process.env.CHANNEL_SECRET || ‘YOUR_CHANNEL_SECRET’,
};

const client = new line.Client(config);
const app = express();

// ===== FOOD DATABASE =====
const foodMenu = [
{
name: ‘ข้าวผัดกุ้ง’,
description: ‘ข้าวผัดสูตรเด็ด หอมกระเทียม กุ้งสดใหม่ทุกวัน’,
price: ‘65 บาท’,
calories: ‘450 kcal’,
image: ‘https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80’,
emoji: ‘🍤’,
tag: ‘ยอดนิยม’,
tagColor: ‘#FF6B6B’,
},
{
name: ‘ผัดไทยกุ้งสด’,
description: ‘ผัดไทยต้นตำรับ เส้นเหนียว นุ่ม ไม่เละ’,
price: ‘70 บาท’,
calories: ‘520 kcal’,
image: ‘https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&q=80’,
emoji: ‘🍜’,
tag: ‘เมนูแนะนำ’,
tagColor: ‘#F7B731’,
},
{
name: ‘ส้มตำไทย’,
description: ‘ส้มตำสูตรดั้งเดิม เปรี้ยว หวาน เผ็ด กลมกล่อม’,
price: ‘50 บาท’,
calories: ‘180 kcal’,
image: ‘https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&q=80’,
emoji: ‘🥗’,
tag: ‘สุขภาพดี’,
tagColor: ‘#26de81’,
},
{
name: ‘ต้มยำกุ้ง’,
description: ‘ต้มยำน้ำข้น รสจัดจ้าน กุ้งแม่น้ำตัวใหญ่’,
price: ‘90 บาท’,
calories: ‘310 kcal’,
image: ‘https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=400&q=80’,
emoji: ‘🍲’,
tag: ‘ซิกเนเจอร์’,
tagColor: ‘#a55eea’,
},
{
name: ‘ข้าวมันไก่’,
description: ‘ข้าวมันนุ่มหอม ไก่ต้มสุก เสิร์ฟพร้อมน้ำซุปร้อนๆ’,
price: ‘55 บาท’,
calories: ‘480 kcal’,
image: ‘https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80’,
emoji: ‘🍗’,
tag: ‘คลาสสิค’,
tagColor: ‘#fd9644’,
},
];

// ===== KEYWORD MATCHING =====
const FOOD_KEYWORDS = [‘แนะนำร้านอาหาร’, ‘กินอะไรดี’, ‘หิวข้าว’];

function matchKeyword(text) {
const trimmed = text.trim();
return FOOD_KEYWORDS.some(kw => trimmed.includes(kw));
}

// ===== RANDOM FOOD PICKER =====
function getRandomFoods(count = 3) {
const shuffled = […foodMenu].sort(() => Math.random() - 0.5);
return shuffled.slice(0, count);
}

// ===== BUILD FLEX MESSAGE =====
function buildFlexMessage(foods) {
const bubbles = foods.map(food => ({
type: ‘bubble’,
size: ‘kilo’,
hero: {
type: ‘image’,
url: food.image,
size: ‘full’,
aspectRatio: ‘4:3’,
aspectMode: ‘cover’,
action: { type: ‘uri’, uri: ‘https://line.me’, label: ‘View’ },
},
body: {
type: ‘box’,
layout: ‘vertical’,
paddingAll: ‘14px’,
spacing: ‘sm’,
contents: [
// Tag badge
{
type: ‘box’,
layout: ‘horizontal’,
contents: [
{
type: ‘text’,
text: food.tag,
size: ‘xs’,
color: ‘#ffffff’,
align: ‘center’,
offsetStart: ‘0px’,
},
],
backgroundColor: food.tagColor,
cornerRadius: ‘20px’,
width: ‘80px’,
height: ‘22px’,
justifyContent: ‘center’,
alignItems: ‘center’,
},
// Food name
{
type: ‘text’,
text: `${food.emoji} ${food.name}`,
weight: ‘bold’,
size: ‘md’,
color: ‘#2d2d2d’,
wrap: true,
margin: ‘sm’,
},
// Description
{
type: ‘text’,
text: food.description,
size: ‘xs’,
color: ‘#888888’,
wrap: true,
maxLines: 2,
},
// Divider
{ type: ‘separator’, margin: ‘md’, color: ‘#f0f0f0’ },
// Price & Calories
{
type: ‘box’,
layout: ‘horizontal’,
margin: ‘sm’,
contents: [
{
type: ‘box’,
layout: ‘vertical’,
contents: [
{ type: ‘text’, text: ‘ราคา’, size: ‘xxs’, color: ‘#aaaaaa’ },
{ type: ‘text’, text: food.price, size: ‘sm’, weight: ‘bold’, color: ‘#FF6B6B’ },
],
},
{
type: ‘box’,
layout: ‘vertical’,
contents: [
{ type: ‘text’, text: ‘แคลอรี่’, size: ‘xxs’, color: ‘#aaaaaa’ },
{ type: ‘text’, text: food.calories, size: ‘sm’, weight: ‘bold’, color: ‘#26de81’ },
],
},
],
},
// Order button
{
type: ‘button’,
style: ‘primary’,
height: ‘sm’,
margin: ‘md’,
color: ‘#FF6B6B’,
action: {
type: ‘message’,
label: ‘🛒 สั่งเลย!’,
text: `สั่ง ${food.name}`,
},
cornerRadius: ‘20px’,
},
],
},
styles: {
body: { backgroundColor: ‘#ffffff’ },
},
}));

// Header bubble
const headerBubble = {
type: ‘bubble’,
size: ‘nano’,
body: {
type: ‘box’,
layout: ‘vertical’,
justifyContent: ‘center’,
alignItems: ‘center’,
paddingAll: ‘20px’,
spacing: ‘md’,
backgroundColor: ‘#FF6B6B’,
contents: [
{ type: ‘text’, text: ‘🍽️’, size: ‘xxl’, align: ‘center’ },
{ type: ‘text’, text: ‘FOODPICK’, weight: ‘bold’, size: ‘lg’, color: ‘#ffffff’, align: ‘center’ },
{ type: ‘text’, text: ‘เมนูแนะนำวันนี้’, size: ‘xs’, color: ‘#ffe0e0’, align: ‘center’ },
{ type: ‘separator’, margin: ‘md’, color: ‘#ff8c8c’ },
{
type: ‘text’,
text: `สุ่มมาให้ ${foods.length} เมนู\nเลื่อนดูได้เลย →`,
size: ‘xs’,
color: ‘#ffffff’,
align: ‘center’,
wrap: true,
},
],
},
};

return {
type: ‘flex’,
altText: `🍽️ FOODPICK แนะนำ ${foods.length} เมนูเด็ด! เลื่อนดูได้เลยค่า`,
contents: {
type: ‘carousel’,
contents: [headerBubble, …bubbles],
},
};
}

// ===== BUILD “ไม่เข้าใจ” MESSAGE =====
function buildConfusedMessage() {
return {
type: ‘flex’,
altText: ‘😅 ฉันไม่เข้าใจ ลองพิมพ์ใหม่นะคะ’,
contents: {
type: ‘bubble’,
size: ‘kilo’,
body: {
type: ‘box’,
layout: ‘vertical’,
alignItems: ‘center’,
paddingAll: ‘24px’,
spacing: ‘md’,
backgroundColor: ‘#fff9f9’,
contents: [
{ type: ‘text’, text: ‘😅’, size: ‘xxl’, align: ‘center’ },
{
type: ‘text’,
text: ‘ฉันไม่เข้าใจ’,
weight: ‘bold’,
size: ‘xl’,
color: ‘#FF6B6B’,
align: ‘center’,
},
{
type: ‘text’,
text: ‘ลองพิมพ์คำเหล่านี้ดูนะคะ’,
size: ‘sm’,
color: ‘#888888’,
align: ‘center’,
},
{ type: ‘separator’, margin: ‘md’ },
…[‘🍽️ แนะนำร้านอาหาร’, ‘🤔 กินอะไรดี’, ‘😋 หิวข้าว’].map(kw => ({
type: ‘button’,
style: ‘secondary’,
height: ‘sm’,
margin: ‘sm’,
action: {
type: ‘message’,
label: kw,
text: kw.replace(/^[^\s]+\s/, ‘’),
},
})),
],
},
},
};
}

// ===== WEBHOOK HANDLER =====
app.post(’https://foodpick-bot.onrender.com/webhook’, line.middleware(config), async (req, res) => {
try {
const events = req.body.events;
await Promise.all(events.map(handleEvent));
res.json({ status: ‘ok’ });
} catch (err) {
console.error(err);
res.status(500).json({ error: err.message });
}
});

async function handleEvent(event) {
if (event.type !== ‘message’ || event.message.type !== ‘text’) return;

const userText = event.message.text;
let replyMessage;

if (matchKeyword(userText)) {
const randomFoods = getRandomFoods(3);
replyMessage = buildFlexMessage(randomFoods);
} else {
replyMessage = buildConfusedMessage();
}

return client.replyMessage(event.replyToken, replyMessage);
}

// ===== HEALTH CHECK =====
app.get(’/’, (req, res) => {
res.send(‘🍽️ FOODPICK Bot is running! ✅’);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`🚀 FOODPICK Bot running on port ${PORT}`);
});
