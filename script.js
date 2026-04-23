let currentYear = 2025;

function startApp(year) {
    currentYear = year;
    document.getElementById('nav-year-title').innerText = `${year}학년도 학기별 편제표`;
    document.body.style.overflow = 'auto'; 
    document.getElementById('intro-screen').style.transform = 'translateY(-100%)';
    const mainContainer = document.getElementById('main-container');
    mainContainer.style.display = 'flex';
    setTimeout(() => { mainContainer.style.opacity = '1'; }, 50);

    const data = year === 2025 ? getSemesterData2025() : getSemesterData2026();
    renderAccordions(data);
    showView('view-accordion');
} 

function goHome() {
    document.body.style.overflow = 'hidden';
    const mainContainer = document.getElementById('main-container');
    mainContainer.style.opacity = '0';
    setTimeout(() => { 
        mainContainer.style.display = 'none'; 
        document.getElementById('intro-screen').style.transform = 'translateY(0)'; 
    }, 500);
}

function showView(viewId) {
    document.querySelectorAll('.view-section').forEach(el => { 
        el.classList.remove('active'); 
        el.style.display = 'none'; 
    });
    const target = document.getElementById(viewId);
    if(target) { 
        target.style.display = 'block'; 
        target.classList.add('active'); 
        window.scrollTo(0, 0); 
    }
}

function toggleAccordion(element) {
    element.classList.toggle('active');
    element.nextElementSibling.classList.toggle('active');
}

// 🌟 수능 및 평가 방식 자동 판별 (2028 수능 개편안 기준 완벽 적용)
function getEvalRule(subjectName, groupName, subjectType) {
    let evalText = '<span class="eval-badge grade5">5단계 (A~E) / 석차 5등급 산출</span>';
    let suneungClass = 'excluded';
    let suneungText = '2028 수능 미출제 ✕';

    const pureName = subjectName.replace(' ↔ 미술', '').replace(' ↔ 음악', '').replace('1·2', '1').trim();

    // 🚨 2028 수능 출제 과목 (선생님 요청 기준 완벽 일치, 다른 과목들은 모두 미출제 처리)
    const csatSubjects = [
        "화법과 언어", "독서와 작문", "문학", 
        "대수", "미적분Ⅰ", "확률과 통계", 
        "영어Ⅰ", "영어Ⅱ", 
        "한국사1", "한국사2", 
        "통합사회1", "통합사회2", 
        "통합과학1", "통합과학2",
        "일본어", "중국어"
    ];

    if (csatSubjects.includes(pureName)) {
        suneungClass = 'included';
        if (pureName === "일본어" || pureName === "중국어") {
            suneungText = '2028 수능 출제 과목 ◯ (제2외국어)';
        } else {
            suneungText = '2028 수능 출제 과목 ◯ (공통 필수)';
        }
    }

    if (groupName === '교양') {
        evalText = '<span class="eval-badge pf">P/F (이수 여부) / 등급 미산출</span>';
    } else if (groupName === '체육' || groupName === '예술' || pureName.includes('과학탐구실험')) {
        if (pureName.includes('전공 실기')) {
            evalText = '<span class="eval-badge grade5">5단계 (A~E) / 석차 5등급 산출</span>';
        } else {
            evalText = '<span class="eval-badge grade3">3단계 (A~C) / 등급 미산출</span>';
        }
    } else {
        const noRankFusion = ["사회문제 탐구", "금융과 경제생활", "윤리문제 탐구", "기후 변화와 환경 생태", "기후변화와 환경생태", "기후변화와 지속가능한 세계", "역사로 탐구하는 현대 세계", "과학의 역사와 문화", "융합과학 탐구"];
        if (noRankFusion.includes(pureName)) {
            evalText = '<span class="eval-badge norank">5단계 (A~E) / 등급 미산출</span>';
        } else {
            evalText = '<span class="eval-badge grade5">5단계 (A~E) / 석차 5등급 산출</span>';
        }
    }
    return { evalText, suneungClass, suneungText };
}

function getShortEval(subjectName, groupName, subjectType) {
    return getEvalRule(subjectName, groupName, subjectType).evalText;
}

