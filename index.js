const express = require('express');
const line = require('@line/bot-sdk');

const app = express();

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.Client(config);


// ================= KEYWORDS =================
const FOOD_KEYWORDS = [
"หิว","หิวข้าว","หิวแล้ว","หิวมาก","หิวสุดๆ",
"หิวจัด","หิวโคตร","หิวจริง","หิวจัง",

// อยากกิน
"อยากกิน","อยากกินข้าว","อยากกินอะไร",
"อยากหาอะไรกิน","อยากกินไร","อยากกินไรดี",

// ถามเมนู
"กินอะไรดี","กินไรดี","กินอะไรดีนะ",
"กินไรดีนะ","กินอารายดี","กินไรดีวะ",
"มีอะไรกิน","มีเมนูอะไร",

// สุ่ม
"สุ่มอาหาร","สุ่มเมนู","สุ่มกิน",
"แนะนำอาหาร","แนะนำเมนู",

// อังกฤษ
"hungry","im hungry","i am hungry",
"what to eat","what should i eat",
"food","eat","menu","random food",
"recommend food",

// เพิ่มคำที่คนพิมพ์จริง
"ขอกินอะไรหน่อย",
"ช่วยเลือกอาหาร",
"เลือกอาหารให้หน่อย",
"ช่วยเลือกเมนู",
"คิดเมนูไม่ออก",
"ไม่รู้จะกินอะไร",
"ไม่รู้จะกินไร",
"คิดไม่ออกจะกินอะไร",
"คิดไม่ออกจะกินไร",
"มีอะไรแนะนำ",
"มีอะไรน่ากิน",
"มีอะไรอร่อย",
"มีอะไรให้กิน",
"อยากได้เมนู",
"อยากได้อาหาร",
"ขอเมนูหน่อย",
"ขออาหารหน่อย",
"หาเมนูให้หน่อย",
"หาอาหารให้หน่อย",
"สุ่มให้หน่อย",
"สุ่มอะไรดี",
"สุ่มของกิน",
"สุ่มของกินให้หน่อย",
"สุ่มเมนูให้หน่อย",
"สุ่มอะไรให้กิน",
"ช่วยสุ่มอาหาร",
"ช่วยสุ่มเมนู",

// ภาษาพูด
"แดกไรดี",
"แดกอะไรดี",
"จะกินไรดี",
"จะกินอะไรดี",
"กินดีไหม",
"วันนี้กินอะไรดี",
"วันนี้กินไรดี",
"มื้อเย็นกินอะไรดี",
"มื้อกลางวันกินอะไรดี",
"มื้อเช้ากินอะไรดี",

// ภาษาน่ารัก
"หิวจุง",
"หิวจังเลย",
"หิวมากเลย",
"หิวมากๆ",
"หิวสุดๆเลย",
"อยากกินจัง",
"อยากกินมาก",
"อยากกินมากๆ",
"อยากกินสุดๆ",

// อังกฤษเพิ่ม
"food idea",
"meal idea",
"choose food for me",
"pick food for me",
"recommend meal",
"any food idea",
"food suggestion",
"meal suggestion",
"what food",
"what meal",
"give me menu",
"choose menu",
"pick menu"
];

const DESSERT_KEYWORDS = [
"ของหวาน","ขนม","ขนมหวาน",
"อยากกินของหวาน","อยากกินขนม",
"มีของหวานอะไร","มีขนมอะไร","หนม",

// อังกฤษ
"dessert","sweet","sweets",
"want dessert","sweet food",

"อยากกินขนมหวาน",
"อยากกินของหวานหน่อย",
"มีขนมอะไรแนะนำ",
"มีของหวานอะไรบ้าง",
"สุ่มขนม",
"สุ่มของหวาน",
"เลือกขนมให้หน่อย",
"ช่วยเลือกของหวาน",
"อยากกินขนมจัง",
"ขอขนมหน่อย",

// อังกฤษ
"sweet please",
"dessert please",
"any dessert",
"recommend dessert",
"pick dessert",
"dessert idea"
];

