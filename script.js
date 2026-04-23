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

// 🌟 수능 및 평가 방식 자동 판별 (2028 수능 개편안 기준)
function getEvalRule(subjectName, groupName, subjectType) {
    let evalText = '<span class="eval-badge grade5">5단계 (A~E) / 석차 5등급 산출</span>';
    let suneungClass = 'excluded';
    let suneungText = '2028 수능 미출제 ✕';

    const pureName = subjectName.replace(' ↔ 미술', '').replace(' ↔ 음악', '').replace('1·2', '1').trim();

    // 2028 수능 출제 과목 (선생님 확인 기준)
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
        suneungText = (pureName === "일본어" || pureName === "중국어") ? '2028 수능 출제 과목 ◯ (제2외국어)' : '2028 수능 출제 과목 ◯ (공통 필수)';
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
        // 처음 진입 시 모두 접혀 있도록 active 클래스 제거
        const isActive = '';
        const isBodyActive = '';

        let manTbody = '';
        if (sem.mandatory && sem.mandatory.length > 0) {
            manTbody = sem.mandatory.map(sub => {
                const noteBadge = sub.note ? `<span class="subject-note-badge">[${sub.note}]</span>` : '';
                let subjectCellContent = '';
                if (sub.n.includes('↔')) {
                    const parts = sub.n.split('↔').map(p => p.trim());
                    const btns = parts.map(p => `<button class="inner-sub-btn" style="width:auto; display:inline-block; margin-right:5px;" onclick="renderSubjectDetail('${p}', '${sub.g}', '${sub.t}')">${p}</button>`).join('↔');
                    subjectCellContent = `<div>${btns} ${noteBadge}</div>`;
                } else {
                    subjectCellContent = `<button class="inner-sub-btn" onclick="renderSubjectDetail('${sub.n}', '${sub.g}', '${sub.t}')">${sub.n} ${noteBadge}</button>`;
                }
                return `<tr><td>${sub.g}</td><td>${sub.t}</td><td>${subjectCellContent}</td><td>${sub.c}</td><td>${getShortEval(sub.n, sub.g, sub.t)}</td></tr>`;
            }).join('');
        }
        const manTable = `<table class="inner-table"><thead><tr><th width="15%">교과군</th><th width="15%">구분</th><th width="40%">과목명</th><th width="10%">학점</th><th width="20%">성적처리</th></tr></thead><tbody>${manTbody}</tbody></table>`;

        let eleHtml = '';
        if (sem.electives && sem.electives.length > 0) {
            const ruleBlocks = sem.electives.map(grp => {
                const subTbody = grp.subjects.map(sub => {
                    const noteBadge = sub.note ? `<span class="subject-note-badge">[${sub.note}]</span>` : '';
                    const subjectCellContent = `<button class="inner-sub-btn" onclick="renderSubjectDetail('${sub.n}', '${sub.g}', '${sub.t}')">${sub.n} ${noteBadge}</button>`;
                    return `<tr><td>${sub.g}</td><td>${sub.t}</td><td>${subjectCellContent}</td><td>${sub.c}</td><td>${getShortEval(sub.n, sub.g, sub.t)}</td></tr>`;
                }).join('');
                return `<div style="margin-bottom:20px;"><div class="rule-desc-header">${grp.rule.replace(/\n/g, '<br>')}</div><table class="inner-table"><tbody>${subTbody}</tbody></table></div>`;
            }).join('');
            eleHtml = `<div class="subject-group group-elective"><div class="group-title">✅ 학생 선택 과목</div>${ruleBlocks}</div>`;
        }

        html += `<div class="accordion-item"><div class="accordion-header ${isActive}" onclick="toggleAccordion(this)">${sem.title} <span class="icon">▼</span></div><div class="accordion-body ${isBodyActive}"><div class="subject-group group-mandatory"><div class="group-title">📌 학교 지정 과목</div>${manTable}</div>${eleHtml}</div></div>`;
    });
    container.innerHTML = html;
}

function renderSubjectDetail(subjectName, groupName, subjectType) {
    const viewDetail = document.getElementById('view-detail');
    const { evalText, suneungClass, suneungText } = getEvalRule(subjectName, groupName, subjectType);

    let pureName = subjectName.replace('1·2', '1').trim();
    let sd = detailedData[subjectName] || detailedData[pureName] || groupDefaults[groupName] || { careers: ["전문가"], majors: ["관련 학과"] };

    const goal = sd.goal || `${subjectName} 과목은 ${groupName} 분야의 기초를 다지는 과목입니다.`;
    let contentsHtml = '';
    if (sd.contents) {
        sd.contents.forEach((c, idx) => {
            const colors = ['blue', 'green', 'yellow'];
            const color = colors[idx % 3];
            const listHtml = c.l.map(item => `<li>${item}</li>`).join('');
            contentsHtml += `<div class="content-box ${color}"><h4>${c.t}</h4><ul class="content-list">${listHtml}</ul></div>`;
        });
    }

    viewDetail.innerHTML = `
        <div class="detail-card">
            <div class="top-nav">
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
                        <div class="suneung-badge ${suneungClass}">${suneungText}</div>
                        <div style="text-align: center;">${evalText}</div>
                    </div>
                    <div style="background:white; padding:20px; border-radius:15px; border:1px solid #eee;">
                        <h2 class="section-title" style="margin-top:0;">🧭 진로 및 진학</h2>
                        <p><strong>💼 직업:</strong> ${sd.careers.join(', ')}</p>
                        <p><strong>🎓 학과:</strong> ${sd.majors.join(', ')}</p>
                    </div>
                </div>
            </div>
        </div>`;
    showView('view-detail');
}