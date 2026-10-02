'use strict';
/* ===== Data & helpers ===== */
const $=s=>document.querySelector(s),KEY='jeeDash1';
const SUB={Physics:['Units & Measurements','Motion in a Straight Line','Motion in a Plane','Laws of Motion','Work, Energy & Power','Rotational Motion','Gravitation','Properties of Solids & Fluids','Thermodynamics','Oscillations & Waves'],
Chemistry:['Some Basic Concepts of Chemistry','Structure of Atom','Periodicity','Chemical Bonding','Thermodynamics','Equilibrium','Redox Reactions','GOC','Hydrocarbons'],
Mathematics:['Sets','Relations & Functions','Trigonometry','Complex Numbers','Quadratic Equations','Permutations & Combinations','Binomial Theorem','Sequence & Series','Straight Lines','Conic Sections','Limits & Derivatives','Probability']};
const SC={Physics:'#6366f1',Chemistry:'#10b981',Mathematics:'#f59e0b'},SJ=[...Object.keys(SUB),'English','Other'];
const DEF={plan:[],goals:[],log:[],ch:{},pyq:[],notes:[],exams:[],revs:[],set:{theme:'dark',target:6,timer:25,notify:true}};
let S;try{S=Object.assign({},DEF,JSON.parse(localStorage.getItem(KEY)))}catch(e){S={...DEF}}
S.set=Object.assign({},DEF.set,S.set);
const save=()=>localStorage.setItem(KEY,JSON.stringify(S));
const td=(d=new Date())=>d.toLocaleDateString('en-CA');
const ad=(s,n)=>{const d=new Date(s+'T00:00');d.setDate(d.getDate()+n);return td(d)};
const dd=s=>Math.round((new Date(s+'T00:00')-new Date(td()+'T00:00'))/864e5);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,9),val=i=>$('#'+i).value.trim();
const tm=t=>{const[h,m]=t.split(':');return h*60+ +m},dur=p=>Math.max(0,tm(p.end)-tm(p.start));
const f12=t=>{let[h,m]=t.split(':');const a=h>=12?'PM':'AM';return(h%12||12)+':'+m+' '+a};
const mins=d=>S.log.filter(l=>l.d==d).reduce((a,l)=>a+l.m,0),hrs=m=>(m/60).toFixed(1);
const toast=(m,t='')=>{const e=document.createElement('div');e.className='toast '+t;e.textContent=m;$('#toasts').append(e);setTimeout(()=>e.remove(),4500)};
const cp=(s,i)=>Math.round((S.ch[s+'|'+i]||[0,0,0,0,0]).reduce((x,y)=>x+ +y,0)/5);
const sp=s=>Math.round(SUB[s].reduce((a,_,i)=>a+cp(s,i),0)/SUB[s].length),op=()=>Math.round(Object.keys(SUB).reduce((a,s)=>a+sp(s),0)/3);
const streak=()=>{const ds=new Set(S.log.map(l=>l.d));let d=td(),n=0;if(!ds.has(d))d=ad(d,-1);while(ds.has(d)){n++;d=ad(d,-1)}return n};
const dueRevs=()=>S.revs.filter(r=>!r.done&&r.date<=td());
const acc=a=>{const c=a.reduce((x,q)=>x+q.ok,0),w=a.reduce((x,q)=>x+q.no,0);return c+w?Math.round(c/(c+w)*100):0};
const SEL=(a,v)=>a.map(x=>`<option ${x==v?'selected':''}>${x}</option>`).join('');
const inp=(i,l,t='text',v='',o)=>`<label>${l}${o?`<select id=${i}>${SEL(o,v)}</select>`:`<input id=${i} type=${t} value="${esc(v)}" ${t=='text'?'list=chs':''}>`}</label>`;
const ring=(p,c='var(--ac)')=>`<div class=ring style="--p:${p};--c:${c}"><b>${p}%</b></div>`;
const bar=(p,c='var(--ac)')=>`<div class=bar><i style="width:${p}%;background:${c}"></i></div>`;
const empty=(i,t)=>`<div class=empty><span>${i}</span>${t}</div>`;
const bars=(a,u='h')=>{const m=Math.max(...a.map(x=>x.v),.1);return`<div class=chart>${a.map(x=>`<div class=col><em>${x.v}${u}</em><i style="height:${x.v/m*85}%;background:${x.c||'var(--ac)'}"></i><span>${x.l}</span></div>`).join('')}</div>`};
$('#chs').innerHTML=Object.values(SUB).flat().map(c=>`<option value="${esc(c)}">`).join('');
const del=(k,i)=>{S[k]=S[k].filter(x=>x.id!=i);save();R()};
const days7=()=>[...Array(7)].map((_,i)=>ad(td(),i-6));

