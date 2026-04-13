const GROQ_API = "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";

// --- SECURITY ---
if (!localStorage.getItem('pass_yusuf')) localStorage.setItem('pass_yusuf', '1313');
if (!localStorage.getItem('pass_saleh')) localStorage.setItem('pass_saleh', '7777');
if (!localStorage.getItem('pass_admin')) localStorage.setItem('pass_admin', '39320008');

let authStates = { yusuf: false, saleh: false, admin: false };
let currentUser = null;
let chatHistory = [];

// --- EXERCISE POOL ---
const YUSUF_LIB = [
    { t: "استقامة أسفل الظهر", d: "تمرين تمدد الكوبرا لتقليل انحناء الظهر الزائد.", img: "posture_stretch_exercise_1776066786842.png", b: "يعدل بروز الظهر والمشية." },
    { t: "مشية الوقار الثابتة", d: "المشي مع جعل الصدر للأعلى وتثبيت الحوض.", img: "walking_posture_exercise_1776066906087.png", b: "يمنع 'النط' في المشية." },
    { t: "تمرين ضغط الحوض", d: "الاستلقاء ورفع الحوض للأعلى وللداخل ببطء.", img: "pelvic_tilt_exercise_1776066926439.png", b: "يقوي عضلات الحوض والظهر." },
    { t: "الصمت الكاريزمي", d: "حاول اليوم ألا تتحدث في أمور لا تهمك، استمع فقط.", b: "يبني هيبة عظيمة لوزنك." },
    { t: "مهمة الخصوصية", d: "لا تسأل أحداً 'أين كنت؟' أو 'ماذا تفعل؟'.", b: "يجعل الناس تحترم غموضك." }
];

const SALEH_LIB = [
    { t: "نجم الصلاة الخاشعة", d: "صلِّ بالتركيز على التربة ولا تلتفت حولك أبداً.", icon: "🕌" },
    { t: "البقاء في المسجد", d: "لا تخرج للعب بعد الأذان، ابقَ في المسجد لتصلي مع الجماعة.", icon: "👣" },
    { t: "طاعة الإخوة", d: "اسمع كلام أخيك يوسف ونفذ طلبه فوراً دون عناد.", icon: "🤝" }
];

// --- MODAL SYSTEM ---
const modalOverlay = document.getElementById('modal-overlay');
const modalInput = document.getElementById('modal-input');
let currentOkAction = null;

function showModal(title, body, isPass = false, onOk = null) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-body').innerText = body;
    document.getElementById('modal-input-container').style.display = isPass ? 'block' : 'none';
    modalOverlay.style.display = 'flex';
    currentOkAction = onOk;
    if (isPass) {
        modalInput.value = '';
        modalInput.focus();
    }
}

function closeModal() {
    modalOverlay.style.display = 'none';
    currentOkAction = null;
}

modalInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (currentOkAction) currentOkAction(modalInput.value);
        closeModal();
    }
});

document.getElementById('modal-btn-ok').onclick = () => {
    if (currentOkAction) currentOkAction(modalInput.value);
    closeModal();
};

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
    } else if (hash === '#yusuf') {
        if (!authStates.yusuf) { window.location.hash = '#/'; return; }
        currentUser = 'yusuf';
        renderPage('page-yusuf');
        renderYusuf();
    } else if (hash === '#saleh') {
        if (!authStates.saleh) { window.location.hash = '#/'; return; }
        currentUser = 'saleh';
        renderPage('page-saleh');
        renderSaleh();
    }
}

function renderPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if (id !== 'page-home') {
        document.getElementById('app-header').style.display = 'flex';
        document.getElementById('header-user-name').innerText = 
            id === 'page-admin' ? 'الإدارة' : (id === 'page-yusuf' ? 'يوسف 🎓' : 'صالح 👦🏻');
        if (id !== 'page-admin') document.getElementById('chat-widget').style.display = 'block';
    }
}

function showLoginGate(user) {
    const label = user === 'admin' ? 'الإدارة' : (user === 'yusuf' ? 'يوسف' : 'صالح');
    showModal(`دخول ${label}`, "أدخل الرمز السري للمتابعة:", true, (pass) => {
        if (pass === localStorage.getItem('pass_' + user)) {
            authStates[user] = true;
            if (window.location.hash === (user === 'admin' ? '#/abo.ali12' : '#' + user)) {
                router(); // Manual trigger if hash didn't change
            } else {
                window.location.hash = user === 'admin' ? '#/abo.ali12' : '#' + user;
            }
        } else {
            showModal("خطأ", "الرمز غير صحيح!");
            window.location.hash = '#/';
        }
    });
}

