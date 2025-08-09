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
  {ar:'ذ', name:'dhal', file:'dhal.mp3'},
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

// ===== Audio utils (tolère fichiers manquants) =====
function playLetterAudioByName(name){
  const L = LETTERS.find(l => l.name === name);
  if(!L) return;
  const path = `assets/audio/${L.file}`;
  const a = new Audio(path);
  a.play().catch(()=>{});
}
function playLetterAudioByChar(ar){
  const L = LETTERS.find(l => l.ar === ar);
  if(!L) return;
  playLetterAudioByName(L.name);
}

// ===== Profil & XP =====
const STORE_KEY='kids_arabic_profile_audio_v2';
function loadProfile(){ try{ return JSON.parse(localStorage.getItem(STORE_KEY))||null; }catch(e){ return null; } }
function saveProfile(p){ localStorage.setItem(STORE_KEY, JSON.stringify(p)); }
function newProfile(avatar, name){ return { name, avatar, xp:0, level:1, badges:[], history:[] }; }
function gainXP(p, amount=5){
  p.xp += amount;
  while (p.xp >= 100){ p.xp -= 100; p.level += 1; unlockBadge(p, `Niveau ${p.level}`, '🎉'); confetti(); }
  saveProfile(p); renderProfile();
}
function unlockBadge(p, title, emoji){
  if (!p.badges.some(b=>b.title===title)){ p.badges.push({title,emoji,date:new Date().toISOString()}); saveProfile(p); renderBadges(); }
}

// ===== UI Base =====
const $ = sel => document.querySelector(sel);
const screens = { home: $('#screen-home'), play: $('#screen-play'), badges: $('#screen-badges'), parents: $('#screen-parents') };
function show(id){ Object.values(screens).forEach(s=>s.classList.remove('show')); screens[id].classList.add('show'); window.scrollTo({top:0, behavior:'smooth'}); }
$('#btn-home').onclick = ()=> show('home');
$('#btn-play').onclick = ()=> show('play');
$('#btn-badges').onclick = ()=> show('badges');
$('#btn-parents').onclick = ()=> show('parents');
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
    const d=document.createElement('div');
    d.className='a'; d.style.background=c;
    d.onclick=()=>{ selectedAvatar=i; document.querySelectorAll('.avatars .a').forEach(n=>n.classList.remove('sel')); d.classList.add('sel'); };
    if(i===0) d.classList.add('sel');
    avatarsWrap.appendChild(d);
  });
}
$('#save-profile').onclick = ()=>{
  const name = $('#kid-name').value.trim() || 'Ami·e';
  const p = newProfile(selectedAvatar, name);
  saveProfile(p); closeModal(); renderProfile(); confetti();
};
function renderProfile(){
  const p = loadProfile();
  if(!p){ $('#profile-name').textContent = 'Invité'; $('#profile-level').textContent='1'; $('#profile-xp').style.width='0%'; return; }
  $('#profile-name').textContent = p.name; $('#profile-level').textContent = p.level; $('#profile-xp').style.width = p.xp+'%';
  const av = $('#profile-avatar'); av.style.background = avatarColors[p.avatar % avatarColors.length]; av.src = 'assets/avatar.svg';
}
function renderBadges(){
  const p = loadProfile(); const ul = $('#badges-list'); ul.innerHTML='';
  if(!p || !p.badges.length){ ul.innerHTML='<li>Aucun badge… pour le moment !</li>'; return; }
  p.badges.forEach(b=>{ const li=document.createElement('li'); li.innerHTML = `<span style="font-size:1.6rem">${b.emoji}</span> <strong>${b.title}</strong> <span style="color:#667">(${new Date(b.date).toLocaleDateString()})</span>`; ul.appendChild(li); });
}

// ===== Jeux =====
const gameArea = $('#game-area');
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