const DRINK_KEYWORDS = [
"น้ำ","เครื่องดื่ม","อยากดื่ม",
"ดื่มอะไรดี","มีน้ำอะไร",

// ชา กาแฟ
"ชานม","ชานมไข่มุก","ชาไข่มุก",
"กาแฟ","ลาเต้","คาปูชิโน",

// อังกฤษ
"drink","beverage",
"something to drink",
"coffee","milk tea","boba",

"อยากกินน้ำเย็นๆ",
"อยากดื่มอะไรสักอย่าง",
"มีน้ำอะไรแนะนำ",
"มีเครื่องดื่มอะไร",
"สุ่มเครื่องดื่ม",
"เลือกเครื่องดื่มให้หน่อย",
"ช่วยเลือกน้ำให้หน่อย",
"หาเครื่องดื่มให้หน่อย",

// ชานม
"อยากกินชานม",
"อยากกินชาไข่มุก",
"อยากดื่มชานม",

// กาแฟ
"อยากกินกาแฟ",
"อยากดื่มกาแฟ",

// อังกฤษ
"drink idea",
"recommend drink",
"choose drink",
"pick drink",
"any drink",
"what drink"
];


function matchKeyword(text,list){
return list.some(k=>text.includes(k))
}


// ================= MENU =================
const foods=[

{name:"🍜 ผัดไทยกุ้งสด",price:"70 บาท",type:"food",img:"https://s.shortlink.ly/EznM9k"},
{name:"🍲 ต้มยำกุ้ง",price:"90 บาท",type:"food",img:"https://s.shortlink.ly/POTh7W"},
{name:"🍤 ข้าวผัดกุ้ง",price:"65 บาท",type:"food",img:"https://s.shortlink.ly/1xt21A"},
{name:"🍗 ข้าวมันไก่",price:"55 บาท",type:"food",img:"https://s.shortlink.ly/bMcaAy"},
{name:"🥗 ส้มตำไทย",price:"50 บาท",type:"food",img:"https://s.shortlink.ly/F08XAF"},
{name:"🍝 สปาเกตตี้",price:"95 บาท",type:"food",img:"https://images.unsplash.com/photo-1608756687911-aa1599ab3bd9"},
{name:"🍔 เบอร์เกอร์",price:"120 บาท",type:"food",img:"https://images.unsplash.com/photo-1550547660-d9450f859349"},
{name:"🍕 พิซซ่า",price:"150 บาท",type:"food",img:"https://images.unsplash.com/photo-1548365328-9f547fb0953c"},
{name:"🍳 ข้าวไข่เจียว",price:"40 บาท",type:"food",img:"https://images.unsplash.com/photo-1604909053195-8c8c9b472151"},
{name:"🍱 ข้าวหน้าหมู",price:"60 บาท",type:"food",img:"https://images.unsplash.com/photo-1604908554028-bb8a9e4b9a2e"},

{name:"🍰 เค้กสตรอว์เบอร์รี่",price:"75 บาท",type:"dessert",img:"https://s.shortlink.ly/rV7irO"},
{name:"🍨 ไอศกรีมวานิลลา",price:"45 บาท",type:"dessert",img:"https://s.shortlink.ly/5sVTgM"},
{name:"🍩 โดนัท",price:"35 บาท",type:"dessert",img:"https://s.shortlink.ly/qaUvch"},
{name:"🍮 พุดดิ้ง",price:"40 บาท",type:"dessert",img:"https://images.unsplash.com/photo-1488477181946-6428a0291777"},
{name:"🧇 วาฟเฟิล",price:"60 บาท",type:"dessert",img:"https://images.unsplash.com/photo-1562376552-0d160a2f238d"},
{name:"🍫 บราวนี่",price:"55 บาท",type:"dessert",img:"https://images.unsplash.com/photo-1606313564200-e75d5e30476d"},
{name:"🍪 คุกกี้ช็อกโกแลต",price:"35 บาท",type:"dessert",img:"https://images.unsplash.com/photo-1499636136210-6f4ee915583e"},
{name:"🥞 แพนเค้ก",price:"65 บาท",type:"dessert",img:"https://images.unsplash.com/photo-1528207776546-365bb710ee93"},
{name:"🍧 น้ำแข็งไส",price:"40 บาท",type:"dessert",img:"https://images.unsplash.com/photo-1625944525903-c6b8c7b4a2a3"},
{name:"🍯 ฮันนี่โทสต์",price:"95 บาท",type:"dessert",img:"https://images.unsplash.com/photo-1606313564200-e75d5e30476d"},

{name:"🧋 ชานมไข่มุก",price:"50 บาท",type:"drink",img:"https://s.shortlink.ly/T9woRa"},
{name:"☕ กาแฟลาเต้",price:"60 บาท",type:"drink",img:"https://s.shortlink.ly/Bft3UW"},
{name:"🍹 น้ำผลไม้",price:"40 บาท",type:"drink",img:"https://s.shortlink.ly/lZ8NzH"},
{name:"🧋 ชาไทยเย็น",price:"40 บาท",type:"drink",img:"https://images.unsplash.com/photo-1558857563-b371033873b8"},
{name:"🍵 ชาเขียวมัทฉะ",price:"60 บาท",type:"drink",img:"https://images.unsplash.com/photo-1515823064-d6e0c04616a7"},
{name:"🥛 นมสด",price:"35 บาท",type:"drink",img:"https://images.unsplash.com/photo-1563636619-e9143da7973b"},
{name:"🍫 ช็อกโกแลตร้อน",price:"55 บาท",type:"drink",img:"https://images.unsplash.com/photo-1511920170033-f8396924c348"},
{name:"🍋 น้ำมะนาวโซดา",price:"45 บาท",type:"drink",img:"https://images.unsplash.com/photo-1558640476-437a2b9438a2"},
{name:"🍓 สมูทตี้สตรอว์เบอร์รี่",price:"65 บาท",type:"drink",img:"https://images.unsplash.com/photo-1502741338009-cac2772e18bc"},
{name:"🥭 สมูทตี้มะม่วง",price:"65 บาท",type:"drink",img:"https://images.unsplash.com/photo-1553530666-ba11a7da3888"},

];


