// ===== Données lettres + mapping audio =====
const LETTERS = [
  {ar:'ا', name:'alif', file:'alif.mp3'},
  {ar:'ب', name:'ba',   file:'ba.mp3'},
  {ar:'ت', name:'ta',   file:'ta.mp3'},
  {ar:'ث', name:'tha',  file:'tha.mp3'},
  {ar:'ج', name:'jiim', file:'jiim.mp3'},
  {ar:'ح', name:'hha',  file:'hha.mp3'},
  {ar:'خ', name:'kha',  file:'kha.mp3'},
  {ar:'د', name:'daal', file:'daal.mp3'},
  {ar:'ذ', name:'dhal', file:'dhal.mp3'},   // accepte aussi thaal.mp3 (copie)
  {ar:'ر', name:'ra',   file:'ra.mp3'},
  {ar:'ز', name:'zay',  file:'zay.mp3'},
  {ar:'س', name:'siin', file:'siin.mp3'},
  {ar:'ش', name:'shiin',file:'shiin.mp3'},
  {ar:'ص', name:'saad', file:'saad.mp3'},
  {ar:'ض', name:'daad', file:'daad.mp3'},
  {ar:'ط', name:'taa',  file:'taa.mp3'},
  {ar:'ظ', name:'thaa', file:'thaa.mp3'},
  {ar:'ع', name:'ayn',  file:'ayn.mp3'},
  {ar:'غ', name:'ghayn',file:'ghayn.mp3'},
  {ar:'ف', name:'fa',   file:'fa.mp3'},
  {ar:'ق', name:'qaf',  file:'qaf.mp3'},
  {ar:'ك', name:'kaf',  file:'kaf.mp3'},
  {ar:'ل', name:'lam',  file:'lam.mp3'},
  {ar:'م', name:'miim', file:'miim.mp3'},
  {ar:'ن', name:'nuun', file:'nuun.mp3'},
  {ar:'ه', name:'ha',   file:'ha.mp3'},
  {ar:'و', name:'waw',  file:'waw.mp3'},
  {ar:'ي', name:'ya',   file:'ya.mp3'}
];

// ===== Audio utils (mobile-friendly) =====
let audioUnlocked = false;
let dummy = null;
function unlockAudio(){
  try{ dummy = new Audio(); dummy.play().catch(()=>{}); }catch(e){}
  audioUnlocked = true;
  const gate = document.getElementById('audio-gate'); if(gate) gate.classList.remove('show');
}
function ensureGate(){ if(!audioUnlocked) document.getElementById('audio-gate').classList.add('show'); }
function playLetterAudioByName(name){
  const L = LETTERS.find(l => l.name === name); if(!L) return;
  new Audio(`assets/audio/${L.file}`).play().catch(()=>{});
}
function playLetterAudioByChar(ar){
  const L = LETTERS.find(l => l.ar === ar); if(!L) return;
  playLetterAudioByName(L.name);
}

// ===== Profil & Badges (léger) =====
const STORE_KEY='kids_arabic_profile_mobile';
function loadProfile(){ try{ return JSON.parse(localStorage.getItem(STORE_KEY))||null; }catch(e){ return null; } }
function saveProfile(p){ localStorage.setItem(STORE_KEY, JSON.stringify(p)); }
function newProfile(avatar, name){ return { name, avatar, xp:0, level:1, badges:[] }; }
function gainXP(p, amount=5){
  p.xp += amount;
  while (p.xp >= 100){ p.xp -= 100; p.level += 1; unlockBadge(p, `Niveau ${p.level}`, '🎉'); confetti(); }
  saveProfile(p); renderBadges();
}
function unlockBadge(p, title, emoji){
  if (!p.badges.some(b=>b.title===title)){ p.badges.push({title,emoji,date:new Date().toISOString()}); saveProfile(p); renderBadges(); }
}

// ===== UI Base =====
const $ = sel => document.querySelector(sel);
const screens = { home: $('#home'), play: $('#play'), badges: $('#badges') };
function show(id){ Object.values(screens).forEach(s=>s.classList.remove('show')); screens[id].classList.add('show'); window.scrollTo({top:0, behavior:'smooth'}); }
document.querySelectorAll('.nav .btn').forEach(b=> b.onclick = ()=> show(b.dataset.screen));
$('#btn-start').onclick = ()=> show('play');