// QUIZ (audio d'abord → choisir lettre)
function gameQuiz(){
  gameArea.innerHTML = `
    <div class="card" style="padding:1rem">
      <h3>🔈 Écoute et trouve la lettre</h3>
      <div style="display:flex; gap:.5rem; align-items:center; margin:.4rem 0">
        <button class="btn" id="btn-play-sound">▶️ Écouter</button>
        <label style="display:flex;align-items:center;gap:.3rem; font-size:.9rem">
          Vitesse
          <select id="speed">
            <option value="1" selected>1x</option>
            <option value="0.85">0.85x</option>
            <option value="0.7">0.7x</option>
          </select>
        </label>
      </div>
      <div class="quiz-grid" id="quiz-choices"></div>
      <p id="quiz-feedback"></p>
      <div id="note-quiz"></div>
    </div>`;
  let good=0, tries=0, current=null, lastAudio=null;
  const choicesEl = $('#quiz-choices');
  const feedback = $('#quiz-feedback');
  const speedSel = $('#speed');

  function play(path){
    if(!path) return;
    const a = new Audio(path);
    a.playbackRate = parseFloat(speedSel.value||'1') || 1;
    a.play().catch(()=>{});
    lastAudio = a;
  }

  function next(){
    current = LETTERS[Math.floor(Math.random()*LETTERS.length)];
    const opts = new Set([current.ar]);
    while (opts.size<4) opts.add(LETTERS[Math.floor(Math.random()*LETTERS.length)].ar);
    const arr = [...opts]; shuffle(arr);
    choicesEl.innerHTML='';
    arr.forEach(ar=>{
      const btn = document.createElement('button');
      btn.className='card choice'; btn.textContent=ar;
      btn.onclick=()=>{
        tries++;
        if(ar===current.ar){
          good++; feedback.textContent='✅ Bravo !'; btn.classList.add('good'); play(`assets/audio/${current.file}`); gainXP(loadProfile(),4);
        }else{ feedback.textContent='❌ Essaie encore.'; btn.classList.add('bad'); }
        liveNote('quiz', good, tries, 'note-quiz');
        setTimeout(next, 650);
      };
      btn.onmouseenter = ()=> playLetterAudioByChar(ar);
      choicesEl.appendChild(btn);
    });
    setTimeout(()=> play(`assets/audio/${current.file}`), 200);
  }
  $('#btn-play-sound').onclick = ()=> current && play(`assets/audio/${current.file}`);
  next();
}

// MATCH (drag nom → lettre ; clic = jouer audio)
function gameMatch(){
  gameArea.innerHTML = `
    <div class="card" style="padding:1rem">
      <h3>🧩 Associe nom ↔ lettre (avec audio)</h3>
      <div class="match">
        <div class="col" id="drag-src"></div>
        <div class="col" id="drag-dst"></div>
      </div>
      <p id="match-feedback"></p>
      <div id="note-match"></div>
    </div>`;
  const pick = shuffle(LETTERS.slice()).slice(0,6);
  const src = $('#drag-src'), dst = $('#drag-dst'); src.innerHTML=''; dst.innerHTML='';
  let good=0, tries=0;

  pick.forEach(l=>{
    const d=document.createElement('div'); d.className='draggable'; d.textContent=l.name; d.title='Écouter'; d.draggable=true; d.dataset.name=l.name;
    d.onclick=()=> playLetterAudioByName(l.name);
    src.appendChild(d);
    const drop=document.createElement('div'); drop.className='drop'; drop.textContent=l.ar; drop.dataset.name=l.name;
    drop.onclick=()=> playLetterAudioByName(l.name);
    dst.appendChild(drop);
  });
  [...src.children].forEach(d=> d.addEventListener('dragstart',e=> e.dataTransfer.setData('text', d.dataset.name)));
  [...dst.children].forEach(drop=>{
    drop.addEventListener('dragover',e=> e.preventDefault());
    drop.addEventListener('drop',e=>{
      e.preventDefault(); const name=e.dataTransfer.getData('text'); tries++;
      if(name===drop.dataset.name){
        good++; drop.textContent = drop.textContent+' ✔'; drop.style.borderColor='var(--success)';
        const el = src.querySelector(`[data-name="${name}"]`); if(el) el.remove();
        $('#match-feedback').textContent='✅ Bien joué !'; playLetterAudioByName(name); gainXP(loadProfile(),6);
      } else { $('#match-feedback').textContent='❌ Dommage.'; }
      liveNote('match', good, tries, 'note-match');
      if(good===pick.length){ unlockBadge(loadProfile(), 'Maître des associations', '🧩'); }
    });
  });
}

