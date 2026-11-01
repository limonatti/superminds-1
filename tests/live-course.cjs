const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function client(role){
 const sent=[],listeners={},applied=[];let poll,view={book:'sb',page:8,exercise:'1A'},answer={exercise:'1A',items:[{label:'2',text:'is'}]};
 const parent={postMessage:d=>sent.push(d)},window={addEventListener:(n,f)=>listeners[n]=f};
 const ctx={window,parent,URLSearchParams,location:{origin:'https://school.test',search:'?embedded=1&lessonRole='+role},document:{createElement:()=>({style:{}})},setInterval:f=>(poll=f,1),clearInterval:()=>{}};
 vm.runInNewContext(fs.readFileSync('sm-live-course.js','utf8'),ctx);
 window.LiveCourse.connect({course:'speakout-a1',view:()=>view,host:()=>null,answer:()=>answer,apply:v=>{applied.push(v);view=v}});
 return {sent,applied,poll:()=>poll(),edit:()=>answer.items[0].text='are',receive(data,origin='https://school.test',source=parent){listeners.message({origin,source,data:{type:'outcomes-lesson',...data}})}};
}
const teacher=client('t'),student=client('s');assert.equal(teacher.sent[0].kind,'ready');assert.equal(teacher.sent[1].kind,'view');assert.equal(student.sent[1].items[0].text,'is');
const count=student.sent.length;student.poll();assert.equal(student.sent.length,count);student.edit();student.poll();assert.equal(student.sent.at(-1).items[0].text,'are');
student.receive({kind:'view',book:'wb',page:4,exercise:'2'});assert.equal(student.applied.length,1);student.receive({kind:'view',book:'wb',page:4,exercise:'2'});assert.equal(student.applied.length,1);
student.receive({kind:'view',book:'sb',page:9,exercise:'3'},'https://evil.test');student.receive({kind:'view',book:'sb',page:9,exercise:'3'},'https://school.test',{});assert.equal(student.applied.length,1);
student.receive({kind:'snapshot'});assert.equal(student.sent.at(-1).book,'wb');teacher.receive({kind:'view',book:'wb',page:4,exercise:'2'});assert.equal(teacher.applied.length,0);
console.log('Live adapter: initial handshake, typing, unchanged-answer suppression, navigation, replay, role/origin/source guards passed.');
