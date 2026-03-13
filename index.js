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
"กินอะไรดีวันนี้","อาหารอะไรดี","ข้าว",
"ของกิน","กินข้าว","หาอาหาร","มื้อเย็น",
"มื้อกลางวัน","มื้อเช้า","ของหวาน","น้ำ",
"เครื่องดื่ม","ขนม","dessert","drink",
"food","menu","eat","hungry"
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

{name:"🍜 ผัดไทยกุ้งสด",price:"70 บาท",type:"food",img:"https://images.unsplash.com/photo-1559314809-0d155014e29e"},
{name:"🍲 ต้มยำกุ้ง",price:"90 บาท",type:"food",img:"https://images.unsplash.com/photo-1548943487-a2e4e43b4853"},
{name:"🍤 ข้าวผัดกุ้ง",price:"65 บาท",type:"food",img:"https://images.unsplash.com/photo-1603133872878-684f208fb84b"},
{name:"🍗 ข้าวมันไก่",price:"55 บาท",type:"food",img:"https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d"},
{name:"🥗 ส้มตำไทย",price:"50 บาท",type:"food",img:"https://images.unsplash.com/photo-1562802378-063ec186a863"},
{name:"🍛 ข้าวแกงกะหรี่",price:"80 บาท",type:"food",img:"https://images.unsplash.com/photo-1604908176997-125f25cc6f3d"},

{name:"🍰 เค้กสตรอว์เบอร์รี่",price:"75 บาท",type:"dessert",img:"https://images.unsplash.com/photo-1559622214-f8a9850965bb"},
{name:"🍨 ไอศกรีมวานิลลา",price:"45 บาท",type:"dessert",img:"https://images.unsplash.com/photo-1563805042-7684c019e1cb"},
{name:"🍩 โดนัท",price:"35 บาท",type:"dessert",img:"https://images.unsplash.com/photo-1509042239860-f550ce710b93"},

{name:"🧋 ชานมไข่มุก",price:"50 บาท",type:"drink",img:"https://images.unsplash.com/photo-1558857563-b371033873b8"},
{name:"☕ กาแฟลาเต้",price:"60 บาท",type:"drink",img:"https://images.unsplash.com/photo-1509042239860-f550ce710b93"},
{name:"🍹 น้ำผลไม้",price:"40 บาท",type:"drink",img:"https://images.unsplash.com/photo-1553530666-ba11a7da3888"}

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
size:"lg"
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
action:{
type:"message",
label:"🛒 สั่งเมนูนี้",
text:`สั่ง ${f.name}`
}
},

{
type:"button",
style:"secondary",
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
altText:"🍱 เมนูอาหาร",
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

if(event.type!=='message'||event.message.type!=='text'){
return null
}

const text=event.message.text


// ===== FOOD =====
if(matchKeyword(text,FOOD_KEYWORDS)){

return client.replyMessage(event.replyToken,[
{
type:"text",
text:"🍙 กำลังสุ่มเมนูอาหารให้นะคะ~ 💕"
},
buildFlex(randomMenu("food"))
])

}


// ===== DESSERT =====
if(matchKeyword(text,DESSERT_KEYWORDS)){

return client.replyMessage(event.replyToken,[
{
type:"text",
text:"🍰 เมนูของหวานมาแล้วค่าา~ 💖"
},
buildFlex(randomMenu("dessert"))
])

}


// ===== DRINK =====
if(matchKeyword(text,DRINK_KEYWORDS)){

return client.replyMessage(event.replyToken,[
{
type:"text",
text:"🧋 เครื่องดื่มสดชื่นมาแล้วค่า~ ✨"
},
buildFlex(randomMenu("drink"))
])

}


// ===== ORDER =====
if(text.startsWith("สั่ง")){

return client.replyMessage(event.replyToken,{
type:"text",
text:`รับออเดอร์ ${text.replace("สั่ง ","")} แล้วค่า 🍽️💖`
})

}


// ===== UNKNOWN =====
return client.replyMessage(event.replyToken,{
type:"text",
text:
`งื้อออ 🥺 ฉันไม่เข้าใจ

ลองพิมพ์
🍜 หิวข้าว
🍰 ของหวาน
🧋 เครื่องดื่ม
🍱 สุ่มอาหาร`
})

}


// ================= SERVER =================
app.get('/',(req,res)=>res.send("🍱 FoodPick PRO Bot Running"))

const port = process.env.PORT || 3000

app.listen(port,()=>{
console.log("FoodPick PRO Bot running on "+port)
})
