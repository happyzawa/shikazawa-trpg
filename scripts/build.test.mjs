import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publicScenario, documentHtml } from './build.mjs';
const day = '2026-11-09';
const row = values => ({ 名前: 'テスト', システム: '["CoC"]', ...values });
test('known content and ownership do not imply played or runnable', () => {
  const result = publicScenario(row({ '既知/未知': '["既知"]', 所持状況: '所持', 'KP回数(CoC)': 3, 個人的感想タグ: '["回したい"]' }), day);
  assert.equal(result.knowledge, 'known'); assert.equal(result.canRun, false);
});
test('PL evidence plus known status is played; future or planned is not played', () => {
  const source = row({ '既知/未知': '["既知"]', '通過時HO/役職': '["HO1"]' });
  assert.equal(publicScenario(source, day).knowledge, 'played');
  assert.equal(publicScenario({ ...source, 'date:通過日:end': '2026-11-10' }, day).knowledge, 'planned');
  assert.equal(publicScenario({ ...source, '既知/未知': '["既知","通過予定"]' }, day).knowledge, 'planned');
});
test('contradictory or ambiguous records remain unconfirmed or uncertain', () => {
  assert.equal(publicScenario(row({ '既知/未知': '["未知"]', '通過時HO/役職': '["PC"]' }), day).knowledge, 'unconfirmed');
  assert.equal(publicScenario(row({ '既知/未知': '["知ってるんだろうなぁ……"]' }), day).knowledge, 'uncertain');
});
test('explicit room-ready tag allows running; do-not-run wins', () => {
  assert.equal(publicScenario(row({ 個人的感想タグ: '["部屋があるのですぐ回せます"]' }), day).canRun, true);
  assert.equal(publicScenario(row({ 個人的感想タグ: '["部屋があるのですぐ回せます","回さない"]' }), day).canRun, false);
});
test('public allowlist removes private properties and internal links', () => {
  const result = publicScenario(row({ 自由メモ: '秘密', '通過時HO/役職': '["犯人"]', 個人的感想タグ: '["秘密タグ"]', 'userDefined:URL': 'https://example.notion.site/private' }), day);
  assert.deepEqual(Object.keys(result).sort(), ['title', 'systems', 'formats', 'reading', 'knowledge', 'canRun', 'url'].sort());
  assert.ok(!JSON.stringify(result).includes('秘密')); assert.equal(result.url, '');
  assert.equal(publicScenario(row({ 'userDefined:URL': 'javascript:alert(1)' }), day).url, '');
});
test('blank and board-game-only records are excluded', () => {
  assert.equal(publicScenario(row({ 名前: '' }), day), null);
  assert.equal(publicScenario(row({ システム: '["ボドゲ"]' }), day), null);
});
test('embedded data cannot terminate its script element', () => {
  const html = documentHtml('<script id="scenario-data" type="application/json">{}</script>', { title: '</script><script>alert(1)</script>' });
  assert.equal((html.match(/<script/g) || []).length, 1);
  assert.ok(html.includes('\\u003c/script>'));
});
