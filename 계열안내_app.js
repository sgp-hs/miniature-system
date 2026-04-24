function renderSubjects(subjectString) {
    if (!subjectString || subjectString.trim() === "") {
        return `<span style="color:#94a3b8;">-</span>`;
    }

    if (!subjectString.includes(':')) {
        return `<span style="line-height: 1.7; color: #334155;">${subjectString}</span>`;
    }

    const groups = subjectString.split('|');
    let html = '';

    groups.forEach(groupStr => {
        const parts = groupStr.split(':');
        if (parts.length < 2) return;

        const groupName = parts[0].trim();
        const subjects = parts.slice(1).join(':').trim();

        html += `
            <div style="margin-bottom: 8px; line-height: 1.7;">
                <strong style="color: var(--primary); margin-right: 6px;">[${groupName}]</strong>
                <span style="color: #334155;">${subjects}</span>
            </div>
        `;
    });

    return html;
}

function renderCourseTable(
    info,
    labels = { gen: "일반 선택", car: "진로 선택", fus: "융합 선택" }
) {
    const rows = [];

    if (info.gen && info.gen.trim() !== "") {
        rows.push(`
            <div class="sub-row">
                <div class="sub-label gen">${labels.gen}</div>
                <div class="subject-items">${renderSubjects(info.gen)}</div>
            </div>
        `);
    }

    if (info.car && info.car.trim() !== "") {
        rows.push(`
            <div class="sub-row">
                <div class="sub-label car">${labels.car}</div>
                <div class="subject-items">${renderSubjects(info.car)}</div>
            </div>
        `);
    }

    if (info.fus && info.fus.trim() !== "") {
        rows.push(`
            <div class="sub-row">
                <div class="sub-label fus">${labels.fus}</div>
                <div class="subject-items">${renderSubjects(info.fus)}</div>
            </div>
        `);
    }

    if (rows.length === 0) return "";
    return `<div class="common-sub-table">${rows.join("")}</div>`;
}

function initApp() {
    const accordion = document.getElementById('accordionMenu');
    const main = document.getElementById('mainContent');
    let isFirstField = true;

    Object.entries(categoryData).forEach(([fieldName, groups]) => {
        const item = document.createElement('div');
        item.className = 'accordion-item';

        const groupEntries = Object.entries(groups);

        const htmlGroups = groupEntries.map(([id, info], idx) => {
            return `<li><a class="tab-btn ${isFirstField && idx === 0 ? 'active' : ''}" onclick="switchTab(event, '${id}')">${info.title}</a></li>`;
        }).join('');

        item.innerHTML = `
            <button class="accordion-header ${isFirstField ? 'active' : ''}" onclick="toggleAccordion(this)">
                ${fieldName} <span>▼</span>
            </button>
            <div class="accordion-content ${isFirstField ? 'open' : ''}">
                <ul style="list-style:none;padding:0;">${htmlGroups}</ul>
            </div>
        `;

        accordion.appendChild(item);

        groupEntries.forEach(([id, info], idx) => {
            const view = document.createElement('div');
            view.id = id;
            view.className = `view-wrapper ${isFirstField && idx === 0 ? 'active' : ''}`;

            const isFreeMajor = id === "free";
            const hasMajors = Array.isArray(info.majors) && info.majors.length > 0;
            const labels = isFreeMajor
                ? { gen: "유형1", car: "유형2", fus: "선택 TIP" }
                : { gen: "일반 선택", car: "진로 선택", fus: "융합 선택" };

            const courseSection = renderCourseTable(info, labels);

            view.innerHTML = `
                <div class="field-badge">${fieldName}</div>
                <h1 class="category-title">${info.title}</h1>
                ${info.desc ? `<p class="category-desc">${info.desc}</p>` : ""}
                ${courseSection}
                ${hasMajors ? `<h2 class="major-section-title">관련 학과 탐색</h2>` : ""}
                ${hasMajors ? `<div class="major-grid" id="grid_${id}"></div>` : ""}
            `;

            main.appendChild(view);

            const grid = view.querySelector(`#grid_${id}`);
            if (grid) {
                (info.majors || []).forEach(majorName => {
                    const card = document.createElement('div');
                    card.className = 'major-card';
                    card.innerText = majorName;
                    card.onclick = () => openMajorModal(majorName);
                    grid.appendChild(card);
                });
            }
        });

        isFirstField = false;
    });
}

function toggleAccordion(btn) {
    const content = btn.nextElementSibling;
    const isOpen = content.classList.contains('open');

    document.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('open'));
    document.querySelectorAll('.accordion-header').forEach(h => h.classList.remove('active'));

    if (!isOpen) {
        content.classList.add('open');
        btn.classList.add('active');
    }
}

function switchTab(e, id) {
    document.querySelectorAll('.view-wrapper').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    if (e && e.currentTarget) e.currentTarget.classList.add('active');
}

function openMajorModal(name) {
    const data = majorData[name];
    const body = document.getElementById('modalBody');

    if (!data) {
        body.innerHTML = `
            <h1 class="modal-title">${name}</h1>
            <div class="modal-desc-box" style="text-align:center;">
                해당 학과의 상세 데이터는 현재 맵핑 중입니다.
            </div>
            <p style="text-align:center; padding:30px; color:#64748b; font-weight:700;">
                상단의 <strong>계열별 권장 선택 과목 표</strong>를 우선 참고해 주세요.
            </p>
        `;
    } else {
        const recommendHtml = Array.isArray(data.recommend)
            ? data.recommend.map(r => `<li>${r}</li>`).join('')
            : `<li>${data.recommend}</li>`;

        const careersText = Array.isArray(data.careers) ? data.careers.join(', ') : (data.careers || "");

        body.innerHTML = `
            <h1 class="modal-title">${name}</h1>
            <div class="modal-desc-box">${data.desc || ""}</div>

            <h5 class="detail-h5">💡 관련 고등학교 선택 과목 예시</h5>
            ${renderCourseTable(data.highschool || {})}

            <h5 class="detail-h5">🧐 이런 학생에게 추천</h5>
            <ul class="bullet-list">${recommendHtml}</ul>

            <h5 class="detail-h5">📖 주요 전공 교과목</h5>
            <p style="padding-left:30px; font-weight:700; color:#475569; line-height:1.8;">
                ${data.subjects || ""}
            </p>

            <h5 class="detail-h5">💼 졸업 후 진로</h5>
            <div class="info-grid">
                <div class="info-card">
                    <strong>📌 유사 학과</strong>
                    <p>${data.similar || ""}</p>
                </div>
                <div class="info-card">
                    <strong>🚀 졸업 후 진로</strong>
                    <p>${careersText}</p>
                </div>
            </div>
        `;
    }

    document.getElementById('majorModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeMajorModal() {
    document.getElementById('majorModal').classList.remove('show');
    document.body.style.overflow = 'auto';
}

window.onload = initApp;