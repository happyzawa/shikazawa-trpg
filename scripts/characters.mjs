const fields=['id','name','reading','system','summary','scenario','thumbnail','portrait','stats','skills'];
const stats=new Set(['STR','CON','POW','DEX','APP','SIZ','INT','EDU','HP','MP','SAN','IDE','幸運','知識']);
export function validateCharacters(data){
 if(!data||data.format!=='shikazawa-public-characters-v1'||!Array.isArray(data.characters)||data.characters.length>1000||Object.keys(data).some(k=>!['format','updatedAt','characters'].includes(k)))throw Error('公開用の探索者JSONを指定してください。');
 const ids=new Set();for(const c of data.characters){
  if(!c||Object.keys(c).some(k=>!fields.includes(k))||typeof c.id!=='string'||!/^[a-zA-Z0-9-]{1,200}$/.test(c.id)||ids.has(c.id)||typeof c.name!=='string'||!c.name.trim())throw Error('探索者の公開項目・ID・名前を確認してください。');ids.add(c.id);
  for(const key of ['reading','system','summary','scenario','thumbnail','portrait'])if(typeof c[key]!=='string')throw Error('公開用の文字列を確認してください。');
  for(const key of ['thumbnail','portrait'])if(c[key]&&!/^assets\/characters\/[a-f0-9]{64}\.(png|jpg|webp|gif)$/.test(c[key]))throw Error('公開画像はGitHubのassets/characters/配下に保存してください。');
  if(!c.stats||typeof c.stats!=='object'||Array.isArray(c.stats)||Object.entries(c.stats).some(([k,v])=>!stats.has(k)||!Number.isFinite(v)))throw Error('公開能力値を確認してください。');
  if(!Array.isArray(c.skills)||c.skills.some(s=>!s||Object.keys(s).some(k=>!['name','value'].includes(k))||typeof s.name!=='string'||!Number.isFinite(s.value)))throw Error('公開技能を確認してください。');
 }
 if(data.updatedAt&&(!Number.isFinite(Date.parse(data.updatedAt))||typeof data.updatedAt!=='string'))throw Error('探索者の更新日時を確認してください。');return data;
}
export function embedCharacters(html,data){validateCharacters(data);const json=JSON.stringify(data).replaceAll('<','\\u003c').replaceAll('\u2028','\\u2028').replaceAll('\u2029','\\u2029');if(!html.includes('id="character-data"'))throw Error('探索者の埋め込み先がありません。');return html.replace(/(<script id="character-data" type="application\/json">)[\s\S]*?(<\/script>)/,(_,a,b)=>a+json+b);}
