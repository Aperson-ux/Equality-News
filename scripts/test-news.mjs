import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {matchesStory,rankStories,readCounts,countRead} from '../public/news-core.js';

const stories=JSON.parse(await fs.readFile(new URL('../content/stories.json',import.meta.url),'utf8'));
const indexText=story=>[story.title,story.summary,story.lead,...story.keywords,...story.sections.flatMap(section=>[section.heading,...section.paragraphs])].join(' ');
const search=(query,category='All')=>stories.filter(story=>matchesStory(indexText(story),query,story.category,category)).map(story=>story.id);
assert.deepEqual(search('aliens'),['slammy-alien']);
assert.deepEqual(search('100 Robux'),['slammy-alien','slammy-100-robux']);
assert.deepEqual(search('BRI NETWORK','Networks'),['nyn-bri-network','jordan-nyn-claims']);
assert.deepEqual(search('Misha The Person'),['jordan-nyn-claims']);
assert.deepEqual(search('nyn','Slammy'),['slammy-alien']);
assert.deepEqual(search('not-a-real-topic'),[]);
assert.deepEqual(search('   '),stories.map(story=>story.id));
assert.equal(search('<script>alert(1)</script>').length,0);
assert.equal(rankStories(stories,{})[0].id,'slammy-alien');
assert.equal(rankStories(stories,{'slammy-100-robux':2,'slammy-alien':1})[0].id,'slammy-100-robux');
assert.equal(rankStories(stories,{'jordan-nyn-claims':-10})[0].id,'slammy-alien');

function storage(){const data=new Map();return {getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)};}
const local=storage(),session=storage();
assert.equal(countRead(local,session,'slammy-alien')['slammy-alien'],1);
assert.equal(countRead(local,session,'slammy-alien')['slammy-alien'],1,'Repeat page load inflated session read count');
assert.equal(countRead(local,storage(),'slammy-alien')['slammy-alien'],2);
local.setItem('bad','{broken');assert.deepEqual(readCounts(local,'bad'),{});
local.setItem('bad','{"ok-id":2,"bad":-1,"other":"9"}');assert.deepEqual(readCounts(local,'bad'),{'ok-id':2});
const blocked={getItem(){throw Error('Storage blocked')},setItem(){throw Error('Storage blocked')}};
assert.doesNotThrow(()=>countRead(blocked,blocked,'slammy-alien'));
assert.deepEqual(readCounts(blocked,'reads'),{});

const homepage=await fs.readFile(new URL('../dist/index.html',import.meta.url),'utf8');
assert.ok(homepage.includes('Popular stories'));
assert.ok(homepage.includes('role="search"'));
assert.equal((homepage.match(/data-story-card/g)||[]).length,stories.length);
for(const story of stories){
 const page=await fs.readFile(new URL('../dist/stories/'+story.id+'.html',import.meta.url),'utf8');
 assert.ok(page.includes('details class="article-disclosure"'),'Missing native Learn More article');
 assert.ok(page.includes('data-story="'+story.id+'"'));
 for(const related of story.related) assert.ok(page.includes(related+'.html'));
}
console.log('PASS: search across titles and article text, filters, no matches, safe query handling, honest ranking, storage persistence/failure, separate article routes, native Learn More, and related stories.');
