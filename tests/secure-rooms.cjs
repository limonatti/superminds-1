const fs=require('node:fs'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const access=fs.readFileSync('sm-room-access.js','utf8');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
async function boot(page,{role='teacher',user=true,denied=false,readError=false,query='',content={}}={}){
  const channels=[],writes=[],errors=[];let rpcCalls=0;
  const sb={
    auth:{getSession:async()=>({data:{session:user?{user:{id:'user-1'}}:null}}),onAuthStateChange(){}},
    realtime:{setAuth:async()=>{}},
    rpc:async(name,args)=>{rpcCalls++;assert.equal(name,'open_lesson_room');return denied?{error:{message:'ROOM_ACCESS_DENIED'}}:{data:{room:'ROOM1',role,invite:role==='teacher'?'secret':null}};},
    channel(name,options){const ch={name,options,handlers:[],on(event,filter,fn){this.handlers.push(fn);return this;},subscribe(fn){fn('SUBSCRIBED');return this;},send(message){this.sent.push(message);},sent:[]};channels.push(ch);return ch;},
    from(name){assert.equal(name,'boards');return {
      select(){return {eq(){return {maybeSingle:async()=>readError?{error:{message:'offline'}}:{data:{data:content}}};}};},
      update(row){writes.push(row);return {eq(){return {select(){return {maybeSingle:async()=>({data:{room:'ROOM1'}})};}};}};}
    };},
    storage:{from(){return {createSignedUrl:async(path)=>({data:{signedUrl:'https://storage.test/'+path}})};}}
  };
  const vc=new VirtualConsole();vc.on('jsdomError',e=>{if(/Uncaught/.test(e.message))errors.push(e);});
  const dom=new JSDOM(fs.readFileSync(page,'utf8'),{url:'https://school.test/'+page+query,runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
    w.SM_UNITS=[];w.SM_COURSE_DATA={};w.SM_ready=Promise.resolve();w.supabase={createClient:()=>sb};
    w.alert=()=>{};w.prompt=()=>null;w.eval(access);
    w.JitsiMeetExternalAPI=function(){this.addListener=()=>{};this.executeCommand=()=>{};this.dispose=()=>{};};
  }});
  await tick();await tick();
  assert.deepEqual(errors,[]);
  return {dom,channels,writes,rpcCalls,sb};
}
(async()=>{
  let b=await boot('room.html',{user:false,query:'?room=ROOM1'});
  assert.equal(b.rpcCalls,0);assert.equal(b.channels.length,0);
  assert.match(b.dom.window.document.querySelector('#roomAccessGate a').href,/cabinet\.html\?next=/);b.dom.window.close();

  b=await boot('room.html',{denied:true,query:'?room=ROOM1'});
  assert.equal(b.channels.length,0);assert.match(b.dom.window.document.querySelector('#roomAccessGate').textContent,/нет доступа/);b.dom.window.close();

  b=await boot('room.html',{role:'student',query:'?room=ROOM1'});
  assert.equal(b.dom.window.document.getElementById('invite').style.display,'none','omitting s must not promote a pupil');
  assert(b.channels.every(c=>c.options.config.private===true));assert.equal(b.channels.length,2);
  const guard=b.dom.window.SMRoom.acceptLessonMessage;
  assert.equal(guard({t:'ctrl',h:'s',from:'t'},'s','t','t',false),null);
  assert.equal(guard({t:'state',course:'sm',unit:'1'},'s','t','t',false),null);
  assert.equal(guard({t:'outcomes',data:{kind:'audio'}},'s','t','t',true),null);
  assert.equal(guard({t:'ctrl',h:'t'},'s','t','s',false).h,'t');
  assert.equal(guard({t:'ask',from:'t'},'s','t','t',false).from,'s');
  assert.equal(guard({t:'state'},'t','s','t',true).from,'t');
  b.dom.window.close();

  b=await boot('room.html',{query:'?room=ROOM1&s=1'});
  assert.notEqual(b.dom.window.document.getElementById('invite').style.display,'none','owner role must come from server');
  const studentChannel=b.channels.find(c=>c.name.startsWith('lesson-student:'));
  studentChannel.handlers[0]({payload:{t:'ctrl',h:'s',from:'t'}});
  assert.match(b.dom.window.document.getElementById('whoTxt').textContent,/ведёшь ты/);
  studentChannel.handlers[0]({payload:{t:'vdom',d:'evil.test'}});
  assert(![...b.dom.window.document.scripts].some(s=>s.src.includes('evil.test')));b.dom.window.close();

  b=await boot('board.html',{readError:true,query:'?room=ROOM1'});
  assert.equal(b.channels.length,0);assert.equal(b.writes.length,0);
  assert(b.dom.window.document.getElementById('roomAccessGate'));b.dom.window.close();

  b=await boot('board.html',{query:'?room=ROOM1',content:{pages:[[{type:'card',id:'c1',x:0,y:0,en:'<img src=x onerror=alert(1)>',emoji:'<script>bad</script>'}]],page:0}});
  assert.equal(b.channels.length,1);assert.equal(b.channels[0].options.config.private,true);
  const card=b.dom.window.document.querySelector('.obj.card');assert(card);assert.equal(card.querySelector('img,script'),null);
  assert.match(card.textContent,/<img/);
  const before=b.dom.window.document.querySelectorAll('.obj').length;
  b.dom.window.dispatchEvent(new b.dom.window.MessageEvent('message',{origin:'https://evil.test',source:b.dom.window,data:{type:'sm-add-img',src:'https://evil.test/track'}}));
  assert.equal(b.dom.window.document.querySelectorAll('.obj').length,before);
  const url=await b.dom.window.SMRoom.imageUrl(b.sb,'https://kdzpmbuohfjbtjpqrdfx.supabase.co/storage/v1/object/public/board-images/ROOM1/pic.jpg');
  assert.equal(url,'https://storage.test/ROOM1/pic.jpg');
  assert.equal(await b.dom.window.SMRoom.imageUrl(b.sb,'javascript:alert(1)'),'');
  b.dom.window.close();
  console.log('Private rooms: login, denial, server roles, channel authorization, forged controls, failed reads, safe cards, message origins and legacy image URLs passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
