let locations={};
async function loadLocations(){try{const r=await fetch('/data/locations.json');if(r.ok)locations=await r.json();}catch{}}
function buildDistrictMap(records){
 const grid=document.querySelector('#dotGrid');grid.className='geo-stage';grid.setAttribute('aria-label','Georgia district locations. Select a dot for details.');
 const ga=records.filter(d=>d.state==='GA'),located=ga.filter(d=>locations[d.district]);
 document.querySelector('#pulse-title').textContent=`${ga.length} Georgia entities`;
 document.querySelector('.pulse .micro').textContent='Georgia policy map';
 document.querySelector('.pulse-legend').innerHTML='<span><i class="dot adopted"></i>Formal rules</span><span><i class="dot emerging"></i>Emerging guidance</span><span><i class="dot none"></i>No public policy found</span><span>○ Not verified</span>';
 const note=document.createElement('p');note.className='map-instruction';note.textContent=`${located.length} approximate locations · Hover for a name. Select for details. Nearby dots are spread slightly for visibility.`;grid.before(note);
 const info=document.createElement('div');info.className='map-info';info.setAttribute('aria-live','polite');info.textContent='Explore a dot to see its district and policy status.';grid.after(info);
 const detail=document.createElement('dialog');detail.className='district-dialog';detail.innerHTML='<button class="dialog-close" aria-label="Close district details">×</button><div class="dialog-content"></div>';document.body.append(detail);detail.querySelector('button').onclick=()=>detail.close();detail.onclick=e=>{if(e.target===detail)detail.close();};
 function label(d){return `${d.district} — ${humanize(d.ai_policy_status)}`;}
 function open(d){
 const id=(typeof slugify==='function'?slugify(d.district):String(d.district||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''));
 const href=(typeof entityHref==='function'?entityHref(d):('/lea/'+id+'/'));
 const home=window.AIPM_HOME;
 if(home&&typeof home.canOpenDistrict==='function'&&!home.canOpenDistrict(id)){
  if(typeof home.openHomePaywall==='function') home.openHomePaywall(d.district||id, href, id);
  return;
 }
 if(home&&typeof home.recordDistrictView==='function') home.recordDistrictView(id);
 if(typeof updateHomeFreemiumMeta==='function') updateHomeFreemiumMeta();
 const content=detail.querySelector('.dialog-content');content.replaceChildren();const h=document.createElement('h2');h.textContent=d.district;content.append(h);const metro=(typeof metroParentLabel==='function'?metroParentLabel(d): (d.metro||''));const locBits=[d.state,humanize(d.ai_policy_status),locations[d.district]?.method||'Location not mapped'].filter(Boolean);if(metro)locBits.splice(1,0,metro);for(const text of [locBits.join(' · '),(typeof cardSummary==='function'?cardSummary(d):(d.one_liner||'No summary available.')),`AI safety: ${(!d.safety_ai_status||d.safety_ai_status==='none'||d.safety_ai_status==='unknown')?'No public AI safety rule found':humanize(d.safety_ai_status)}`]){const p=document.createElement('p');p.textContent=text;content.append(p);}if(typeof entityHref==='function'){const lea=document.createElement('p');const href=entityHref(d);const id=(typeof slugify==='function'?slugify(d.district):href.split('/').filter(Boolean).pop());const a=document.createElement('a');a.href=href;a.textContent='Open full district page →';a.setAttribute('data-district-id',id);a.setAttribute('data-district-name',d.district||'');a.addEventListener('click',function(ev){if(window.AIPM_HOME&&typeof window.AIPM_HOME.handleDistrictOpen==='function'){window.AIPM_HOME.handleDistrictOpen(ev,id,href,d.district||'');}});lea.append(a);content.append(lea);}if(typeof compositeScore==='function'){const c=compositeScore(d);if(c&&c.score!=null){const p=document.createElement('p');p.textContent=`Overall ${c.score} · ${c.label}`;content.append(p);}}const ul=document.createElement('ul');[...new Set((d.sources||'').split('|'))].forEach((url,i)=>{try{const u=new URL(url);if(!['http:','https:'].includes(u.protocol))return;const li=document.createElement('li'),a=document.createElement('a');a.href=u.href;a.target='_blank';a.rel='noopener noreferrer';a.textContent=`Source ${i+1} · ${u.hostname}`;li.append(a);ul.append(li);}catch{}});content.append(ul);detail.showModal();}
 const points=[];
 const longitudes=located.map(d=>locations[d.district].lon),latitudes=located.map(d=>locations[d.district].lat);
 const west=Math.min(...longitudes),east=Math.max(...longitudes),south=Math.min(...latitudes),north=Math.max(...latitudes);
 const slots=[];const spacing=3.8;const rowHeight=spacing*Math.sqrt(3)/2;
 for(let row=0;row<28;row++)for(let col=0;col<24;col++){const x=5+col*spacing+(row%2)*spacing/2,y=5+row*rowHeight;if(x<=95&&y<=95)slots.push({x,y});}
 const assigned=located.map(d=>{const l=locations[d.district];return {d,bx:8+(l.lon-west)/(east-west)*84,by:5+(north-l.lat)/(north-south)*90};});
 // Unique nearest hexagonal slots: all dots share the same minimum separation.
 assigned.forEach(p=>{let best=0,dist=Infinity;slots.forEach((s,j)=>{const cost=(s.x-p.bx)**2+(s.y-p.by)**2;if(cost<dist){dist=cost;best=j;}});p.slot=slots.splice(best,1)[0];});
 // Exchange assignments where doing so keeps both points closer overall.
 for(let pass=0;pass<5;pass++)for(let i=0;i<assigned.length;i++)for(let j=i+1;j<assigned.length;j++){const a=assigned[i],b=assigned[j];const cost=(p,s)=>(p.bx-s.x)**2+(p.by-s.y)**2;if(cost(a,b.slot)+cost(b,a.slot)+.01<cost(a,a.slot)+cost(b,b.slot)){const s=a.slot;a.slot=b.slot;b.slot=s;}}
 assigned.forEach(({d,slot:{x,y}},i)=>{points.push({x,y});const b=document.createElement('button');b.type='button';b.className=`district-dot ${groupStatus(d.ai_policy_status)} ${d.ai_policy_status==='unknown'?'unknown':''}`;b.setAttribute('aria-label',label(d));b.title=label(d);b.onmouseenter=b.onfocus=()=>{info.textContent=label(d);};b.onclick=()=>open(d);b.dataset.x=x;b.dataset.y=y;b.dataset.sx=8+(i*47%83);b.dataset.sy=5+(i*31%89);grid.append(b);});
 // Outside-GA / unmapped records stay in data for metro compare visuals later — not listed here.
 document.querySelector('#silenceCount').textContent=ga.filter(d=>d.ai_policy_status==='none').length;
 document.querySelector('.pulse-note').append(' Georgia entities only. ');
 const attribution=document.createElement('a');attribution.href='https://github.com/millbj92/US-Zip-Codes-JSON';attribution.textContent='ZIP coordinate source';attribution.target='_blank';attribution.rel='noopener noreferrer';document.querySelector('.pulse-note').append(attribution);
 const entityEl=document.querySelector('#entityCount');
 if(entityEl) entityEl.textContent=String(records.length);
 document.querySelector('#formalCount').textContent=records.filter(d=>groupStatus(d.ai_policy_status)==='formal').length;
 document.querySelector('#safetyCount').textContent=records.filter(d=>['guidance','board_policy','procedure_handbook'].includes(d.safety_ai_status)).length;
 const asOf=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'short',day:'numeric'}).format(new Date());
 const pulseAsOf=document.querySelector('#pulseAsOf');
 if(pulseAsOf) pulseAsOf.textContent='Live from canonical data · as of '+asOf;
 const dataAsOf=document.querySelector('#dataAsOf');
 if(dataAsOf){ dataAsOf.hidden=false; dataAsOf.textContent='Counts update from the live CSV · as of '+asOf; }
 fetch('/data/schools.csv').then(r=>r.ok?r.text():Promise.reject()).then(t=>{
   const lines=t.trim().split(/\r?\n/).filter(Boolean);
   const n=Math.max(0, lines.length-1);
   const schoolEl=document.querySelector('#schoolCount');
   if(schoolEl) schoolEl.textContent=n.toLocaleString('en-US');
 }).catch(()=>{ const schoolEl=document.querySelector('#schoolCount'); if(schoolEl) schoolEl.textContent='—'; });
 document.querySelector('.section-intro>p:last-child').textContent='Search all records, including Georgia and Washington. Select a map dot to read its policy summary and original sources.';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:650px)');let pending=false;
 function update(){pending=false;const p=reduced.matches||mobile.matches?1:Math.max(0,Math.min(1,(innerHeight-grid.getBoundingClientRect().top)/(innerHeight*.65)));grid.querySelectorAll('button').forEach(b=>{b.style.left=(+b.dataset.sx+(b.dataset.x-b.dataset.sx)*p)+'%';b.style.top=(+b.dataset.sy+(b.dataset.y-b.dataset.sy)*p)+'%';});}
 function schedule(){if(!pending){pending=true;requestAnimationFrame(update);}}addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduced.addEventListener('change',schedule);update();
}
