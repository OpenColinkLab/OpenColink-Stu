export const templates=[
 {name:'打工日常',caption:'今天也在努力',prompt:'打工人的日常：累了、收到、下班、假装努力，幽默夸张又可爱'},
 {name:'礼貌发疯',caption:'我很好',prompt:'礼貌外表下快要崩溃的反差感，强颜欢笑、无语、震惊、放空'},
 {name:'高情商回复',caption:'收到',prompt:'聊天回应：收到、好的、谢谢、赞同，表情有戏又不失礼貌'},
 {name:'理直气壮',caption:'不可以',prompt:'傲娇、自信、拒绝、不服气，夸张肢体语言，带一点欠揍的幽默'},
 {name:'快乐加倍',caption:'好耶',prompt:'开心欢呼、比心、庆祝、感动，明快可爱且有感染力'},
 {name:'电量不足',caption:'先躺为敬',prompt:'困倦、疲惫、躺平、睡觉，慵懒软糯且有共鸣'}
];
export function gridRects(count,width,height){
 if(![1,4,9].includes(count)||!Number.isInteger(width)||!Number.isInteger(height)||Math.min(width,height)<Math.sqrt(count))throw Error('无效的网格尺寸。');
 const n=Math.sqrt(count);return Array.from({length:count},(_,i)=>{const x=Math.floor(i%n*width/n),y=Math.floor(Math.floor(i/n)*height/n);return{x,y,width:Math.floor((i%n+1)*width/n)-x,height:Math.floor((Math.floor(i/n)+1)*height/n)-y};});
}
export function buildPrompt({count,direction,refs,transparent}){
 if(![1,4,9].includes(count)||!direction.trim())throw Error('请写下想做的表情。');
 if(refs.length>16)throw Error('最多 16 张参考图。');
 for(const ref of refs)if(ref.scope!=='all'&&(!Number.isInteger(Number(ref.scope))||Number(ref.scope)<1||Number(ref.scope)>count))throw Error(`图${ref.id}指定的第 ${ref.scope} 张超出当前数量，请修改作用范围。`);
 for(const match of direction.matchAll(/@?图\s*(\d+)/g))if(!refs.some(r=>r.id===Number(match[1])))throw Error(`图${match[1]}不存在，请修改描述。`);
 const n=Math.sqrt(count);
 return `Create ONE finished chat sticker sheet. Exactly ${n} rows and ${n} columns, ${count} equal square cells, edge-to-edge layout, no gutters, no grid lines. Every cell contains one complete sticker with 12% safe padding, no content crossing cell boundaries. Consistent recognizable character across cells, distinct expressive gestures. ${transparent?'Real transparent alpha background, never a painted checkerboard.':'Clean light solid background.'} No text, letters, captions or watermarks; captions are added later by the app. Each sticker readable at 240 pixels. Creative direction: ${direction}\nReference images in the exact attached order:\n${refs.map((r,i)=>`Attached image ${i+1} = 图${r.id}; role: ${r.role}; scope: ${r.scope==='all'?'all cells':`cell ${r.scope} in reading order`}; use instructions: ${r.note||'Only use the assigned role; ignore unrelated content.'}`).join('\n')}`;
}
export const profiles={wechat:{name:'微信',side:240,maxBytes:500*1024},qq:{name:'QQ',side:320,maxBytes:1024*1024}};
export function friendlyError(error){const message=error?.message||String(error);if(/Exhausted balance|User is locked/.test(message)&&/provider|fal\.ai/i.test(message))return 'H3 上游供应商余额不足，视频未生成。不是你的个人余额不足，请等待 Cohub 修复供应商路由。';return message;}
