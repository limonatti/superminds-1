const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true});try{
const ctx=await b.newContext({viewport:{width:1280,height:960}}),state={hw:[],responses:{},fail:false,submitCalls:0,enrol:0};
await ctx.exposeBinding('api',async({page},method,args=[])=>{const teacher=/teacher-/.test(page.url());switch(method){
case'getUser':return{id:teacher?'teacher':'student',name:teacher?'Teacher':'Test Student'};
case'myProfile':return{role:teacher?'teacher':'student',teacher_id:'teacher'};
case'myStudents':return[{student_id:'student',name:'Test Student',data:{__coursework:{'solutions-int':structuredClone(state.responses)}}}];
case'ensureTeacherCode':return{code:'TEST'};
case'studentCourse':return'solutions-int';
case'addHW':state.hw.push({id:'hw-test',student_id:args[0],course:args[1],unit:args[2],note:args[3],status:'new',created_at:new Date().toISOString()});return{ok:true};
case'enrolCourse':state.enrol++;return{ok:true};
case'listHW':case'myHW':return structuredClone(state.hw);
case'loadCourseWork':return{ok:true,answers:structuredClone(state.responses)};
case'saveCourseWork':if(state.fail)return{ok:false};state.responses=structuredClone(args[1]);return{ok:true};
case'hwSubmit':assert(state.responses['__homework:hw-test']?.exercises);state.submitCalls++;state.hw[0].status='submitted';state.hw[0].submitted_at=new Date().toISOString();return{ok:true};
case'hwRework':state.hw[0].status='rework';state.hw[0].feedback=args[1];return{ok:true};
case'hwAccept':state.hw[0].status='done';return{ok:true};
case'saveHwAttempts':return{ok:true};
case'teacherUnread':return{};
default:return[];}});
await ctx.route('https://**',r=>r.abort());await ctx.route('**/sm-auth.js*',r=>r.fulfill({contentType:'application/javascript',body:'window.SM=new Proxy({},{get:(_,name)=>(...args)=>window.api(name,args)});window.SM_ready=Promise.resolve();'}));
await ctx.route('**/sm-shell.js*',r=>r.fulfill({contentType:'application/javascript',body:`window.SMUI={esc:s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),icon:()=>'',mount:()=>{},requireAuth:()=>SM.getUser()};`}));
await ctx.route('**/sm-pwa.js*',r=>r.fulfill({body:''}));
const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://127.0.0.1:8771/teacher-class.html');await p.locator('[data-sh-id]').first().waitFor();await p.locator('#hUnit').selectOption('3');await p.locator('[data-sh-page]').selectOption('32');await p.locator('[data-sh-id="sb-32-7"]').check();await p.locator('[data-sh-book]').selectOption('wb');await p.locator('[data-sh-page]').selectOption('32');await p.locator('[data-sh-id="wb-32-6"]').check();assert.match(await p.locator('[data-sh-selected]').innerText(),/Выбрано: 2/);await p.locator('#hMsg').fill('Practise both books');await p.locator('#hGo').click();await p.waitForFunction(()=>!!document.querySelector('.sh-assignment'));assert.equal(state.hw.length,1);assert.equal(state.enrol,0);assert.deepEqual(JSON.parse(state.hw[0].note).solutionsExercises,['sb-32-7','wb-32-6']);
await p.goto('http://127.0.0.1:8771/homework.html');await p.locator('a[href*="ex=sb-32-7"]').last().click();await p.waitForSelector('dialog[open]');assert.equal(await p.locator('#exerciseTitle').innerText(),'Упражнение 7');
for(const[i,v]of ['wrong','will be','start','could become','learn','may be'].entries())await p.locator('[data-answer]').nth(i).fill(v);await p.locator('#check').click();assert.match(await p.locator('#feedback').innerText(),/5 из 6/);await p.locator('#close').click();await p.locator('#submitHomework').click();assert.match(await p.locator('#homeworkStatus').innerText(),/Сначала/);assert.equal(state.submitCalls,0);
await p.locator('#assignment a[href*="ex=wb-32-6"]').click();await p.waitForSelector('dialog[open]');for(const[i,v]of ['F','T','F','F','T'].entries())await p.locator('[data-answer]').nth(i).selectOption(v);await p.locator('#reflection').fill('My explanation <script>');await p.locator('#check').click();await p.locator('#close').click();
state.fail=true;await p.locator('#submitHomework').click();await p.waitForFunction(()=>document.querySelector('#homeworkStatus').textContent.includes('не отправлена'));assert.equal(state.submitCalls,0);state.fail=false;await p.locator('#submitHomework').click();await p.waitForFunction(()=>document.querySelector('#homeworkStatus').textContent.includes('Работа отправлена'));assert.equal(state.submitCalls,1);
state.responses['sb-32-7'].values[0]='can'; // Later practice must not rewrite the handed-in answer.
await p.goto('http://127.0.0.1:8771/teacher-homework.html');await p.locator('.sh-ex').first().locator(':scope > summary').click();assert.match(await p.locator('.sh-ex').first().innerText(),/wrong/);assert.match(await p.locator('.sh-ex').first().innerText(),/Ошибка/);assert.match(await p.locator('.sh-report').innerText(),/копия сданной работы/);await p.locator('.sh-ex').nth(1).locator(':scope > summary').click();assert.match(await p.locator('.sh-ex').nth(1).innerText(),/My explanation <script>/);await p.locator('#fbText').fill('Correct question 1.');await p.locator('#btnBack').click();await p.waitForFunction(()=>document.querySelector('#pane').textContent.includes('Проверять пока нечего'));assert.equal(state.hw[0].status,'rework');
await p.goto('http://127.0.0.1:8771/solutions-int-active-teach/index.html?hw=hw-test&book=sb&page=32&ex=sb-32-7');await p.waitForSelector('dialog[open]');assert.match(await p.locator('#assignment').innerText(),/Correct question 1/);await p.locator('[data-answer]').first().fill('can');await p.locator('#check').click();await p.locator('#close').click();await p.locator('#submitHomework').click();await p.waitForFunction(()=>document.querySelector('#homeworkStatus').textContent.includes('Работа отправлена'));assert.equal(state.submitCalls,2);
await p.goto('http://127.0.0.1:8771/teacher-class.html');await p.locator('.sh-assignment>summary').click();await p.locator('.sh-assignment .sh-ex>summary').first().click();assert.match(await p.locator('.sh-assignment .sh-ex').first().innerText(),/6 из 6/);assert.match(await p.locator('.sh-assignment .sh-ex').first().innerText(),/Попытки автопроверки \(2\)/);await p.setViewportSize({width:390,height:844});await p.locator('.sh-assignment').scrollIntoViewIfNeeded();await p.screenshot({path:'/tmp/solutions-homework-mobile.png'});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
assert.deepEqual(errors,[]);console.log('PASS: teacher selection across SB/WB pages → exact student deep links → wrong and mixed answers → offline submission blocked → immutable submitted snapshot → teacher per-point errors → rework and resubmission → attempt history and mobile layout.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
