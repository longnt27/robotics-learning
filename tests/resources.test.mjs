import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const slugs=[...fs.readFileSync(path.join(root,'lib/papers.ts'),'utf8').matchAll(/\bslug:\s*"([^"]+)"/g)].map(x=>x[1]);
const resourceFile=path.join(root,'lib/paper-resources.json');
const ui=fs.readFileSync(path.join(root,'components/paper-reader.tsx'),'utf8');

test('every catalogued paper has verified project GitHub or Hugging Face resources',()=>{
  const resources=JSON.parse(fs.readFileSync(resourceFile,'utf8'));
  assert.equal(slugs.length,22);
  assert.deepEqual(Object.keys(resources).sort(),slugs.sort());
  for(const slug of slugs){
    const links=resources[slug];
    assert.ok(Array.isArray(links)&&links.length>0,`${slug}: missing source links`);
    assert.equal(new Set(links.map(x=>x.url)).size,links.length,`${slug}: duplicate URLs`);
    for(const resource of links){
      const url=new URL(resource.url);
      assert.equal(url.protocol,'https:');
      assert.ok(['github.com','huggingface.co'].includes(url.hostname),`${slug}: unsupported site`);
      assert.ok(url.pathname.split('/').filter(Boolean).length>=2,`${slug}: link must point to a specific repository`);
      assert.ok(!url.pathname.startsWith('/papers/'),`${slug}: HF paper page is not a code/model repo`);
      assert.ok(['github','huggingface'].includes(resource.platform));
      assert.ok(['official','community'].includes(resource.origin));
      assert.ok(['code','model','dataset','project'].includes(resource.kind));
      assert.ok(resource.note && resource.note.length>=10,`${slug}: explain what is available`);
      if(resource.platform==='github')assert.equal(url.hostname,'github.com');
      if(resource.platform==='huggingface')assert.equal(url.hostname,'huggingface.co');
      if(resource.origin==='community')assert.ok(/c\u1ed9ng \u0111\u1ed3ng|kh\u00f4ng ch\u00ednh th\u1ee9c/i.test(resource.note),`${slug}: non-official repo must be clearly labeled`);
    }
  }
});

test('repository links are visible in the paper reader including PDF tab',()=>{
  assert.match(ui,/paperResources\[paper\.slug\]/);
  assert.match(ui,/\.map\(\(resource/);
  assert.match(ui,/target="_blank"/);
  assert.match(ui,/rel="noopener noreferrer"/);
  assert.match(ui,/paper-resources/);
  assert.match(ui,/LIÊN KẾT<\/div><\/div>\s*<div className="paper-resources"/, 'Resource panel must not be nested in hero metadata');
});

test('avoid the previously broken FAST GitHub link',()=>{
  const res=JSON.parse(fs.readFileSync(resourceFile,'utf8'));
  assert.ok(res.fast.some(x=>x.url==='https://huggingface.co/physical-intelligence/fast'));
  assert.ok(!JSON.stringify(res.fast).includes('github.com/Physical-Intelligence/fast'));
});