function renderAccordions(data) {
    const container = document.getElementById('accordion-container');
    let html = '';

    data.forEach((sem) => {
        // 🚨 화면 진입 시 모든 아코디언이 무조건 접혀 있도록 빈 문자열 처리
        const isActive = '';
        const isBodyActive = '';

        let manTbody = '';
        if (sem.mandatory && sem.mandatory.length > 0) {
            manTbody = sem.mandatory.map(sub => {
                const noteBadge = sub.note ? `<span class="subject-note-badge">[${sub.note}]</span>` : '';
                let subjectCellContent = '';
                let evalTargetName = sub.n;

                if (sub.n.includes('↔')) {
                    const parts = sub.n.split('↔').map(p => p.trim());
                    evalTargetName = parts[0]; 
                    const btns = parts.map(p => `<button class="inner-sub-btn inline-btn" style="width:auto; display:inline-block; margin-right:5px;" onclick="renderSubjectDetail('${p}', '${sub.g}', '${sub.t}')">${p}</button>`).join('<span style="margin:0 5px; font-weight:bold; color:#94a3b8;">↔</span>');
                    subjectCellContent = `<div style="display:flex; align-items:center;">${btns} ${noteBadge}</div>`;
                } else {
                    subjectCellContent = `<button class="inner-sub-btn" onclick="renderSubjectDetail('${sub.n}', '${sub.g}', '${sub.t}')">${sub.n} ${noteBadge}</button>`;
                }
                
                return `<tr><td>${sub.g}</td><td>${sub.t}</td><td style="text-align:left; padding-left:15px;">${subjectCellContent}</td><td>${sub.c}</td><td>${getShortEval(evalTargetName, sub.g, sub.t)}</td></tr>`;
            }).join('');
        }
        const manTable = manTbody ? `<table class="inner-table"><thead><tr><th width="15%">교과군</th><th width="15%">구분</th><th width="40%">과목명</th><th width="10%">학점</th><th width="20%">성적처리</th></tr></thead><tbody>${manTbody}</tbody></table>` : '<div style="padding:15px; color:#64748b; font-weight:bold;">지정 과목 없음</div>';

        let eleHtml = '';
        if (sem.electives && sem.electives.length > 0) {
            const ruleBlocks = sem.electives.map(grp => {
                const subTbody = grp.subjects.map(sub => {
                    const noteBadge = sub.note ? `<span class="subject-note-badge">[${sub.note}]</span>` : '';
                    let subjectCellContent = '';
                    let evalTargetName = sub.n;

                    if (sub.n.includes('↔')) {
                        const parts = sub.n.split('↔').map(p => p.trim());
                        evalTargetName = parts[0];
                        const btns = parts.map(p => `<button class="inner-sub-btn inline-btn" style="width:auto; display:inline-block; margin-right:5px;" onclick="renderSubjectDetail('${p}', '${sub.g}', '${sub.t}')">${p}</button>`).join('<span style="margin:0 5px; font-weight:bold; color:#94a3b8;">↔</span>');
                        subjectCellContent = `<div style="display:flex; align-items:center;">${btns} ${noteBadge}</div>`;
                    } else {
                        subjectCellContent = `<button class="inner-sub-btn" onclick="renderSubjectDetail('${sub.n}', '${sub.g}', '${sub.t}')">${sub.n} ${noteBadge}</button>`;
                    }
                    return `<tr><td>${sub.g}</td><td>${sub.t}</td><td style="text-align:left; padding-left:15px;">${subjectCellContent}</td><td>${sub.c}</td><td>${getShortEval(evalTargetName, sub.g, sub.t)}</td></tr>`;
                }).join('');
                return `<div class="rule-block-vertical"><div class="rule-desc-header">${grp.rule.replace(/\n/g, '<br>')}</div><table class="inner-table"><thead><tr><th width="15%">교과군</th><th width="15%">구분</th><th width="40%">과목명</th><th width="10%">학점</th><th width="20%">성적처리</th></tr></thead><tbody>${subTbody}</tbody></table></div>`;
            }).join('');
            eleHtml = `<div class="subject-group group-elective"><div class="group-title">✅ 학생 선택 과목</div><div style="background:#fff; padding:0;">${ruleBlocks}</div></div>`;
        } else {
            eleHtml = `<div style="color:#64748b; font-weight:600; padding:20px; background:#f8fafc; border-top:1px solid #cbd5e1;">해당 학기에는 학생 선택 과목이 없습니다.</div>`;
        }

        html += `<div class="accordion-item"><div class="accordion-header ${isActive}" onclick="toggleAccordion(this)">${sem.title} <span class="icon">▼</span></div><div class="accordion-body ${isBodyActive}"><div class="subject-group group-mandatory"><div class="group-title">📌 학교 지정 과목</div>${manTable}</div>${eleHtml}</div></div>`;
    });
    container.innerHTML = html;
}

