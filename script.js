const GROQ_API = "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";

// --- SECURITY ---
if (!localStorage.getItem('pass_yusuf')) localStorage.setItem('pass_yusuf', '1313');
if (!localStorage.getItem('pass_saleh')) localStorage.setItem('pass_saleh', '7777');
if (!localStorage.getItem('pass_admin')) localStorage.setItem('pass_admin', '39320008');

let authStates = { yusuf: false, saleh: false, admin: false };
let currentUser = null;
let chatHistory = [];

// --- LIBRARIES ---
const YUSUF_LIB = [
    { t: "استقامة أسفل الظهر", d: "تمرين تمدد الكوبرا لتقليل انحناء الظهر الزائد.", img: "posture_stretch_exercise_1776066786842.png", b: "يعدل بروز الظهر والمشية." },
    { t: "مشية الوقار الثابتة", d: "المشي مع جعل الصدر للأعلى وتثبيت الحوض.", img: "walking_posture_exercise_1776066906087.png", b: "يمنع 'النط' في المشية." },
    { t: "تمرين ضغط الحوض", d: "الاستلقاء ورفع الحوض للأعلى وللداخل ببطء.", img: "pelvic_tilt_exercise_1776066926439.png", b: "يقوي عضلات الحوض والظهر." }
];

const SALEH_QUIZ_MASTER = [
    { q: "من هو الإمام الصادق (ع)؟", a: ["الإمام السادس", "الإمام الأول", "الإمام الرابع"], r: 0, sadiq: true },
    { q: "ما هو لقب الإمام جعفر (ع)؟", a: ["الكاظم", "الصادق", "الهادي"], r: 1, sadiq: true },
    { q: "ما اسم والد الإمام الصادق (ع)؟", a: ["الإمام الباقر (ع)", "الإمام علي (ع)", "الإمام السجاد (ع)"], r: 0, sadiq: true }
];

const YUSUF_GAMES_MASTER = [
    { s: "شخص يسألك سؤالاً خاصاً جداً لا تريد الإجابة عليه؟", o: ["أجاوب بخجل", "أقول بوقار: هذا أمر خاص لا أحب الحديث عنه", "أغضب"], r: 1 }
];

// --- MODAL ---
const modalOverlay = document.getElementById('modal-overlay');
const modalInput = document.getElementById('modal-input');
let currentOkAction = null;

function showModal(title, body, type = 'info', onOk = null) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-body').innerText = body;
    document.getElementById('modal-input-container').style.display = (type === 'password' || type === 'text') ? 'block' : 'none';
    modalOverlay.style.display = 'flex';
    currentOkAction = onOk;
    if (type === 'password' || type === 'text') {
        modalInput.type = type === 'password' ? 'password' : 'text';
        modalInput.value = '';
        modalInput.focus();
    }
}
function closeModal() { modalOverlay.style.display = 'none'; currentOkAction = null; }

document.getElementById('modal-btn-ok').onclick = () => { if (currentOkAction) currentOkAction(modalInput.value); closeModal(); };
document.getElementById('modal-btn-cancel').onclick = closeModal;

// --- ROUTER ---
window.addEventListener('hashchange', router);
window.onload = router;

function router() {
    const hash = window.location.hash || '#/';
    if (hash === '#/abo.ali12') {
        if (!authStates.admin) { showLoginGate('admin'); return; }
        renderPage('page-admin');
        renderAdminSettings();
        return;
    }
    if (hash === '#/') {
        renderPage('page-home');
        document.getElementById('app-header').style.display = 'none';
        document.getElementById('chat-widget').style.display = 'none';
    } else {
        const u = hash.replace('#', '');
        if (!authStates[u]) { window.location.hash = '#/'; return; }
        currentUser = u;
        renderPage('page-' + u);
        if (u === 'yusuf') renderYusuf(); else renderSaleh();
    }
}

function renderPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.getElementById('app-header').style.display = id === 'page-home' ? 'none' : 'flex';
    document.getElementById('chat-widget').style.display = (id === 'page-yusuf' || id === 'page-saleh') ? 'block' : 'none';
    document.getElementById('header-user-name').innerText = id.replace('page-', '').toUpperCase();
}

function showLoginGate(user) {
    showModal(`دخول ${user}`, "أدخل الرمز السري:", 'password', (pass) => {
        if (pass.trim() === localStorage.getItem('pass_' + user).trim()) {
            authStates[user] = true;
            const target = user === 'admin' ? '#/abo.ali12' : '#' + user;
            if (window.location.hash === target) router();
            else window.location.hash = target;
        } else {
            showModal("❌ خطأ", "الرمز غير صحيح.");
            window.location.hash = '#/';
        }
    });
}
function logout() { authStates = { yusuf: false, saleh: false, admin: false }; window.location.hash = '#/'; window.location.reload(); }

// --- GAMES & STATS ---
function addXP(u, amt, btn) {
    let xp = parseInt(localStorage.getItem(u+'_xp')) || 0; let lvl = parseInt(localStorage.getItem(u+'_level')) || 1;
    xp += amt; if(xp>=100){ xp=0; lvl++; showModal("🆙 تقدم!", `مستوى ${lvl}!`); }
    localStorage.setItem(u+'_xp', xp); localStorage.setItem(u+'_level', lvl);
    if(btn) { btn.disabled = true; btn.innerText = "✅"; }
    updateStats(u);
}
function updateStats(u) {
    const xp = parseInt(localStorage.getItem(u+'_xp')) || 0; const lvl = parseInt(localStorage.getItem(u+'_level')) || 1;
    const l = u[0];
    if(document.getElementById(l+'-lvl')) document.getElementById(l+'-lvl').innerText = lvl;
    if(document.getElementById(l+'-xp-bar')) document.getElementById(l+'-xp-bar').style.width = xp+'%';
}

