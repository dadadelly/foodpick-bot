const express = require('express');
const line = require('@line/bot-sdk');

const app = express();

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.Client(config);


// ===== KEYWORDS =====
const FOOD_KEYWORDS = [
  "หิว", "หิวข้าว", "กินอะไรดี", "แนะนำอาหาร",
  "มีอะไรให้กิน", "กินอะไรดีวันนี้", "แนะนำร้านอาหาร",
  "ขอเมนูหน่อย", "มีเมนูไหม", "อยากกินข้าว",
  "อยากกินอะไร", "หาอะไรอร่อยๆ", "ขออาหาร",
  "เมนูวันนี้", "มีอะไรกิน", "ขอเมนูอาหาร",
  "อาหารอะไรดี", "ช่วยเลือกอาหาร", "สุ่มอาหาร",
  "เลือกเมนูให้หน่อย"
];

function matchKeyword(text){
  return FOOD_KEYWORDS.some(k => text.includes(k));
}


// ===== FOOD MENU =====
const foods = [

{
name:"🍜 ผัดไทยกุ้งสด",
price:"70 บาท",
img:"https://images.unsplash.com/photo-1559314809-0d155014e29e"
},

{
name:"🍲 ต้มยำกุ้ง",
price:"90 บาท",
img:"https://images.unsplash.com/photo-1548943487-a2e4e43b4853"
},

{
name:"🍤 ข้าวผัดกุ้ง",
price:"65 บาท",
img:"https://images.unsplash.com/photo-1603133872878-684f208fb84b"
},

{
name:"🍗 ข้าวมันไก่",
price:"55 บาท",
img:"https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d"
},

{
name:"🥗 ส้มตำไทย",
price:"50 บาท",
img:"https://images.unsplash.com/photo-1562802378-063ec186a863"
}

];


// ===== RANDOM FOOD =====
function randomFood(){
return foods.sort(()=>0.5-Math.random()).slice(0,3)
}


// ===== FLEX MESSAGE =====
function buildFlex(foodList){

const bubbles = foodList.map(f=>({

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
text:"🍱 เมนูแนะนำ",
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
label:"💖 อยากกิน!",
text:`สั่ง ${f.name}`
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


// ===== WEBHOOK =====
app.post('/webhook',line.middleware(config),(req,res)=>{

Promise
.all(req.body.events.map(handleEvent))
.then(result=>res.json(result))
.catch(err=>{
console.error(err)
res.status(500).end()
})

})


// ===== EVENT =====
async function handleEvent(event){

if(event.type !== 'message' || event.message.type !== 'text'){
return null
}

const text = event.message.text


// ===== FOOD COMMAND =====
if(matchKeyword(text)){

return client.replyMessage(event.replyToken,[
{
type:"text",
text:"🍙 กำลังสุ่มเมนูให้นะคะ~ 💕"
},
buildFlex(randomFood())
])

}


// ===== ORDER =====
if(text.startsWith("สั่ง")){

return client.replyMessage(event.replyToken,{
type:"text",
text:`เย้~ รับออเดอร์ ${text.replace("สั่ง ","")} แล้วค่าา 🍽️✨`
})

}


// ===== UNKNOWN =====
return client.replyMessage(event.replyToken,{
type:"text",
text:"งื้อออ 🥺 ฉันไม่เข้าใจ\nลองพิมพ์ว่า 'หิวข้าว' หรือ 'กินอะไรดี' นะคะ 🍜💕"
})

}


// ===== SERVER =====
app.get('/',(req,res)=>res.send("🍱 Kawaii Food Bot Running"))

const port = process.env.PORT || 3000

app.listen(port,()=>{
console.log("Server running on port "+port)
})
