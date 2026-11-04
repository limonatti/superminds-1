const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {candidates,shuffle,sourceLetters}=require('../exercise-play.js'),root=path.resolve(__dirname,'..');
const fields=[{id:'1',answers:['Are']},{id:'2',answers:["'m"]},{id:'3',answers:['am']}];
assert.deepEqual(sourceLetters('Match 1–4 with A–F.'),['a','b','c','d','e','f']);assert.deepEqual(sourceLetters('She is a doctor.'),[]);
const choices=candidates(fields[0],fields,'');assert.deepEqual(choices,[]);assert.deepEqual(candidates({options:['a','b'],answers:['a']},fields,''),[{value:'a',label:'a'},{value:'b',label:'b'}]);assert.deepEqual(shuffle(['x','y'],'a'),shuffle(['x','y'],'a'));assert.equal(fields[0].answers[0],'Are');
const read=p=>{const s=fs.readFileSync(path.join(root,p),'utf8');return JSON.parse(s.slice(s.indexOf('=')+1).replace(/;\s*$/,''))};
let gaps=0;
for(const c of ['focus-1','speakout-b1','speakout-b1plus','solutions-int','outcomes-beginner','speakout-b2plus'])for(const model of Object.values(read(c+'-active-teach/assets/exercise-gaps.js')))for(const g of Object.values(model)){const[x,y,w,h]=g.box;assert(x>=0&&y>=0&&w>0&&h>0&&x+w<=1&&y+h<=1);if(!process.argv.includes('--models-only'))assert(fs.existsSync(path.join(root,c+'-active-teach',g.image)));gaps++}
console.log('PASS source-only choices, stable order, unchanged keys and',gaps,'printed gap bounds; media checks',process.argv.includes('--models-only')?'skipped (sparse checkout)':'passed');
if(process.argv.includes('--browser'))(async()=>{
 const {chromium}=require(process.env.PLAYWRIGHT_MODULE||require.resolve('playwright',{paths:[root,path.join(require('node:os').homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node')]}));
 const browser=await chromium.launch({channel:'chrome',headless:true}),base=process.env.EXERCISE_TEST_BASE||'http://127.0.0.1:8768';
 try{const p=await browser.newPage({viewport:{width:1280,height:900}});
 await p.route('https://**',r=>r.abort());
 await p.goto(base+'/speakout-a1-active-teach/index.html?book=sb&page=8');const open=()=>p.locator('#exerciseNav button').filter({hasText:/^2A/}).click();await open();
 assert.equal(await p.locator('.play-word').count(),0,'formation task must not suggest keys');
 for(const [i,value] of ['Are',"'m",'am'].entries()){await p.locator(`.play-slot[data-field="${i}"]`).first().click();await p.locator('.play-manual input').fill(value)}
 await p.locator('.play-check').click();assert.match(await p.locator('.play-feedback').innerText(),/3 из 3/);await p.reload();await open();assert.equal(await p.locator('[data-inline="3"]').inputValue(),'am');
 const cases=[['focus-1',14,'[data-ex]'],['solutions-int',4,'[data-ex]'],['solutions-el',4,'[data-ex]'],['outcomes-beginner',12,'[data-exercise]'],['speakout-b1',6,'#exerciseNav button'],['speakout-b1plus',9,'#exerciseNav button'],['speakout-b2plus',9,'.spot.book-exercise']];
 for(const [c,page,selector]of cases){await p.setViewportSize({width:1280,height:900});await p.goto(`${base}/${c}-active-teach/index.html?book=sb&page=${page}`);await p.locator(selector).first().click();assert(await p.locator('dialog[open] .coursework-save').isVisible(),c);await p.setViewportSize({width:390,height:844});assert(await p.locator('dialog[open]').evaluate(d=>d.scrollWidth<=d.clientWidth+1),c+' overflow');}
 console.log('PASS typed formation, persistence, eight course dialogs and responsive widths');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