// TRACE (écoute + canvas)
function gameTrace(){
  gameArea.innerHTML = `
    <div class="card" style="padding:1rem">
      <h3>✍️ Trace la lettre (avec audio)</h3>
      <div class="trace-wrap">
        <div class="guideline" id="trace-guide">ا</div>
        <canvas id="trace-canvas" width="600" height="280"></canvas>
      </div>
      <div style="display:flex; gap:.5rem; margin-top:.6rem">
        <button class="btn" id="trace-hear">Écouter</button>
        <button class="btn" id="trace-clear">Effacer</button>
        <button class="btn primary" id="trace-next">Lettre suivante</button>
      </div>
      <p id="trace-feedback"></p>
      <div id="note-trace"></div>
    </div>`;
  let idx = Math.floor(Math.random()*LETTERS.length);
  const guide = $('#trace-guide');
  function setGuide(){ guide.textContent = LETTERS[idx].ar; playLetterAudioByName(LETTERS[idx].name); }
  setGuide();

  const cvs = $('#trace-canvas'), ctx = cvs.getContext('2d');
  let drawing=false;
  cvs.addEventListener('pointerdown',e=>{ drawing=true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); });
  cvs.addEventListener('pointermove',e=>{ if(!drawing) return; ctx.lineWidth=10; ctx.lineCap='round'; ctx.strokeStyle='#5b6dff'; ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); });
  window.addEventListener('pointerup',()=> drawing=false);
  $('#trace-clear').onclick=()=> ctx.clearRect(0,0,cvs.width,cvs.height);
  $('#trace-next').onclick=()=>{ idx = (idx+1)%LETTERS.length; setGuide(); ctx.clearRect(0,0,cvs.width,cvs.height); gainXP(loadProfile(),5); $('#trace-feedback').textContent='✨ Super !'; liveNote('trace',(window.__good_trace||0)+1,(window.__tries_trace||0)+1,'note-trace'); };
  $('#trace-hear').onclick = ()=> playLetterAudioByName(LETTERS[idx].name);
}

// ===== Notes live + suivi simple =====
function liveNote(kind, good, tries, boxId){
  window['__good_'+kind] = good;
  window['__tries_'+kind] = tries;
  const hostSel = '#game-area';
  const host = document.querySelector(hostSel);
  let box = document.getElementById(boxId);
  if(!box){ box = document.createElement('div'); box.id=boxId; box.className='inline-result'; box.style.marginTop='.6rem'; box.style.padding='.7rem .9rem'; box.style.background='#f8fbff'; box.style.border='1px solid #e6e9ff'; box.style.borderRadius='12px'; host.appendChild(box); }
  const fautes = Math.max(0, tries-good), total = tries, note20 = total ? Math.round((good/total)*20*100)/100 : 0;
  box.innerHTML = `⭐ <strong>${good}</strong> bonnes · ❌ <strong>${fautes}</strong> fautes · 🎯 <strong>${total}</strong> tentatives — <strong>${note20}/20</strong>`;
  if (tries>0 && tries%20===0){
    record(kind, note20, good, fautes, total);
  }
}
function record(kind, note20, good, wrong, total){
  const p = loadProfile(); if(!p) return;
  const titles = {quiz:'Trouve la lettre (audio)', match:'Associe (audio)', trace:'Trace (audio)'};
  p.history.push({ quizId:kind, title:titles[kind]||kind, note20, good, wrong, total, dateISO:new Date().toISOString() });
  saveProfile(p);
}

// ===== Confetti mini =====
function confetti(){
  const root = document.getElementById('confetti');
  const n = 30;
  for(let i=0;i<n;i++){
    const s = document.createElement('span');
    s.textContent='•'; s.style.position='absolute'; s.style.left=(Math.random()*100)+'%';
    s.style.top='-10px'; s.style.fontSize=(8+Math.random()*18)+'px';
    s.style.color = ['#5b6dff','#8a9bff','#ff8fab','#ffd166','#06d6a0'][Math.floor(Math.random()*5)];
    s.style.transition='transform 1.4s ease, opacity 1.4s ease';
    root.appendChild(s);
    requestAnimationFrame(()=>{ s.style.transform = `translateY(${window.innerHeight}px) translateX(${(Math.random()*80-40)}px)`; s.style.opacity='0'; });
    setTimeout(()=> s.remove(), 1600);
  }
}

// ===== Nav & init =====
document.querySelectorAll('.game').forEach(btn=> btn.onclick = ()=>{ show('play'); const game = btn.dataset.game; if(game==='quiz') gameQuiz(); if(game==='match') gameMatch(); if(game==='trace') gameTrace(); });
$('#btn-export').onclick = ()=>{ const p = loadProfile(); $('#export-json').value = JSON.stringify(p||{}, null, 2); };
$('#btn-reset').onclick = ()=>{ localStorage.removeItem(STORE_KEY); location.reload(); };
function renderProfileInit(){ const p = loadProfile(); if(!p) openModal(); renderProfile(); renderBadges(); }
document.addEventListener('DOMContentLoaded', ()=>{ buildAvatars(); renderProfileInit(); });