function renderYusuf() {
    updateStats('yusuf');
    const day = new Date().getDate();
    document.getElementById('y-missions').innerHTML = `
        <div class="item-card glass"><h3>مهمة بناء الشخصية</h3><p>${YUSUF_LIB[day%YUSUF_LIB.length].t}</p><button class="btn success" onclick="addXP('yusuf',25,this)">تم الإنجاز ✅</button></div>`;
    renderYGame();
}
function renderYGame() {
    const q = YUSUF_GAMES_MASTER[0];
    const box = document.getElementById('y-game');
    box.innerHTML = `<div class="section-title">🎮 اختبار الكاريزما</div>
        <div class="item-card glass" id="y-opts"><p>${q.s}</p>${q.o.map((o,i)=>`<button class="btn" style="background:rgba(255,255,255,0.05)" onclick="checkY(${i},${q.r},this)">${o}</button>`).join('')}</div>`;
}
function checkY(idx, correct, btn) {
    const btns = document.getElementById('y-opts').querySelectorAll('button');
    btns.forEach((b,i)=>{ b.disabled=true; if(i===correct) b.style.background='#10b981'; else if(i===idx) b.style.background='#f43f5e'; });
    setTimeout(()=>renderYGame(), 2000); if(idx===correct) addXP('yusuf',20);
}

function renderSaleh() {
    updateStats('saleh');
    document.getElementById('s-missions').innerHTML = `<div class="item-card glass"><h3>مهمة الصلاة</h3><p>الخشوع التام في صلاة الظهرين</p><button class="btn success" onclick="addXP('saleh',30,this)">تم ✅</button></div>`;
    renderSQuiz();
}
function renderSQuiz() {
    const q = SALEH_QUIZ_MASTER[0];
    const box = document.getElementById('s-game');
    box.innerHTML = `<div class="section-title">🕌 مسابقة الإمام الصادق</div>
        <div class="item-card glass" id="sq-box"><p>${q.q}</p><div id="sq-as">${q.a.map((o,i)=>`<button class="btn" style="background:rgba(255,255,255,0.05)" onclick="checkS(${i},${q.r},0,1,this)">${o}</button>`).join('')}</div></div>`;
}
function checkS(idx, correct, qIdx, total, btn) {
    const btns = document.getElementById('sq-as').querySelectorAll('button');
    btns.forEach((b,i)=>{ b.disabled=true; if(i===correct) b.style.background='#10b981'; else if(i===idx) b.style.background='#f43f5e'; });
    setTimeout(()=>{ if(idx===correct) addXP('saleh',15); renderSQuiz(); }, 2000);
}

// --- ADMIN ---
function renderAdminSettings() {
    const pY=localStorage.getItem('pass_yusuf'), pS=localStorage.getItem('pass_saleh'), pA=localStorage.getItem('pass_admin');
    const box = document.getElementById('admin-sets') || document.createElement('div');
    box.id = 'admin-sets'; document.querySelector('.admin-card').appendChild(box);
    box.innerHTML = `<div style="margin-top:2rem; border-top:1px solid var(--border); padding-top:1rem"><h3>🔐 الرموز</h3>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px"><button class="btn" onclick="changeP('yusuf')">يوسف (${pY})</button><button class="btn" onclick="changeP('saleh')">صالح (${pS})</button></div></div>`;
}
function changeP(u) { showModal("تغيير القفل", `الرمز الجديد لـ ${u}:`, 'text', (n) => { localStorage.setItem('pass_'+u, n); renderAdminSettings(); }); }
function switchAdminTab(t) { document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active')); event.target.classList.add('active'); }

// --- AI CHAT (FIXED SPACING) ---
async function handleSend() {
    const input = document.getElementById('chat-input'); const text = input.value.trim(); if (!text) return;
    const msgs = document.getElementById('chat-msgs');
    const uDiv = document.createElement('div'); uDiv.className = 'msg u-msg'; uDiv.textContent = text;
    msgs.appendChild(uDiv); msgs.scrollTop = msgs.scrollHeight; input.value = '';

    chatHistory.push({ role: "system", content: "أنت مدرب يوسف وصالح. رد بصوت وقور ومناسب للعمر. حافظ على المسافات بين الكلمات." });
    chatHistory.push({ role: "user", content: text });
    
    const aiDiv = document.createElement('div'); aiDiv.className = 'msg ai-msg'; aiDiv.textContent = "...";
    msgs.appendChild(aiDiv); msgs.scrollTop = msgs.scrollHeight;

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API}` },
            body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: chatHistory, temperature: 0.6 })
        });
        const data = await res.json();
        const msg = data.choices[0].message.content; 
        aiDiv.textContent = "";
        let i = 0;
        function type() { 
            if(i < msg.length) { 
                const char = msg[i++];
                aiDiv.textContent += char; 
                msgs.scrollTop = msgs.scrollHeight; 
                setTimeout(type, 25); 
            } 
        }
        type(); chatHistory.push({ role: "assistant", content: msg });
    } catch (e) { aiDiv.textContent = "عذراً!"; }
}
function toggleChat() { document.getElementById('chat-box').classList.toggle('open'); }
function submitAdminNote(t){ showModal("✅", "تم الحفاظ"); }
