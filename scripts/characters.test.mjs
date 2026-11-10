import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateCharacters,embedCharacters} from './characters.mjs';
const character={id:'test',name:'テスト',reading:'てすと',system:'CoC',summary:'紹介',scenario:'',thumbnail:'assets/characters/'+'a'.repeat(64)+'.png',portrait:'',stats:{INT:15},skills:[{name:'図書館',value:70}]};
const doc=c=>({format:'shikazawa-public-characters-v1',updatedAt:'2026-11-11T00:00:00Z',characters:[c]});
test('public characters accept icon-only and no-image profiles',()=>{assert.equal(validateCharacters(doc(character)).characters.length,1);assert.equal(validateCharacters(doc({...character,thumbnail:''})).characters[0].portrait,'')});
test('private fields and external/private image URLs cannot enter the public build',()=>{for(const c of [{...character,privateNotes:'secret'},{...character,rawText:'secret'},{...character,artworks:[]},{...character,thumbnail:'/api/character-images?image=secret'},{...character,portrait:'https://example.test/secret.png'},{...character,stats:{PRIVATE:5}}])assert.throws(()=>validateCharacters(doc(c)));});
test('embedded character text cannot escape JSON script',()=>{const html=embedCharacters('<script id="character-data" type="application/json">{}</script>',doc({...character,summary:'</script><script>secret</script>'}));assert.equal((html.match(/<script/g)||[]).length,1);assert.ok(html.includes('\\u003c/script>'))});
test('duplicate IDs are rejected',()=>assert.throws(()=>validateCharacters({...doc(character),characters:[character,character]})));