function logout() {
    authStates = { yusuf: false, saleh: false, admin: false };
    window.location.hash = '#/';
}

// --- CONTENT ---
function renderYusuf() {
    const day = new Date().getDate();
    updateStats('yusuf');
    const missions = [YUSUF_LIB[day%YUSUF_LIB.length], YUSUF_LIB[(day+1)%YUSUF_LIB.length], YUSUF_LIB[(day+2)%YUSUF_LIB.length]];
    document.getElementById('y-missions').innerHTML = missions.map(m => `
        <div class="item-card glass">
            <h3>${m.t}</h3><p style="opacity:0.7; margin:1rem 0">${m.d}</p>
            <button class="btn success item-btn" onclick="addXP('yusuf', 25, this)">تم المهمة</button>
        </div>
    `).join('');
    const exercises = YUSUF_LIB.filter(i => i.img);
    document.getElementById('y-exercises').innerHTML = exercises.map(ex => `
        <div class="item-card glass">
            <img src="${ex.img}"><h3>${ex.t}</h3><p style="opacity:0.7; font-size:0.9rem">${ex.d}</p>
            <button class="btn item-btn" onclick="addXP('yusuf', 15, this)">بدأت التمرين</button>
        </div>
    `).join('');
}

function renderSaleh() {
    const day = new Date().getDate();
    updateStats('saleh');
    const missions = [SALEH_LIB[day%SALEH_LIB.length], SALEH_LIB[(day+1)%SALEH_LIB.length], SALEH_LIB[(day+2)%SALEH_LIB.length]];
    document.getElementById('s-missions').innerHTML = missions.map(m => `
        <div class="item-card glass" style="text-align:center">
            <div style="font-size:3.5rem">${m.icon}</div><h3>${m.t}</h3><p style="opacity:0.7; margin:1rem 0">${m.d}</p>
            <button class="btn success item-btn" onclick="addXP('saleh', 30, this)">أنجزت ⭐</button>
        </div>
    `).join('');
}

function addXP(user, amount, btn) {
    let xp = parseInt(localStorage.getItem(user + '_xp')) || 0;
    let lvl = parseInt(localStorage.getItem(user + '_level')) || 1;
    xp += amount;
    if (xp >= 100) { xp = 0; lvl++; showModal("🔝 تقدم!", `أصبحت في المستوى ${lvl} يا بطل!`); }
    localStorage.setItem(user + '_xp', xp); localStorage.setItem(user + '_level', lvl);
    btn.disabled = true; btn.innerText = "✅"; updateStats(user);
}

function updateStats(user) {
    const xp = parseInt(localStorage.getItem(user + '_xp')) || 0;
    const lvl = parseInt(localStorage.getItem(user + '_level')) || 1;
    document.getElementById(user[0] + '-lvl').innerText = lvl;
    document.getElementById(user[0] + '-xp-bar').style.width = xp + '%';
    document.getElementById(user[0] + '-xp-text').innerText = xp;
}

// --- ADMIN ---
let adminTargetY = true;
function switchAdminTab(target) {
    adminTargetY = target === 'yusuf';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('admin-target-name').innerText = `توجيه مدرب ${adminTargetY ? 'يوسف' : 'صالح'}:`;
    renderAdminSettings();
}

function renderAdminSettings() {
    const pY = localStorage.getItem('pass_yusuf'), pS = localStorage.getItem('pass_saleh'), pA = localStorage.getItem('pass_admin');
    const settingsHTML = `
        <div style="margin-top:3rem; padding-top:2.5rem; border-top:1px solid var(--border)">
            <h3 style="margin-bottom:1.5rem; color:var(--primary)">🔐 إدارة الوصول والخصوصية</h3>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px">
                <button class="btn" style="background:rgba(255,255,255,0.05)" onclick="changeP('yusuf')">تغيير رمز يوسف (${pY})</button>
                <button class="btn" style="background:rgba(255,255,255,0.05)" onclick="changeP('saleh')">تغيير رمز صالح (${pS})</button>
                <button class="btn" style="background:rgba(255,255,255,0.05); grid-column: span 2" onclick="changeP('admin')">تغيير رمز الإدارة (${pA})</button>
            </div>
        </div>`;
    let box = document.getElementById('admin-settings');
    if (!box) {
        box = document.createElement('div'); box.id = 'admin-settings';
        document.getElementById('page-admin').querySelector('.admin-card').appendChild(box);
    }
    box.innerHTML = settingsHTML;
}

