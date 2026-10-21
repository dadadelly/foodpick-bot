// agent.js — ให้ LLM ช่วยตอบข้อความที่ keyword / node-nlp ไม่เข้าใจ
// ใช้หลัก Agent Loop เดียวกับ workshop: LLM "ขอ" เรียก tool -> โค้ดเราเรียกจริง -> ส่งผลกลับ
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // ตั้งใน Render > Environment
const MODEL = 'gpt-4o-mini';
const MAX_STEPS = 4;
const HISTORY_LIMIT = 10; // จำบทสนทนาล่าสุดต่อคน (อยู่ใน RAM, Render รีสตาร์ตแล้วหาย)

const SYSTEM = `คุณคือ FOODPICK ผู้ช่วยเลือกเมนูในไลน์ พูดน่ารัก สั้น ๆ ใช้อีโมจิได้ ลงท้ายด้วย ค่ะ/คะ
- แนะนำได้เฉพาะเมนูที่ได้จาก search_menu เท่านั้น ห้ามแต่งเมนูหรือราคาขึ้นเอง
- ถ้าลูกค้าบอกงบ ประเภท หรือวัตถุดิบ ให้ส่งเป็นเงื่อนไขของ search_menu
- ถ้าไม่มีเมนูที่ตรง ให้บอกตรง ๆ แล้วเสนอเมนูใกล้เคียง
- ห้ามบอกว่ารับออเดอร์แล้ว ให้บอกลูกค้ากดปุ่ม "สั่งเมนูนี้" ใต้รูปแทน
- ถ้าคำถามไม่เกี่ยวกับอาหาร ตอบสั้น ๆ แล้วชวนกลับมาเลือกเมนู`;

const tools = [{
  type: 'function',
  function: {
    name: 'search_menu',
    description: 'ค้นเมนูในร้าน กรองตามประเภท งบสูงสุด และคำค้น (ชื่อหรือแท็ก เช่น กุ้ง เผ็ด ร้อน)',
    parameters: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['food', 'dessert', 'drink'] },
        max_price: { type: 'number', description: 'งบสูงสุดเป็นบาท' },
        keyword: { type: 'string', description: 'คำเดียวสั้น ๆ เช่น กุ้ง, ช็อกโกแลต, เย็น' },
      },
    },
  },
}];

module.exports = function createAgent(foods) {
  const histories = new Map();
  const priceOf = f => parseInt(String(f.price).replace(/\D/g, ''), 10) || 0;

  function searchMenu({ type, max_price, keyword } = {}) {
    let list = foods;
    if (type) list = list.filter(f => f.type === type);
    if (max_price) list = list.filter(f => priceOf(f) <= max_price);
    if (keyword) list = list.filter(f => `${f.name} ${f.tags || ''}`.includes(keyword));
    return list;
  }

  async function chat(userId, userText) {
    const history = histories.get(userId) || [];
    const messages = [{ role: 'system', content: SYSTEM }, ...history, { role: 'user', content: userText }];
    let shown = []; // เมนูที่ค้นเจอ เอาไปทำ Flex carousel

    for (let step = 0; step < MAX_STEPS; step++) {
      const r = await openai.chat.completions.create({ model: MODEL, temperature: 0.3, messages, tools });
      const msg = r.choices[0].message;

      if (!msg.tool_calls || msg.tool_calls.length === 0) {
        const reply = msg.content || 'งื้อ 🥺 ลองพิมพ์ใหม่อีกทีนะคะ';
        histories.set(userId, [...history, { role: 'user', content: userText },
          { role: 'assistant', content: reply }].slice(-HISTORY_LIMIT));
        return { text: reply, menu: shown.slice(0, 5) };
      }

      messages.push(msg);
      for (const call of msg.tool_calls) {
        let result;
        if (call.function.name === 'search_menu') {
          const found = searchMenu(JSON.parse(call.function.arguments || '{}'));
          shown = found;
          result = found.length
            ? JSON.stringify(found.map(f => ({ name: f.name, price: f.price, type: f.type })))
            : 'ไม่พบเมนูที่ตรงเงื่อนไข';
        } else {
          result = `ERROR: ไม่มี tool ชื่อ ${call.function.name}`;
        }
        messages.push({ role: 'tool', tool_call_id: call.id, content: result });
      }
    }
    return { text: 'ขอโทษค่า 🥺 FOODPICK คิดนานไปหน่อย ลองพิมพ์ใหม่อีกทีนะคะ', menu: shown.slice(0, 5) };
  }

  return { chat };
};