// ================= RANDOM =================
function randomMenu(type){

let filtered = foods

if(type){
filtered = foods.filter(f=>f.type===type)
}

return filtered.sort(()=>0.5-Math.random()).slice(0,3)

}


// ================= FLEX =================
function buildFlex(menu){

const bubbles = menu.map(f=>({

type:"bubble",

hero:{
type:"image",
url:f.img,
size:"full",
aspectRatio:"4:3",
aspectMode:"cover"
},

body:{
type:"box",
layout:"vertical",
spacing:"sm",
contents:[

{
type:"text",
text:"🍱 FOODPICK",
size:"xs",
color:"#FF69B4"
},

{
type:"text",
text:f.name,
weight:"bold",
size:"lg",
wrap:true
},

{
type:"text",
text:`ราคา ${f.price}`,
size:"sm",
color:"#888888"
},

{
type:"button",
style:"primary",
color:"#FF8ACD",
height:"sm",
margin:"md",
action:{
type:"message",
label:"🛒 สั่งเมนูนี้",
text:`สั่ง ${f.name}`
}
},

{
type:"button",
style:"secondary",
height:"sm",
margin:"sm",
action:{
type:"message",
label:"🔄 สุ่มใหม่",
text:"สุ่มอาหาร"
}
}

]

}

}))

return{
type:"flex",
altText:"🍱 เมนูอาหารน่ารักๆ",
contents:{
type:"carousel",
contents:bubbles
}
}

}


// ================= WEBHOOK =================
app.post('/webhook',line.middleware(config),(req,res)=>{

Promise
.all(req.body.events.map(handleEvent))
.then(result=>res.json(result))
.catch(err=>{
console.error(err)
res.status(500).end()
})

})