const modal = $('#modal'); const avatarsWrap = $('#avatars');
const avatarColors = ['#ffd66b','#a0e9ff','#ffc8dd','#bde0fe','#caffbf','#e9ff70','#ffadad','#d0bfff'];
function openModal(){ modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false'); }
function closeModal(){ modal.classList.add('hidden'); modal.setAttribute('aria-hidden','true'); }
$('#cancel-profile').onclick = closeModal;
let selectedAvatar = 0;
function buildAvatars(){
  avatarsWrap.innerHTML='';
  avatarColors.forEach((c,i)=>{
    const d=document.createElement('div'); d.className='a'; d.style.background=c;
    d.onclick=()=>{ selectedAvatar=i; document.querySelectorAll('.avatars .a').forEach(n=>n.classList.remove('sel')); d.classList.add('sel'); };
    if(i===0) d.classList.add('sel');
    avatarsWrap.appendChild(d);
  });
}
$('#save-profile').onclick = ()=>{
  const name = $('#kid-name').value.trim() || 'Ami·e';
  const p = newProfile(selectedAvatar, name);
  saveProfile(p); closeModal(); confetti();
};

function renderBadges(){
  const p = loadProfile(); const ul = $('#badges-list'); ul.innerHTML='';
  if(!p || !p.badges.length){ ul.innerHTML='<li>Aucun badge pour le moment.</li>'; return; }
  p.badges.forEach(b=>{ const li=document.createElement('li'); li.innerHTML = `<span style="font-size:1.6rem">${b.emoji}</span> <strong>${b.title}</strong> <span style="color:#667">(${new Date(b.date).toLocaleDateString()})</span>`; ul.appendChild(li); });
}

// ===== Jeux =====
const gameArea = $('#game-area');
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

// GATE: audio unlock button
const gateBtn = document.getElementById('unlock-audio');
gateBtn.addEventListener('click', ()=> unlockAudio());

// QUIZ (tap : écouter → choisir)
function gameQuiz(){
  ensureGate();
  gameArea.innerHTML = `
    <div class="card" style="padding:1rem">
      <h3>🔈 Écoute et trouve</h3>
      <div style="display:flex; gap:.5rem; align-items:center; margin:.4rem 0">
        <button class="btn" id="btn-play-sound">▶️ Écouter</button>
      </div>
      <div class="quiz-grid" id="quiz-choices"></div>
      <p id="quiz-feedback"></p>
      <div id="note-quiz" class="inline-result"></div>
    </div>`;
  let good=0, tries=0, current=null;

  function playNow(){ if(!current) return; playLetterAudioByName(current.name); }
  function liveNote(){ const fautes = Math.max(0, tries-good), total = tries, note = total? Math.round((good/total)*20*100)/100 : 0; $('#note-quiz').innerHTML = `⭐ <strong>${good}</strong> bonnes · ❌ <strong>${fautes}</strong> fautes · 🎯 <strong>${total}</strong> tentatives — <strong>${note}/20</strong>`; }

  function next(){
    current = LETTERS[Math.floor(Math.random()*LETTERS.length)];
    const opts = new Set([current.ar]);
    while (opts.size<4) opts.add(LETTERS[Math.floor(Math.random()*LETTERS.length)].ar);
    const arr = [...opts]; shuffle(arr);
    const choicesEl = $('#quiz-choices'); choicesEl.innerHTML='';
    arr.forEach(ar=>{
      const btn = document.createElement('button');
      btn.className='card choice'; btn.textContent=ar;
      btn.onclick=()=>{
        tries++;
        if(ar===current.ar){ good++; $('#quiz-feedback').textContent='✅ Bravo !'; btn.classList.add('good'); playNow(); }
        else { $('#quiz-feedback').textContent='❌ Essaie encore.'; btn.classList.add('bad'); }
        liveNote();
        setTimeout(next, 650);
      };
      btn.addEventListener('pointerdown', ()=> playLetterAudioByChar(ar));
      choicesEl.appendChild(btn);
    });
  }
  $('#btn-play-sound').onclick = playNow;
  next();
}

// MATCH (mobile tap-to-pair)
function gameMatch(){
  gameArea.innerHTML = `
    <div class="card" style="padding:1rem">
      <h3>🧩 Associe nom ↔ lettre (tap)</h3>
      <div class="match">
        <div class="col" id="col-names"></div>
        <div class="col" id="col-letters"></div>
      </div>
      <p id="match-feedback"></p>
      <div id="note-match" class="inline-result"></div>
    </div>`;
  const pick = shuffle(LETTERS.slice()).slice(0,6);
  const names = $('#col-names'), letters = $('#col-letters');
  let selName=null, good=0, tries=0;

  function liveNote(){ const fautes = Math.max(0, tries-good), total = tries, note = total? Math.round((good/total)*20*100)/100 : 0; $('#note-match').innerHTML = `⭐ <strong>${good}</strong> bonnes · ❌ <strong>${fautes}</strong> fautes · 🎯 <strong>${total}</strong> tentatives — <strong>${note}/20</strong>`; }

  pick.forEach(l=>{
    const n=document.createElement('button'); n.className='tap'; n.textContent=l.name; n.dataset.name=l.name;
    n.onclick=()=>{ if(selName) selName.classList.remove('sel'); selName=n; n.classList.add('sel'); playLetterAudioByName(l.name); };
    names.appendChild(n);
  });
  shuffle(pick.slice()).forEach(l=>{
    const b=document.createElement('button'); b.className='tap'; b.textContent=l.ar; b.dataset.name=l.name;
    b.onclick=()=>{
      tries++;
      if(!selName){ $('#match-feedback').textContent='Choisis d’abord un nom.'; return; }
      if(selName.dataset.name===b.dataset.name){
        good++; $('#match-feedback').textContent='✅ Bien joué !'; selName.classList.add('ok'); b.classList.add('ok'); playLetterAudioByName(b.dataset.name);
        selName.disabled=true; b.disabled=true; selName.classList.remove('sel'); selName=null;
        const p = loadProfile(); if(p) gainXP(p,6);
      } else {
        $('#match-feedback').textContent='❌ Mauvaise paire.'; b.classList.add('bad'); setTimeout(()=> b.classList.remove('bad'), 600);
      }
      liveNote();
    };
    letters.appendChild(b);
  });
}

// TRACE (canvas : touch-action none + pointer events)
function gameTrace(){function gameTrace(){
  gameArea.innerHTML = `
    <div class="card" style="padding:1rem">
      <h3>✍️ Trace la lettre</h3>
      <div class="trace-wrap">
        <div class="guideline" id="trace-guide">ا</div>
        <canvas id="trace-canvas"></canvas>
      </div>
      <div style="display:flex; gap:.5rem; margin-top:.6rem; flex-wrap:wrap">
        <button class="btn" id="trace-hear">Écouter</button>
        <button class="btn" id="trace-clear">Effacer</button>
        <button class="btn primary" id="trace-next">Lettre suivante</button>
      </div>
      <div id="note-trace" class="inline-result"></div>
    </div>`;
  let idx = Math.floor(Math.random()*LETTERS.length);
  const guide = $('#trace-guide');
  function setGuide(){ guide.textContent = LETTERS[idx].ar; if(audioUnlocked) playLetterAudioByName(LETTERS[idx].name); }
  setGuide();

  const cvs = $('#trace-canvas'), ctx = cvs.getContext('2d');

  function resizeCanvas(){
    const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
    const targetH = Math.max(340, Math.min(window.innerHeight * (window.innerWidth < 640 ? 0.6 : 0.5), 600));
    cvs.style.width = '100%';
    cvs.style.height = targetH + 'px';
    const rect = cvs.getBoundingClientRect();
    cvs.width  = Math.round(rect.width * dpr);
    cvs.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#5b6dff';
  }
  requestAnimationFrame(resizeCanvas);
  window.addEventListener('resize', resizeCanvas);

  let drawing=false;
  function posFromEvent(e){
    const rect = cvs.getBoundingClientRect();
    const x = (e.clientX - rect.left);
    const y = (e.clientY - rect.top);
    return {x, y};
  }
  cvs.addEventListener('pointerdown',e=>{ drawing=true; const {x,y}=posFromEvent(e); ctx.beginPath(); ctx.moveTo(x,y); e.preventDefault(); });
  cvs.addEventListener('pointermove',e=>{ if(!drawing) return; const {x,y}=posFromEvent(e); ctx.lineTo(x,y); ctx.stroke(); e.preventDefault(); }, {passive:false});
  window.addEventListener('pointerup',()=> drawing=false, {passive:false});

  $('#trace-clear').onclick=()=> ctx.clearRect(0,0,cvs.width, cvs.height);
  let good=0, tries=0;
  function liveNote(){ const fautes = Math.max(0, tries-good), total = tries, note = total? Math.round((good/total)*20*100)/100 : 0; $('#note-trace').innerHTML = `⭐ <strong>${good}</strong> bonnes · ❌ <strong>${fautes}</strong> fautes · 🎯 <strong>${total}</strong> tentatives — <strong>${note}/20</strong>`; }
  $('#trace-next').onclick=()=>{ idx = (idx+1)%LETTERS.length; setGuide(); ctx.clearRect(0,0,cvs.width,cvs.height); good++; tries++; liveNote(); };
  $('#trace-hear').onclick = ()=> playLetterAudioByName(LETTERS[idx].name);
}

// ===== Confetti mini =====
function confetti(){
  const root = document.getElementById('confetti');
  const n = 24;
  for(let i=0;i<n;i++){
    const s = document.createElement('span');
    s.textContent='•'; s.style.position='absolute'; s.style.left=(Math.random()*100)+'%';
    s.style.top='-10px'; s.style.fontSize=(8+Math.random()*18)+'px';
    s.style.color = ['#5b6dff','#8a9bff','#ff8fab','#ffd166','#06d6a0'][Math.floor(Math.random()*5)];
    s.style.transition='transform 1.2s ease, opacity 1.2s ease';
    root.appendChild(s);
    requestAnimationFrame(()=>{ s.style.transform = `translateY(${window.innerHeight}px) translateX(${(Math.random()*80-40)}px)`; s.style.opacity='0'; });
    setTimeout(()=> s.remove(), 1400);
  }
}

// ===== Nav & init =====
document.querySelectorAll('.game').forEach(btn=> btn.onclick = ()=>{ show('play'); const game = btn.dataset.game; if(game==='quiz') gameQuiz(); if(game==='match') gameMatch(); if(game==='trace') gameTrace(); });
function renderProfileInit(){ const p = loadProfile(); if(!p) openModal(); renderBadges(); }
document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('.nav .btn').forEach(b=> b.addEventListener('click', ()=> show(b.dataset.screen)));
  const gateBtn = document.getElementById('unlock-audio'); if (gateBtn) gateBtn.addEventListener('click', unlockAudio);
  buildAvatars(); renderProfileInit();
});
