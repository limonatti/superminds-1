const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('room.html','utf8');
const adapter=source.slice(source.indexOf('    // Semantic Outcomes'),source.indexOf('    // синхронизация панели'));
function room(role){
 const sent=[],posted=[],frame={postMessage:d=>posted.push(d)};let listener;
 const ctx={LIVE_COURSES:{'outcomes-beginner':{},'solutions-int':{},'speakout-a1':{}},ME:role,course:'outcomes-beginner',online:true,unit:"1",kind:"trainer",send:()=>{},location:{origin:'https://school.test'},document:{getElementById:()=>({contentWindow:frame})},window:{addEventListener:(_,fn)=>listener=fn},sendOp:p=>sent.push(p)};
 vm.createContext(ctx);vm.runInContext(adapter,ctx);
 return {sent,posted,ctx,frame,message(data,origin='https://school.test',sender=frame){listener({origin,source:sender,data:{type:'outcomes-lesson',...data}})}};
}
const t=room('t'),s=room('s'),view={kind:'view',book:'wb',page:5,exercise:'wb-test'};
t.message(view);assert.equal(t.sent.length,1);s.ctx.receiveOutcomes(t.sent[0]);assert.equal(s.posted[0].exercise,'wb-test');
const answer={kind:'answers',exercise:'wb-test',values:['she'],checked:false};s.message(answer);t.ctx.receiveOutcomes(s.sent[0]);assert.deepEqual(t.posted[0].values,['she']);
// Only the intended role, same-origin lesson frame can send an operation.
t.message(answer);s.message(view);t.message(view,'https://other.test');t.message(view,'https://school.test',{});assert.equal(t.sent.length,1);assert.equal(s.sent.length,1);
// A late-loading / reloaded frame receives the current exercise and answers.
s.message({kind:'ready'});assert.equal(s.posted.at(-1).exercise,'wb-test');assert.equal(s.sent.at(-1).t,'hello');
t.message({kind:'ready'});assert.deepEqual(t.posted.at(-1).values,['she']);
// Reconnect sends current teacher view and asks student to resend own answers.
t.ctx.replayOutcomes();assert.equal(t.sent.at(-1).data.kind,'view');s.ctx.replayOutcomes();assert.equal(s.posted.at(-1).kind,'snapshot');
// Other courses do not receive Outcomes events.
s.ctx.course='sm';const n=s.posted.length;s.ctx.receiveOutcomes(t.sent[0]);assert.equal(s.posted.length,n);
console.log('Outcomes live: navigation, answer transport, role/origin/frame guards, late join and reconnect passed.');

for(const course of ['solutions-int','speakout-a1']){const teacher=room('t'),student=room('s');teacher.ctx.course=student.ctx.course=course;teacher.message(view);student.ctx.receiveOutcomes(teacher.sent[0]);assert.equal(student.posted[0].exercise,'wb-test');student.message(answer);teacher.ctx.receiveOutcomes(student.sent[0]);assert.deepEqual(teacher.posted[0].values,['she']);const before=student.posted.length;student.ctx.receiveOutcomes({...teacher.sent[0],course:'outcomes-beginner'});assert.equal(student.posted.length,before);}console.log('Solutions and Speakout: transport and cross-course isolation passed.');

for(const course of ['outcomes-beginner','solutions-int','speakout-a1']){const t=room('t'),s=room('s');t.ctx.course=s.ctx.course=course;const audio={kind:'audio',src:'test.mp3',time:12,paused:false};t.message(audio);s.ctx.receiveOutcomes(t.sent[0]);assert.equal(s.posted.at(-1).time,12);s.message({kind:'audio-ready'});assert.equal(s.posted.at(-1).kind,'audio');const n=s.sent.length;s.message(audio);assert.equal(s.sent.length,n);t.ctx.replayOutcomes();assert.equal(t.sent.at(-1).data.kind,'audio');}console.log('Audio room transport: teacher authority and reconnect replay in all courses passed.');