function normalizeText(text){

// แปลงเป็นตัวเล็กทั้งหมด
text = text.toLowerCase()

// ลดตัวอักษรที่ซ้ำเกิน 2 ตัว เช่น หิววววว -> หิวว
text = text.replace(/(.)\1{2,}/g,"$1$1")

// ตัด space หน้า-หลัง
text = text.trim()

return text
}

// ================= EVENT =================
async function handleEvent(event){

if(event.type !== "message") return null


// ===== IMAGE =====
if(event.message.type === "image"){
return client.replyMessage(event.replyToken,{
type:"text",
text:"งื้อออ 🥺 ตอนนี้ FOODPICK ยังไม่มีฟังก์ชันอ่านรูปนะคะ 📸💕\nลองพิมพ์ว่า 'หิวข้าว' หรือ 'สุ่มอาหาร' ดูสิคะ 🍜"
})
}


// ===== LOCATION =====
if(event.message.type === "location"){
return client.replyMessage(event.replyToken,{
type:"text",
text:"โอ๊ะ! 📍 ตอนนี้ FOODPICK ยังไม่สามารถหาร้านจากตำแหน่งได้ค่าา 🥺\nแต่สุ่มเมนูอร่อยๆให้ได้นะคะ 🍱💕"
})
}


// ===== STICKER =====
if(event.message.type === "sticker"){
return client.replyMessage(event.replyToken,{
type:"text",
text:"สติ๊กเกอร์น่ารักมากเลยค่าา 😆💖\nแต่ FOODPICK ยังอ่านสติ๊กเกอร์ไม่ได้นะคะ\nลองพิมพ์ 'กินอะไรดี' ดูสิ 🍜"
})
}


// ===== AUDIO =====
if(event.message.type === "audio"){
return client.replyMessage(event.replyToken,{
type:"text",
text:"งื้ออ 🎧 ตอนนี้ FOODPICK ยังฟังเสียงไม่ได้ค่าา 🥺\nลองพิมพ์ข้อความแทนนะคะ 🍱💕"
})
}


if(event.message.type !== "text") return null

const text = normalizeText(event.message.text)


// ===== FOOD =====
if(matchKeyword(text,FOOD_KEYWORDS)){

return client.replyMessage(event.replyToken,[
{
type:"text",
text:"🍙 กำลังสุ่มเมนูอร่อยๆให้เลยนะคะ~ 💕"
},
buildFlex(randomMenu("food"))
])

}


// ===== DESSERT =====
if(matchKeyword(text,DESSERT_KEYWORDS)){

return client.replyMessage(event.replyToken,[
{
type:"text",
text:"🍰 เมนูของหวานน่ารักๆมาแล้วค่าา~ 💖"
},
buildFlex(randomMenu("dessert"))
])

}


// ===== DRINK =====
if(matchKeyword(text,DRINK_KEYWORDS)){

return client.replyMessage(event.replyToken,[
{
type:"text",
text:"🧋 เครื่องดื่มสดชื่นมาแล้วค่าา~ ✨"
},
buildFlex(randomMenu("drink"))
])

}


// ===== ORDER =====
if(text.startsWith("สั่ง")){

const menu=text.replace("สั่ง ","")

return client.replyMessage(event.replyToken,{
type:"text",
text:`เย้~ 🎉 รับออเดอร์ ${menu} แล้วค่าา 🍽️💖\nกำลังเตรียมความอร่อยให้เลยนะคะ 😋`
})

}


// ===== UNKNOWN =====
return client.replyMessage(event.replyToken,{
type:"text",
text:`งื้อออ 🥺 ฉันยังไม่เข้าใจข้อความนี้ค่าา

ลองพิมพ์แบบนี้ได้นะคะ 💕

🍜 หิวข้าว  
🍱 สุ่มอาหาร  
🍰 ของหวาน  
🧋 เครื่องดื่ม`
})

}


// ================= SERVER =================
app.get('/',(req,res)=>res.send("🍱 FOODPICK Kawaii Bot Running"))

const port = process.env.PORT || 3000

app.listen(port,()=>{
console.log("FOODPICK Bot running on port "+port)
})