/* ===== Planner / Tasks ===== */
let pd=td(),tf='All';
const item=(p,showDate)=>`<div class=tl style="--c:${SC[p.subj]||'#94a3b8'}"><div class=tt>${f12(p.start)}<br>${f12(p.end)}</div><div class=tb><b>${esc(p.subj)}</b> · ${esc(p.ch)} ${showDate?`<small>(${p.date})</small>`:''}<p>${esc(p.task)}</p><span class="pill ${p.pri}">${p.pri}</span> <select onchange="setSt('${p.id}',this.value)">${SEL(['Pending','In Progress','Completed'],p.st)}</select> <button class=x onclick="del('plan','${p.id}')">🗑</button></div></div>`;
const setSt=(i,v)=>{const p=S.plan.find(x=>x.id==i);p.st=v;if(v=='Completed'&&!p.lg){S.log.push({d:p.date,m:dur(p)||25,s:p.subj,src:'plan'});p.lg=1;toast('Session logged 🎉','ok')}save();R()};
const addPlan=()=>{const p={id:uid(),date:pd,subj:val('p_sub'),ch:val('p_ch'),start:val('p_s'),end:val('p_e'),task:val('p_t'),pri:val('p_pri'),st:'Pending'};if(!p.start||!p.end||dur(p)<=0)return toast('End time must be after start time','warn');S.plan.push(p);save();R();toast('Session added','ok')};
/* ===== Goals ===== */
const addGoal=()=>{const t=val('g_t');if(!t)return toast('Enter a goal','warn');S.goals.push({id:uid(),t,d:val('g_d'),pri:val('g_p'),p:0});save();R()};
const setGoal=(i,v)=>{S.goals.find(g=>g.id==i).p=+v;save();R()};
/* ===== JEE tracker ===== */
let js='Physics';
const setCh=(i,k,v)=>{const key=js+'|'+i,a=S.ch[key]||(S.ch[key]=[0,0,0,0,0]);a[k]=+v;save();$('#cp'+i).textContent=cp(js,i)+'%';$('#v'+i+k).textContent=v+'%'};
/* ===== Timer ===== */
const T={total:S.set.timer*60,left:S.set.timer*60,iv:null,end:0,study:true,name:'Focus',subj:'Physics'};
const fmt=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
const setT=(m,s,n)=>{clearInterval(T.iv);T.iv=null;Object.assign(T,{total:m*60,left:m*60,study:s,name:n});R()};
const startT=()=>{if(T.iv||!T.left)return;T.end=Date.now()+T.left*1e3;T.iv=setInterval(tick,500);R()};
const pauseT=()=>{clearInterval(T.iv);T.iv=null;R()},resetT=()=>{pauseT();T.left=T.total;R()};
const tick=()=>{T.left=Math.max(0,Math.round((T.end-Date.now())/1e3));const e=$('#tm');if(e){e.textContent=fmt(T.left);$('#tr').style.setProperty('--p',Math.round((1-T.left/T.total)*100))}if(!T.left){clearInterval(T.iv);T.iv=null;finish()}};
const finish=()=>{if(T.study){S.log.push({d:td(),m:Math.round(T.total/60),s:T.subj,src:'timer'});save();toast('✅ Session done! '+Math.round(T.total/60)+' min logged','ok')}else toast('Break over — back to work!','warn');ping('Timer finished: '+T.name);T.left=T.total;R()};
const ping=m=>{if(window.Notification&&Notification.permission=='granted')new Notification('JEE Hub',{body:m})};
/* ===== PYQ ===== */
let pf={s:'',d:'',c:''};
const addQ=()=>{const t=+val('q_t'),ok=+val('q_ok'),no=+val('q_no');if(!t||ok+no>t||ok<0||no<0)return toast('Check the numbers (correct + wrong ≤ total)','warn');S.pyq.push({id:uid(),date:td(),s:val('q_s'),c:val('q_c'),d:val('q_d'),t,ok,no});save();R()};
/* ===== Revision ===== */
const addRev=()=>{const c=val('r_c');if(!c)return toast('Enter a chapter','warn');const s=Object.keys(SUB).find(k=>SUB[k].includes(c))||val('r_s'),d=val('r_d');[0,3,7,15].forEach((o,i)=>S.revs.push({id:uid(),ch:c,s,date:ad(d,o),n:i+1,done:0}));save();R();toast('4 revisions scheduled','ok')};
const revDone=i=>{S.revs.find(r=>r.id==i).done=td();save();R()};
/* ===== Exams ===== */
const addExam=()=>{if(!val('e_n')||!val('e_d'))return toast('Name and date required','warn');S.exams.push({id:uid(),name:val('e_n'),s:val('e_s'),c:val('e_c'),date:val('e_d'),p:+val('e_p')});save();R()};
const setEx=(i,v)=>{S.exams.find(e=>e.id==i).p=+v;save();$('#ep'+i).textContent=v+'%'};
/* ===== Notes ===== */
let nq='',nfav=0,ne=null;
const saveNote=()=>{const t=val('n_t'),b=$('#n_b').value;if(!t&&!b)return;if(ne){Object.assign(S.notes.find(n=>n.id==ne),{t,b});ne=null}else S.notes.push({id:uid(),t,b,pin:0,fav:0});save();R()};
const nt=(i,k)=>{const n=S.notes.find(x=>x.id==i);n[k]=!n[k];save();R()};
const editN=i=>{ne=i;R();const n=S.notes.find(x=>x.id==i);$('#n_t').value=n.t;$('#n_b').value=n.b};
/* ===== Settings ===== */
const setS=(k,v)=>{S.set[k]=v;save();if(k=='timer'&&!T.iv){T.total=T.left=v*60}if(k=='notify'&&v&&window.Notification)Notification.requestPermission()};
const tog=()=>{S.set.theme=S.set.theme=='dark'?'light':'dark';save();theme()};
const theme=()=>{document.documentElement.dataset.t=S.set.theme;$('#th').textContent=S.set.theme=='dark'?'🌙':'☀️'};
const exp=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,1)],{type:'application/json'}));a.download='jee-dashboard-'+td()+'.json';a.click()};
const imp=f=>{const r=new FileReader();r.onload=()=>{try{S=Object.assign({},DEF,JSON.parse(r.result));save();location.reload()}catch(e){toast('Invalid file','warn')}};r.readAsText(f)};
const reset=()=>{if(confirm('Delete ALL data? This cannot be undone.')){localStorage.removeItem(KEY);location.reload()}};

