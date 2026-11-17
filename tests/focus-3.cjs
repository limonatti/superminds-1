const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),base=path.join(root,'focus-3-active-teach');
const read=f=>JSON.parse(fs.readFileSync(path.join(base,f),'utf8').split('=').slice(1).join('=').trim().replace(/;$/,''));
const D=read('assets/course.js'),S=read('assets/exercise-sources.js'),G=read('assets/exercise-gaps.js'),M=require(path.join(base,'assets/marking.js')),H=require('../focus-3-homework.js'),H2=require('../focus-2-homework.js'),H1=require('../focus-homework.js');H.setData(D);global.Focus3Marking=M;
const pages=new Map(D.pages.map(p=>[p.id,p])),exercises=D.pages.flatMap(p=>p.exercises),E=new Map(exercises.map(e=>[e.id,e]));assert.equal(pages.size,351);assert.equal(E.size,exercises.length);
for(const p of D.pages){
 assert(fs.existsSync(path.join(base,p.image)),p.image);
 for(const e of p.exercises){
  assert(S[e.id]?.sources.length,e.id+' has original task');
  for(const box of [e.box,...S[e.id].sources.map(s=>s.box),...Object.values(G[e.id]||{}).map(g=>g.box)]){assert(box.every(Number.isFinite),e.id);assert(box[0]>=0&&box[1]>=0&&box[2]>0&&box[3]>0&&box[0]+box[2]<=1.001&&box[1]+box[3]<=1.001,e.id+' crop');}
  for(const src of S[e.id].sources)assert(fs.existsSync(path.join(base,src.image)),e.id+' context');
  assert.equal(new Set(e.answerSpec.map(f=>f.label)).size,e.answerSpec.length,e.id+' field labels');
  for(const f of e.answerSpec){assert(f.accepted.length&&f.accepted.every(x=>typeof x==='string'&&x.trim()));assert(!M.checkField('',f));assert(!M.checkField('wrong answer zxq',f));assert(f.accepted.every(v=>M.checkField(v,f)),e.id+' '+f.label);}
  if(G[e.id])assert.equal(Object.keys(G[e.id]).length,e.answerSpec.length,e.id+' gaps');
  if(e.interaction?.type==='choices')for(const [i,row] of e.interaction.rows.entries()){assert(row.options.some(o=>M.checkField(o.value,e.answerSpec[i])),e.id+' selectable correct option '+i);assert(row.options.some(o=>!M.checkField(o.value,e.answerSpec[i])),e.id+' distractor '+i);}
  if(e.interaction?.type==='bank')for(const f of e.answerSpec)assert(e.interaction.items.some(v=>M.checkField(v,f)),e.id+' bank '+f.label);
 }
}
for(let u=1;u<=8;u++){
 for(const b of ['sb','wb'])for(let p=4+(u-1)*14;p<4+u*14;p++)assert.equal(pages.get(b+'-'+p)?.unit,u,b+' unit '+u+' page '+p);
 for(const p of [u*2,u*2+1])assert.equal(pages.get('ws-'+p)?.unit,u);
 assert(D.videos.some(v=>v.unit===u),'videos in unit '+u);
}
for(const p of [15,29,43,57,71,85,99,113,134,135,136,137,138,139,140,141])assert.deepEqual(pages.get('wb-'+p).exercises.map(e=>e.label),['1','2','3','4'],'speaking tasks '+p);
assert(E.has('wb-111-7')&&E.has('wb-111-8'));assert.equal(E.get('wb-111-7').answerSpec.length,9);
assert.equal(D.resources.length,227);for(const r of D.resources){const file=path.join(base,r.path);assert(fs.existsSync(file),r.path);assert(fs.statSync(file).size<100*1024*1024,r.path+' GitHub size');}
assert.deepEqual(D.tracks.wb,['1.08','1.24','1.42','2.08','2.25','2.44','3.13','3.30']);for(const [i,p]of [7,21,35,49,63,77,91,105].entries())assert.deepEqual(pages.get('wb-'+p).tracks,[D.tracks.wb[i]]);
assert.equal(D.tracks.sb.length,140);assert.equal(D.tracks.ws.length,64);for(const b of ['sb','ws'])for(const t of D.tracks[b])assert(fs.existsSync(path.join(base,'media/'+b+'-'+t+'.mp3')));for(const p of D.pages)for(const t of p.tracks)assert([...D.tracks.sb,...D.tracks.ws].includes(t));
assert.equal(new Set(D.videos.map(v=>v.number)).size,D.videos.length);for(const v of D.videos){assert(/^[\w-]{11}$/.test(v.youtube));for(const p of v.pages)assert(pages.has('sb-'+p));}
// Independent samples from each unit, plus edge cases in the scanned answer key.
const samples={
 'sb-7-4':['F','T','T','T','F','T'],
 'sb-30-1':['referee','beat','letting','broke','trainer','go'],
 'ws-6-2':['didn’t use to like','turned up','started driving three hours ago','must have been very tired','pick me up','would always take'],
 'wb-46-1':['lemon','vegetable','cucumber','fruit','milk','drink','leek','fruit','pasta','meat'],
 'ws-10-2':['I will have finished','whose land was near','to become a science teacher','can’t have dropped recently','she cares about','which is in Norway'],
 'ws-12-2':['would not have been ill','Did you use to eat','might not have left','wish I were with','will have recovered by','in order to'],
 'ws-14-1':['B','C','C','D','C','D','A','D'],
 'ws-16-2':['was reported by','he had last seen his','enjoy ourselves','been arrested yet','must be lonely','had new security cameras'],
 'wb-6-4':['Does she really need',"don't know",'correct',"don't want","doesn't hate",'Do you see'],
 'wb-143-1':["hasn't cleaned",'orders','are you waiting',"have never lived",'Do you really enjoy'],
 'wb-131-1':['pain','feel dizzy','symptoms','eye drops','feel sick','fall','nosebleed','count sheep','insomnia','injured'],
 'wb-154-1':['think','am thinking','have','is having','look','are you looking','like','is having','need','Do they look'],
 'wb-160-6':['who',"haven't hurt","can't",'had','be playing','told','had gone','said','have been','you have been'],
 'wb-161-6':['who','led','were willing','The','by','were arrested','described','were employed','had changed','were given','granted','have gained'],
 'wb-100-4':['she was watching',"hadn't been",'the day before','we would meet',"couldn't be"]
};
for(const[id,values]of Object.entries(samples)){const e=E.get(id);assert.equal(e.answerSpec.length,values.length,id);values.forEach((v,i)=>assert(M.checkField(v,e.answerSpec[i]),id+' '+v));assert(!M.canReveal(e,{answerVersion:e.answerVersion,values}));assert(M.canReveal(e,{answerVersion:e.answerVersion,values,score:{correct:0,total:values.length}}));}
assert(M.checkField('was able to heal',E.get('wb-159-2').answerSpec[3]));assert(!M.checkField('was',E.get('wb-159-2').answerSpec[3]));
assert(M.checkField('finishes, will do',E.get('wb-157-4').answerSpec[3]));assert(!M.checkField('finishes',E.get('wb-157-4').answerSpec[3]));
assert.equal(E.get('wb-158-1').answerSpec.length,20);assert(M.checkField('Ø',E.get('wb-158-1').answerSpec[0]));
assert(M.checkText('no article',['Ø']));assert(!M.checkText('kind',E.get('sb-13-8').answerSpec.find(f=>f.label==='2').accepted));
assert(E.get('ws-2-1').interaction.rows.every(r=>r.options.map(o=>o.value).join('')==='ABCD'),'all four source choices, including unused distractor D');
const hw={id:'qa',course:'focus-3',note:H.makeNote(['sb-4-1','wb-6-4'],'2026-11-17','Practice'),status:'new'};assert.deepEqual(H.ids(hw),['sb-4-1','wb-6-4']);assert.equal(H1.ids(hw).length,0);assert.equal(H2.ids(hw).length,0);assert.throws(()=>H.snapshot(hw,{}));
const responses=Object.fromEntries(H.ids(hw).map(id=>{const e=E.get(id);return[id,{values:e.answerSpec.map(f=>f.accepted[0]),answerVersion:e.answerVersion,score:{correct:e.answerSpec.length,total:e.answerSpec.length}}]}));const shot=H.snapshot(hw,responses);responses['wb-6-4'].values[0]='changed';assert.equal(shot.exercises['wb-6-4'].values[0],'Does she really need');assert.match(H.renderAssignment({...hw,status:'submitted'},{'__homework:qa':shot}),/копия сданной работы/);
const oral=E.get('sb-5-6'),oralRecord={completed:true,answerVersion:oral.answerVersion,values:[]};assert.equal(H.readiness(oral.id,oralRecord),'');assert(H.readiness(oral.id,{...oralRecord,completed:false}));assert(H.readiness(oral.id,{...oralRecord,answerVersion:'old'}));const oralHW={id:'oral',course:'focus-3',note:H.makeNote([oral.id],'','')};assert(H.snapshot(oralHW,{[oral.id]:oralRecord}).exercises[oral.id].completed);assert.match(H.renderAnswer(oral.id,oralRecord),/отмечено выполненным/);
const classroom=fs.readFileSync(path.join(root,'teacher-class.html'),'utf8'),chips=classroom.slice(classroom.indexOf('function hwChips('),classroom.indexOf('/* Курсы с готовыми'));
const context={Focus3HW:H,Focus2HW:H2,FocusHW:H1,SolutionsHW:require('../solutions-homework.js'),SolutionsElHW:require('../solutions-el-homework.js'),SPK_L:{'focus-1':'Focus 1','focus-2':'Focus 2','focus-3':'Focus 3'},PART_L:{},parseNote:JSON.parse,esc:String};vm.createContext(context);vm.runInContext(chips,context);assert.match(context.hwChips([],[hw]),/Focus 3 · 2 упр/);
const dispatch=fs.readFileSync(path.join(root,'homework.html'),'utf8').match(/const bookHW=([^;]+);/)[1];for(const course of ['focus-1','focus-2','focus-3','solutions-el','solutions-int']){context.x={course};assert(vm.runInContext(dispatch,context).ids,'dispatch '+course);}
console.log('PASS Focus 3: '+E.size+' exercises; complete source pages, field/crop integrity, all units, source choices, media, marking samples, immutable submission and shared homework dispatch.');
