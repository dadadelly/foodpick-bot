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
"หิว","หิวข้าว","กินอะไรดี","อยากกิน",
"อยากกินอะไร","มีอะไรกิน","แนะนำอาหาร",
"แนะนำร้านอาหาร","เมนูวันนี้","ขอเมนู",
"สุ่มอาหาร","ช่วยเลือกอาหาร","หาอะไรอร่อยๆ",
"กินอะไรดีวันนี้","อาหารอะไรดี"
];

const DESSERT_KEYWORDS = [
"ของหวาน","ขนม","อยากกินหวาน","dessert"
];

const DRINK_KEYWORDS = [
"น้ำ","เครื่องดื่ม","drink","อยากดื่ม"
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

{name:"🍰 เค้กสตรอว์เบอร์รี่",price:"75 บาท",type:"dessert",img:"https://s.shortlink.ly/rV7irO"},
{name:"🍨 ไอศกรีมวานิลลา",price:"45 บาท",type:"dessert",img:"https://s.shortlink.ly/5sVTgM"},
{name:"🍩 โดนัท",price:"35 บาท",type:"dessert",img:"https://s.shortlink.ly/qaUvch"},

{name:"🧋 ชานมไข่มุก",price:"50 บาท",type:"drink",img:"https://s.shortlink.ly/T9woRa"},
{name:"☕ กาแฟลาเต้",price:"60 บาท",type:"drink",img:"https://s.shortlink.ly/Bft3UW"},
{name:"🍹 น้ำผลไม้",price:"40 บาท",type:"drink",img:"https://s.shortlink.ly/lZ8NzH"}

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

const text = event.message.text


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
