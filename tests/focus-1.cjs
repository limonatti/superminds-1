const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),base=path.join(root,'focus-1-active-teach');
const read=f=>JSON.parse(fs.readFileSync(path.join(base,f),'utf8').split('=').slice(1).join('=').trim().replace(/;$/,''));
const D=read('assets/course.js'),S=read('assets/exercise-sources.js'),M=require(path.join(base,'assets/marking.js')),H=require(path.join(root,'focus-homework.js'));H.setData(D);global.FocusMarking=M;
const pages=new Map(D.pages.map(p=>[p.id,p])),ids=new Set();assert.equal(pages.size,D.pages.length);
assert.equal(D.pages.filter(p=>p.book==='sb').length,142);assert.equal(D.pages.filter(p=>p.book==='wb').length,144);assert.equal(D.pages.filter(p=>p.book==='ws').length,17);
for(const p of D.pages){assert(fs.existsSync(path.join(base,p.image)));for(const e of p.exercises){assert(!ids.has(e.id));ids.add(e.id);for(const box of [e.box,...S[e.id].sources.map(s=>s.box)]){assert(box.every(Number.isFinite),e.id);assert(box[0]>=0&&box[1]>=0&&box[2]>0&&box[3]>0&&box[0]+box[2]<=1.001&&box[1]+box[3]<=1.001,e.id)}assert.equal(new Set(e.answerSpec.map(f=>f.label)).size,e.answerSpec.length);for(const f of e.answerSpec){assert(f.accepted.length&&f.accepted.every(x=>typeof x==='string'&&x.trim()));assert(!M.checkField('',f));assert(!M.checkField('wrong test answer zxq',f));}}}
for(const r of D.resources)assert(fs.existsSync(path.join(base,r.path)),r.path);for(const t of D.tracks.sb)assert(fs.existsSync(path.join(base,'media/sb-'+t+'.mp3')));
const ex=id=>D.pages.flatMap(p=>p.exercises).find(e=>e.id===id);
assert.deepEqual(ex('sb-22-5').answerSpec.map(f=>f.accepted[0]),['C','C','A','A','B']);
assert.deepEqual(ex('wb-12-1').answerSpec.map(f=>f.accepted[0]),['play','listen','watch','read','read','go','have','listen']);
assert.deepEqual(ex('wb-54-4').answerSpec.map(f=>f.accepted[0]),['have to wear','don’t have to get up','have to stay','has to stay','has to get','doesn’t have to do','has to do']);
assert.equal(pages.get('wb-20').pdfPage,25);assert.equal(pages.get('ws-17').pdfPage,4);
assert(M.checkField('does not play',ex('sb-14-3').answerSpec.find(f=>f.label==='3')));
const note=H.makeNote(['wb-12-1'],'2026-11-10','Practice');const hw={id:'test',course:'focus-1',note,status:'new'};assert.deepEqual(H.ids(hw),['wb-12-1']);assert.equal(H.ids({...hw,course:'solutions-int'}).length,0);assert.throws(()=>H.snapshot(hw,{}));
const e=ex('wb-12-1'),r={values:e.answerSpec.map(f=>f.accepted[0]),answerVersion:e.answerVersion,score:{correct:8,total:8}};const answers={[e.id]:r},shot=H.snapshot(hw,answers);r.values[0]='changed';assert.equal(shot.exercises[e.id].values[0],'play');
console.log('PASS: source files, printed-page mapping, unique exercise IDs, geometry, reviewed answer samples, grading and homework snapshots.');