/* ===== Views ===== */
const V={};
V.dash=()=>{const t=td(),h=new Date().getHours(),st=streak(),w=days7().reduce((a,d)=>a+mins(d),0),rv=dueRevs(),
ex=S.exams.filter(x=>dd(x.date)>=0).sort((a,b)=>a.date<b.date?-1:1).slice(0,3),tp=S.plan.filter(x=>x.date==t).sort((a,b)=>tm(a.start)-tm(b.start));
return`<h2>👋 Good ${h<12?'morning':h<17?'afternoon':'evening'}!</h2><p class=mut>${new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
<div class=stats>${[['⏱️','Study today',hrs(mins(t))+' / '+S.set.target+'h'],['📆','This week',hrs(w)+' h'],['🔥','Streak',st+' days'],['📝','Pending tasks',S.plan.filter(x=>x.st!='Completed').length]].map(x=>`<div class=card><span class=big>${x[0]}</span><small>${x[1]}</small><b>${x[2]}</b></div>`).join('')}</div>
<div class=card><h3>🎯 JEE preparation · ${op()}%</h3><div class=rings>${Object.keys(SUB).map(s=>`<div>${ring(sp(s),SC[s])}<small>${s}: ${sp(s)}%</small></div>`).join('')}</div></div>
<div class=card><h3>🔥 ${st} Day Study Streak</h3>${[3,7,14,30,50].map(n=>`<span class="badge ${st>=n?'on':''}">${n} Days</span> `).join('')}</div>
<div class=grid2><div class=card><h3>🔄 Revision Due Today</h3>${rv.length?rv.map(r=>`<div class=li><span>${esc(r.ch)} <small>Rev ${r.n}</small></span><button onclick="revDone('${r.id}')">✓ Done</button></div>`).join(''):empty('🎉','Nothing due today')}</div>
<div class=card><h3>🏫 Upcoming Exams</h3>${ex.length?ex.map(e=>`<div class=li><span>${esc(e.name)} <small>${esc(e.s)}</small></span><b>${dd(e.date)}d</b></div>`).join(''):empty('📭','No exams added')}</div>
<div class=card><h3>📅 Today's Plan</h3>${tp.length?tp.map(p=>item(p)).join(''):empty('🗓️','No sessions planned today')}</div></div>`};
V.planner=()=>{const L=S.plan.filter(p=>p.date==pd).sort((a,b)=>tm(a.start)-tm(b.start));
return`<div class=card><h3>New study session</h3><div class=form><label>Date<input type=date value=${pd} onchange="pd=this.value;R()"></label>${inp('p_sub','Subject','',  'Physics',SJ)}${inp('p_ch','Chapter')}${inp('p_s','Start','time','15:45')}${inp('p_e','End','time','17:45')}${inp('p_t','Task','text','Concept + Theory').replace(' list=chs','')}${inp('p_pri','Priority','','Medium',['High','Medium','Low'])}<button class=btn onclick=addPlan()>＋ Add</button></div></div><h3>Timeline · ${pd}</h3>${L.length?L.map(p=>item(p)).join(''):empty('📅','No sessions on this day')}`};
V.tasks=()=>{const L=S.plan.filter(p=>tf=='All'||p.st==tf).sort((a,b)=>(a.date+a.start)<(b.date+b.start)?-1:1);
return`<div class=tabs>${['All','Pending','In Progress','Completed'].map(s=>`<button class="${s==tf?'on':''}" onclick="tf='${s}';R()">${s}</button>`).join('')}</div>${L.length?L.map(p=>item(p,1)).join(''):empty('✅','No tasks here — add them in the Planner')}`};
V.jee=()=>`<div class=tabs>${Object.keys(SUB).map(s=>`<button class="${s==js?'on':''}" onclick="js='${s}';R()">${s} · ${sp(s)}%</button>`).join('')}</div><div class=cards>${SUB[js].map((c,i)=>{const a=S.ch[js+'|'+i]||[0,0,0,0,0];return`<div class=card><div class=row><b>${esc(c)}</b><span id=cp${i} class=pct>${cp(js,i)}%</span></div>${['Theory','Concept','Practice','PYQ','Revision'].map((n,k)=>`<label class=sl>${n}<input type=range value=${a[k]} oninput="setCh(${i},${k},this.value)"><em id=v${i}${k}>${a[k]}%</em></label>`).join('')}</div>`}).join('')}</div>`;
V.goals=()=>`<div class=card><h3>New goal</h3><div class=form>${inp('g_t','Goal (e.g. Finish 50 Physics PYQs)').replace(' list=chs','')}${inp('g_d','Deadline','date',ad(td(),7))}${inp('g_p','Priority','','Medium',['High','Medium','Low'])}<button class=btn onclick=addGoal()>＋ Add</button></div></div>${S.goals.length?S.goals.map(g=>`<div class=card><div class=row><b>${g.p>=100?'✅ ':''}${esc(g.t)}</b><span><span class="pill ${g.pri}">${g.pri}</span> <button class=x onclick="del('goals','${g.id}')">🗑</button></span></div>${bar(g.p,g.p>=100?'#10b981':'var(--ac)')}<div class=row><small>${g.p}% · Due ${g.d} (${dd(g.d)}d)</small><input type=range style="width:50%" value=${g.p} onchange="setGoal('${g.id}',this.value)"></div></div>`).join(''):empty('🎯','Set your first goal')}`;
V.timer=()=>{const n=S.log.filter(l=>l.d==td()&&l.src=='timer').length;
return`<div class="card timer"><div class=tabs>${[[25,1,'25 min study'],[5,0,'5 min break'],[50,1,'50 min study'],[10,0,'10 min break']].map(x=>`<button onclick="setT(${x[0]},${x[1]},'${x[2]}')">${x[2]}</button>`).join('')}<input id=c_m type=number min=1 value=${S.set.timer} style="width:70px"><button onclick="setT(+$('#c_m').value||25,1,'Custom')">Custom</button></div>
<p>${T.study?'📖':'☕'} ${T.name} · <select id=t_s style="width:auto" onchange="T.subj=this.value">${SEL(Object.keys(SUB),T.subj)}</select></p>
<div id=tr class=ring style="--p:${Math.round((1-T.left/T.total)*100)};--c:var(--ac)"><b id=tm>${fmt(T.left)}</b></div><br>
<button class=btn onclick=startT()>▶ Start</button> <button onclick=pauseT()>⏸ Pause</button> <button onclick=resetT()>↺ Reset</button>
<p>Sessions completed today: <b>${n}</b> · Studied: <b>${hrs(mins(td()))} h</b></p></div>`};
V.pyq=()=>{const L=S.pyq.filter(q=>(!pf.s||q.s==pf.s)&&(!pf.d||q.d==pf.d)&&(!pf.c||q.c.toLowerCase().includes(pf.c.toLowerCase()))),sum=k=>L.reduce((a,q)=>a+q[k],0),t=sum('t');
return`<div class=card><h3>Log practice</h3><div class=form>${inp('q_s','Subject','','Physics',Object.keys(SUB))}${inp('q_c','Chapter')}${inp('q_d','Difficulty','','Medium',['Easy','Medium','Hard'])}${inp('q_t','Total','number')}${inp('q_ok','Correct','number')}${inp('q_no','Incorrect','number')}<button class=btn onclick=addQ()>＋ Add</button></div></div>
<div class=card><div class=form><label>Subject<select onchange="pf.s=this.value;R()"><option value="">All</option>${SEL(Object.keys(SUB),pf.s)}</select></label><label>Difficulty<select onchange="pf.d=this.value;R()"><option value="">All</option>${SEL(['Easy','Medium','Hard'],pf.d)}</select></label><label>Chapter<input value="${esc(pf.c)}" onchange="pf.c=this.value;R()"></label></div></div>
<div class=stats>${[['Total',t],['Correct',sum('ok')],['Incorrect',sum('no')],['Unattempted',t-sum('ok')-sum('no')],['Accuracy',acc(L)+'%']].map(x=>`<div class=card><small>${x[0]}</small><b>${x[1]}</b></div>`).join('')}</div>
${L.length?`<div class=card style="overflow:auto"><table><tr><th>Date<th>Subject<th>Chapter<th>Diff<th>✓<th>✗<th>Total<th></tr>${L.slice().reverse().map(q=>`<tr><td>${q.date}<td>${q.s}<td>${esc(q.c)}<td>${q.d}<td>${q.ok}<td>${q.no}<td>${q.t}<td><button class=x onclick="del('pyq','${q.id}')">🗑</button></tr>`).join('')}</table></div>`:empty('❓','No questions logged')}`};
V.rev=()=>{const t=td(),L=S.revs.filter(r=>!r.done).sort((a,b)=>a.date<b.date?-1:1);
return`<div class=card><h3>Schedule revisions (Day 0, +3, +7, +15)</h3><div class=form>${inp('r_c','Chapter')}${inp('r_s','Subject (if custom)','','Physics',Object.keys(SUB))}${inp('r_d','Start date','date',t)}<button class=btn onclick=addRev()>＋ Schedule</button></div></div>
<div class=card><h3>Pending revisions</h3>${L.length?L.map(r=>`<div class=li><span>${esc(r.ch)} · Rev ${r.n} <small>${r.date<=t?'<b style="color:#ef4444">DUE</b>':'in '+dd(r.date)+'d'} (${r.date})</small></span><button onclick="revDone('${r.id}')">✓</button></div>`).join(''):empty('🔄','No revisions pending')}</div><small>Completed: ${S.revs.filter(r=>r.done).length}</small>`};
V.exams=()=>{const L=S.exams.slice().sort((a,b)=>a.date<b.date?-1:1);
return`<div class=card><h3>Add school exam</h3><div class=form>${inp('e_n','Exam name')}${inp('e_s','Subject','','Physics',SJ)}${inp('e_c','Syllabus / chapters')}${inp('e_d','Date','date',ad(td(),14))}${inp('e_p','Prep %','number',0)}<button class=btn onclick=addExam()>＋ Add</button></div></div>${L.length?L.map(e=>`<div class=card><div class=row><b>${esc(e.name)} · ${esc(e.s)}</b><span>${dd(e.date)<0?'Done':dd(e.date)+' days left'} <button class=x onclick="del('exams','${e.id}')">🗑</button></span></div><small>${esc(e.c)} · ${e.date}</small>${bar(e.p,'#10b981')}<label class=sl>Prep<input type=range value=${e.p} oninput="setEx('${e.id}',this.value)"><em id=ep${e.id}>${e.p}%</em></label></div>`).join(''):empty('🏫','No exams scheduled')}`};
V.ana=()=>{const K=Object.keys(SUB),t=td(),d7=days7().map(d=>({l:new Date(d+'T00:00').toLocaleDateString(undefined,{weekday:'short'}),v:+hrs(mins(d))})),
wk=[3,2,1,0].map(i=>({l:i?'-'+i+'w':'This',v:+hrs([...Array(7)].reduce((a,_,j)=>a+mins(ad(t,-i*7-j)),0))})),
C=(f)=>K.map(s=>({l:s.slice(0,4),v:f(s),c:SC[s]}));
return`<div class=grid2><div class=card><h3>Daily study hours</h3>${bars(d7)}</div><div class=card><h3>Weekly study hours</h3>${bars(wk)}</div>
<div class=card><h3>Subject-wise time</h3>${bars(C(s=>+hrs(S.log.filter(l=>l.s==s).reduce((a,l)=>a+l.m,0))))}</div>
<div class=card><h3>Chapter completion</h3>${bars(C(sp),'%')}</div><div class=card><h3>Question accuracy</h3>${bars(C(s=>acc(S.pyq.filter(q=>q.s==s))),'%')}</div>
<div class=card><h3>Revisions completed</h3>${bars(C(s=>S.revs.filter(r=>r.done&&r.s==s).length),'')}</div></div>`};
V.notes=()=>{const q=nq.toLowerCase(),L=S.notes.filter(n=>(!nfav||n.fav)&&(n.t+n.b).toLowerCase().includes(q)).sort((a,b)=>b.pin-a.pin);
return`<div class=card><h3>${ne?'Edit':'New'} note</h3>${inp('n_t','Title').replace(' list=chs','')}<br><label>Note<textarea id=n_b rows=3></textarea></label><br><button class=btn onclick=saveNote()>Save</button></div>
<div class=form><label>Search<input value="${esc(nq)}" onchange="nq=this.value;R()"></label><button class="${nfav?'on':''}" onclick="nfav=!nfav;R()">⭐ Favorites only</button></div><br>
<div class=cards>${L.length?L.map(n=>`<div class="card note ${n.pin?'pin':''}"><b>${esc(n.t)}</b><p style="white-space:pre-wrap">${esc(n.b)}</p><button onclick="nt('${n.id}','pin')">${n.pin?'📌 Unpin':'📍 Pin'}</button> <button onclick="nt('${n.id}','fav')">${n.fav?'⭐':'☆'}</button> <button onclick="editN('${n.id}')">✏️</button> <button onclick="del('notes','${n.id}')">🗑</button></div>`).join(''):empty('📝','No notes yet')}</div>`};
V.set=()=>`<div class=card><h3>Preferences</h3><div class=form><label>Theme<select onchange="S.set.theme=this.value;save();theme()">${SEL(['dark','light'],S.set.theme)}</select></label><label>Daily study target (h)<input type=number value=${S.set.target} onchange="setS('target',+this.value)"></label><label>Default timer (min)<input type=number value=${S.set.timer} onchange="setS('timer',+this.value)"></label><label>Reminders<select onchange="setS('notify',this.value=='on')">${SEL(['on','off'],S.set.notify?'on':'off')}</select></label></div></div>
<div class=card><h3>Data</h3><button onclick=exp()>⬇ Export</button> <label style="display:inline"><input type=file accept=.json onchange="imp(this.files[0])" style="width:auto"></label> <button onclick=reset() style="color:#ef4444">🗑 Reset all data</button></div>`;
const NAV=[['dash','🏠','Dashboard'],['planner','📅','Planner'],['jee','📚','JEE Tracker'],['tasks','📝','Tasks'],['goals','🎯','Goals'],['timer','⏱️','Study Timer'],['pyq','❓','PYQ Tracker'],['rev','🔄','Revision'],['exams','🏫','Exams'],['ana','📊','Analytics'],['notes','📝','Notes'],['set','⚙️','Settings']];
$('#nav').innerHTML=NAV.map(n=>`<a href="#${n[0]}">${n[1]} ${n[2]}</a>`).join('');
function R(){const v=location.hash.slice(1),n=NAV.find(x=>x[0]==v)||NAV[0];$('#ttl').textContent=n[1]+' '+n[2];$('#app').innerHTML=V[n[0]]();document.querySelectorAll('#nav a').forEach(a=>a.classList.toggle('on',a.hash=='#'+n[0]));document.body.classList.remove('open')}
/* ===== Reminders ===== */
const chk=()=>{if(!S.set.notify)return;const k=td(),M=[],n=new Date(),nm=n.getHours()*60+n.getMinutes();
S.exams.filter(x=>dd(x.date)>=0&&dd(x.date)<=3).forEach(x=>M.push('Exam in '+dd(x.date)+' day(s): '+x.name));
const p=S.plan.filter(x=>x.date==k&&x.st!='Completed').length;if(p)M.push(p+' pending task(s) today');
if(dueRevs().length)M.push(dueRevs().length+' revision(s) due today');
S.plan.filter(x=>x.date==k&&x.st=='Pending'&&tm(x.start)-nm>=0&&tm(x.start)-nm<=10).forEach(x=>M.push('Starting soon: '+x.subj+' at '+f12(x.start)));
M.forEach(m=>{const key='n'+k+m;if(sessionStorage[key])return;sessionStorage[key]=1;toast('🔔 '+m,'warn');ping(m)})};
window.addEventListener('hashchange',R);theme();R();setTimeout(chk,1200);setInterval(chk,6e4);