function renderSubjectDetail(subjectName, groupName, subjectType) {
    const viewDetail = document.getElementById('view-detail');
    const { evalText, suneungClass, suneungText } = getEvalRule(subjectName, groupName, subjectType);

    let pureName = subjectName.replace('1·2', '1').trim();
    // data.js 파일의 detailedData 배열에서 과목 정보를 가져옵니다.
    let sd = detailedData[subjectName] || detailedData[pureName] || (typeof specificData !== 'undefined' ? specificData[subjectName] : null) || groupDefaults[groupName] || {
        careers: ["실무 전문가", "교육기획자", "융합 산업 종사자"],
        majors: [`${groupName} 관련 전공`]
    };

    const goal = sd.goal || `<b>${subjectName}</b> 과목은 ${groupName} 분야의 핵심 개념을 탐구하며 비판적 사고력을 길러주는 과목입니다.`;

    let contentsHtml = '';
    if (sd.contents) {
        const colors = ['blue', 'green', 'yellow'];
        sd.contents.forEach((c, idx) => {
            const color = colors[idx % colors.length];
            const listHtml = c.l.map(item => `<li>${item}</li>`).join('');
            contentsHtml += `<div class="content-box ${color}"><h4>${c.t}</h4><ul class="content-list">${listHtml}</ul></div>`;
        });
    } else {
        contentsHtml = `
            <div class="content-box blue"><h4>📌 영역: 기초 학문 탐구</h4><ul class="content-list"><li><span class='k-tag k-know'>지식·이해</span> 핵심 원리 파악 및 이론적 배경 탐구</li></ul></div>
            <div class="content-box green"><h4>📌 영역: 심화 탐구 및 응용</h4><ul class="content-list"><li><span class='k-tag k-skill'>과정·기능</span> 비판적 사고 및 융합적 문제 해결 실습 수행</li></ul></div>
        `;
    }

    let careerTagsHtml = (sd.careers || []).map(job => `<span class="career-tag">${job}</span>`).join('');
    let majorListHtml = (sd.majors || []).map(mj => `<li>${mj}</li>`).join('');

    viewDetail.innerHTML = `
        <div class="detail-card" style="animation: fadeIn 0.3s ease-out;">
            <div class="top-nav" style="padding: 10px 0; border-bottom:3px solid var(--primary-color); margin-bottom: 30px;">
                <div>
                    <span class="subject-badge">${groupName} | ${subjectType}</span>
                    <h1 class="detail-title">${subjectName}</h1>
                </div>
                <button class="btn-action home" onclick="showView('view-accordion')">◀ 돌아가기</button>
            </div>

            <div class="detail-layout">
                <div class="detail-main">
                    <section><h2 class="section-title">📘 과목의 성격 및 목표</h2><p class="section-desc">${goal}</p></section>
                    <section><h2 class="section-title">📝 주요 내용 체계 (2022 개정)</h2><div>${contentsHtml}</div></section>
                </div>

                <div class="detail-side">
                    <div class="eval-box">
                        <div style="font-size:1.15rem; font-weight:900; margin-bottom:15px; color:#1e293b;">📋 평가 및 수능 정보</div>
                        <div class="suneung-badge ${suneungClass}">${suneungText}</div>
                        <div style="text-align: center;">${evalText}</div>
                    </div>
                    <div class="career-box" style="background:white; border:1px solid #e2e8f0; border-radius:16px; padding:25px; box-shadow:0 4px 10px rgba(0,0,0,0.03);">
                        <h2 class="section-title" style="margin-top: 0; border-bottom: none; padding-bottom:0;">🧭 진로 및 진학 설계</h2>
                        <h4 style="margin: 20px 0 10px 0; font-size:1.1rem; color:#1e293b;">💼 관련 직업</h4>
                        <div class="career-tags" style="display:flex; flex-wrap:wrap; gap:8px;">${careerTagsHtml}</div>
                        <h4 style="margin: 30px 0 10px 0; font-size:1.1rem; color:#1e293b;">🎓 관련 학과</h4>
                        <ul class="major-list" style="list-style:none; padding:0;">${majorListHtml}</ul>
                    </div>
                </div>
            </div>
        </div>
    `;
    showView('view-detail');
    window.scrollTo(0, 0);
}