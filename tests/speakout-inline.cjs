const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');const c={window:{}};
for(const f of ['course-web','exercise-text','interactive','inline-data','inline'])vm.runInNewContext(fs.readFileSync(`speakout-a1-active-teach/assets/${f}.js`,'utf8'),c);
const {COURSE:D,SpeakoutInteractive:I,SpeakoutInline:N,SPEAKOUT_INLINE_DATA:data}=c.window;
const get=(b,n,id)=>{const p=D.books[b].pages.find(p=>p.page===n),e=p.exercises.find(e=>e.label===id);e.text||=c.window.SPEAKOUT_EXERCISE_TEXT[`${b}:${n}:${id}`]||'';return N.model(`${b}:${n}:${id}`,I.spec(e,D.keys[`${b}|${p.lesson}|${id}`]))};
assert.equal(get('sb',8,'2A').fields.length,3);assert.equal(get('sb',8,'2A').auto,true);
assert.deepEqual(Array.from(get('sb',8,'3A').fields,f=>f.id),['2','3','4','5','6','7','8','9']);assert.equal(get('sb',8,'3C').fields.length,3);assert.equal(get('sb',8,'3C').auto,false);
assert.equal(get('wb',4,'5A').fields.length,8);assert.equal(get('wb',4,'5A').auto,true);
assert.equal(get('wb',4,'2').fields[0].answer,'American');
assert.equal(get('sb',8,'1A'),null);assert.equal(get('wb',4,'3'),null);
for(const [b,p,e]of [['wb',10,'1A'],['wb',10,'3A'],['wb',56,'1B'],['sb',36,'6A'],['sb',56,'3A'],['sb',66,'1A'],['sb',66,'1C'],['sb',66,'2A'],['sb',69,'5B'],['sb',76,'4A'],['sb',48,'2A']])assert.equal(get(b,p,e).auto,true,`${b}:${p}:${e} grading`);
assert.equal(get('sb',66,'2A').fields[0].answer,'ont');assert.equal(get('sb',36,'6A').groups['5'].length,3);assert.equal(get('wb',56,'1B').groups['6'][1].answer,'u');
assert.equal(get('sb',69,'5B').groups['5'].length,2);assert.equal(get('wb',10,'1A').items.length,8);
let exercises=0,fields=0,automatic=0;const units={sb:new Set(),wb:new Set()};
for(const [b,book]of Object.entries(D.books))for(const p of book.pages)for(const e of p.exercises){const m=get(b,p.page,e.label);if(!m)continue;exercises++;fields+=m.fields.length;automatic+=+m.auto;if(/^[1-8]/.test(p.lesson))units[b].add(p.lesson[0]);assert.equal(new Set(m.fields.map(f=>f.id)).size,m.fields.length);for(const f of m.fields){const[x,y,w,h]=f.box;assert.ok([x,y,w,h].every(Number.isFinite));assert.ok(x>=0&&y>=0&&x+w<=596&&y+h<=843,`${b} ${p.page} ${e.label} out of page`);if(m.auto)assert.notEqual(f.answer,undefined)}
 for(let i=0;i<m.fields.length;i++)for(let j=i+1;j<m.fields.length;j++){const a=m.fields[i].box,bx=m.fields[j].box;const overlapX=Math.min(a[0]+a[2],bx[0]+bx[2])-Math.max(a[0],bx[0]),overlapY=Math.min(a[1]+a[3],bx[1]+bx[3])-Math.max(a[1],bx[1]);assert.ok(overlapX<Math.min(a[2],bx[2])*.5||overlapY<Math.min(a[3],bx[3])*.5,`Overlapping fields ${b}:${p.page}:${e.label} ${m.fields[i].id}/${m.fields[j].id}`)}
}
assert.equal(units.sb.size,8);assert.equal(units.wb.size,8);console.log({exercises,fields,automatic,units:'all 8 in both books'});
