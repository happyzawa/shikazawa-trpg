import { readFile, writeFile } from 'node:fs/promises';

const ROOT = new URL('../', import.meta.url);
const list = value => Array.isArray(value) ? value : value ? JSON.parse(value) : [];
const nonempty = value => typeof value === 'string' ? value.trim() : '';
const safeUrl = value => {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || /(^|\.)(notion\.so|notion\.site|app\.notion\.com|iachara\.com)$/.test(url.hostname)) return '';
    for (const key of [...url.searchParams.keys()]) if (/^(utm_|srsltid|fbclid|gclid)/.test(key)) url.searchParams.delete(key);
    return url.href;
  } catch { return ''; }
};

export function publicScenario(row, today) {
  const title = nonempty(row['名前']);
  const systems = list(row['システム']);
  if (!title || systems.length === 1 && systems[0] === 'ボドゲ') return null;
  const status = list(row['既知/未知']);
  const roles = list(row['通過時HO/役職']);
  const tags = list(row['個人的感想タグ']);
  const isPlayer = roles.some(role => /^(HO\d+|PC|犯人|探偵|狂人)$/.test(role));
  const date = nonempty(row['date:通過日:end']) || nonempty(row['date:通過日:start']);
  const future = Boolean(date && date.slice(0, 10) > today);
  const planned = status.includes('通過予定') || future;
  const conflict = status.includes('未知') && (status.includes('既知') || isPlayer && !planned);
  let knowledge = 'unconfirmed';
  if (conflict) knowledge = 'unconfirmed';
  else if (planned) knowledge = 'planned';
  else if (status.includes('既知') && isPlayer) knowledge = 'played';
  else if (status.includes('既知')) knowledge = 'known';
  else if (status.includes('知ってるんだろうなぁ……')) knowledge = 'uncertain';
  else if (status.includes('未知')) knowledge = 'unknown';
  const canRun = tags.includes('部屋があるのですぐ回せます') && !tags.includes('回さない');
  // Explicit allowlist: never spread a private row into a public record.
  return { title, systems, formats: list(row['形式']), reading: nonempty(row['読み仮名・略称']), knowledge, canRun, owned: row['所持状況'] === '所持', url: safeUrl(row['userDefined:URL']) };
}

export function documentHtml(template, data) {
  const json = JSON.stringify(data).replaceAll('<', '\\u003c').replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029');
  return template.replace(/(<script id="scenario-data" type="application\/json">)[\s\S]*?(<\/script>)/, (_, start, end) => start + json + end);
}

if (process.argv[1] && new URL(process.argv[1], 'file:').href === import.meta.url) {
  const [sourcePath, date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(new Date())] = process.argv.slice(2);
  const current = JSON.parse(await readFile(new URL('data/scenarios.json', ROOT), 'utf8'));
  const data = sourcePath ? {
    owner: 'しかざわ', updatedAt: date,
    scenarios: JSON.parse(await readFile(sourcePath, 'utf8')).map(row => publicScenario(row, date)).filter(Boolean)
      .sort((a, b) => (a.reading || a.title).localeCompare(b.reading || b.title, 'ja'))
  } : current;
  const overrides = JSON.parse(await readFile(new URL('data/overrides.json', ROOT), 'utf8'));
  for (const entry of data.scenarios) {
    const override = overrides[entry.title];
    if (!override) continue;
    if (['played', 'known', 'planned', 'unknown', 'uncertain', 'unconfirmed'].includes(override.knowledge)) entry.knowledge = override.knowledge;
    if (typeof override.canRun === 'boolean') entry.canRun = override.canRun;
  }
  await writeFile(new URL('data/scenarios.json', ROOT), JSON.stringify(data, null, 2) + '\n');
  const template = await readFile(new URL('index.html', ROOT), 'utf8');
  await writeFile(new URL('index.html', ROOT), documentHtml(template, data));
  console.log(`Built ${data.scenarios.length} public scenarios.`);
}