function changeP(u) {
    showModal("تغيير القفل", `أدخل الرمز الجديد لـ ${u}:`, true, (n) => {
        localStorage.setItem('pass_'+u, n);
        showModal("نجاح", "تم تغيير الرمز.");
        renderAdminSettings();
    });
}

function submitAdminNote(type) {
    const target = adminTargetY ? 'yusuf' : 'saleh';
    const text = document.getElementById('admin-note-input').value.trim();
    if (!text) return;
    let notes = JSON.parse(localStorage.getItem('notes_' + target)) || [];
    notes.push({ text, type, consumed: false, time: Date.now() });
    localStorage.setItem('notes_' + target, JSON.stringify(notes));
    document.getElementById('admin-note-input').value = '';
    showModal("حُفظت", "تم تسجيل الملاحظة للمدرب.");
}

function resetUserProgress() {
    const target = adminTargetY ? 'yusuf' : 'saleh';
    localStorage.removeItem(target+'_xp'); localStorage.removeItem(target+'_level'); 
    localStorage.removeItem('notes_'+target); window.location.reload();
}

// --- AI CHAT ---
function toggleChat() { document.getElementById('chat-box').classList.toggle('open'); }

async function handleSend() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    
    // Add User Bubble
    const userMsgEl = appendMsg(text, 'u-msg');
    input.value = '';

    // Clear history if user changed (Extra safety)
    if (chatHistory.length > 0 && chatHistory[0].userId !== currentUser) {
        chatHistory = [];
    }

    // Administrative context injection
    const notes = JSON.parse(localStorage.getItem('notes_' + currentUser)) || [];
    const activeNote = notes.find(n => !n.consumed);
    let instructions = "";
    if (activeNote) {
        instructions = `\n(تعليمات سرية للمدرب: المتدرب ${activeNote.text}. هذا التصرف ${activeNote.type === 'good' ? 'رائع جداً' : 'سيء جداً وغير مقبول'}. ابدأ ردك بالتعليق فوراً على هذا السلوك وتوجيهه.)`;
        activeNote.consumed = true;
        localStorage.setItem('notes_' + currentUser, JSON.stringify(notes));
    }

    const persona = currentUser === 'yusuf' ? 
        "أنت مدرب يوسف (13 سنة). بطل يحتاج بناء ثقة وتصحيح قوام. تحدث بفخامة وحكمة. ركز على ملاحظات المشرف." : 
        "أنت صديق صالح الآلي (7 سنوات). شجعه على الصلاة بخشوع وطاعة الإخوة. ركز على ملاحظات المشرف وتحدث ببساطة.";

    if (chatHistory.length === 0) {
        chatHistory.push({ role: "system", content: persona, userId: currentUser });
    }

    // Inject note into the USER's message content so the AI sees it as part of the current context
    chatHistory.push({ role: "user", content: text + instructions });

    // Limit history
    if (chatHistory.length > 15) chatHistory = [chatHistory[0], ...chatHistory.slice(-10)];

    // Add AI Bubble placeholder
    const aiMsgEl = appendMsg("...", "ai-msg");

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API}` },
            body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: chatHistory, temperature: 0.6 })
        });
        const data = await res.json();
        const aiMsg = data.choices[0].message.content.replace(/[^\u0600-\u06FF\s\d\p{P}\p{Emoji}]/gu, '');
        aiMsgEl.innerText = "";
        typeWriter(aiMsgEl, aiMsg, 0);
        chatHistory.push({ role: "assistant", content: aiMsg });
    } catch (e) { aiMsgEl.innerText = "عذراً حاول لاحقاً."; }
}

function typeWriter(el, text, i) {
    if (i < text.length) {
        el.innerHTML += text.charAt(i);
        document.getElementById('chat-msgs').scrollTop = document.getElementById('chat-msgs').scrollHeight;
        setTimeout(() => typeWriter(el, text, i + 1), 30);
    }
}

let msgCounter = 0;
function appendMsg(t, cls) {
    msgCounter++;
    const id = 'msg-' + Date.now() + '-' + msgCounter;
    const div = document.createElement('div'); div.id = id; div.className = `msg ${cls}`; div.innerText = t;
    const stream = document.getElementById('chat-msgs');
    stream.appendChild(div);
    stream.scrollTop = stream.scrollHeight;
    return div;
}
