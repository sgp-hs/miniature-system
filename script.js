let currentYear = 2025;
let currentMainMode = 'semester'; // semester | group
let currentSemesterIndex = 0;
let currentSubjectGroup = '국어';

function startApp(year) {
    currentYear = year;
    currentMainMode = 'semester';
    currentSemesterIndex = 0;
    currentSubjectGroup = '국어';

    document.getElementById('nav-year-title').innerText = `${year}학년도 선택과목 안내`;
    document.body.style.overflow = 'auto';

    document.getElementById('intro-screen').style.transform = 'translateY(-100%)';

    const mainContainer = document.getElementById('main-container');
    mainContainer.style.display = 'flex';

    setTimeout(() => {
        mainContainer.style.opacity = '1';
    }, 50);

    renderMainView();
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

    if (target) {
        target.style.display = 'block';
        target.classList.add('active');
        window.scrollTo(0, 0);
    }
}

function getCurrentSemesterData() {
    return currentYear === 2025 ? getSemesterData2025() : getSemesterData2026();
}

function setMainMode(mode) {
    currentMainMode = mode;

    if (mode === 'semester') {
        currentSemesterIndex = 0;
    }

    if (mode === 'group') {
        currentSubjectGroup = '국어';
    }

    renderMainView();
}

function setSemester(index) {
    currentSemesterIndex = index;
    renderMainView();
}

function setSubjectGroup(groupName) {
    currentSubjectGroup = groupName;
    renderMainView();
}

/* =========================================
   메인 화면 렌더링
   ========================================= */

function renderMainView() {
    const container = document.getElementById('accordion-container');

    if (!container) return;

    let html = `
        <div class="view-mode-box">
            <button class="view-mode-btn ${currentMainMode === 'semester' ? 'active' : ''}" onclick="setMainMode('semester')">
                📅 학기별 보기
            </button>
            <button class="view-mode-btn ${currentMainMode === 'group' ? 'active' : ''}" onclick="setMainMode('group')">
                📚 교과군별 보기
            </button>
        </div>
    `;

    if (currentMainMode === 'semester') {
        html += renderSemesterView();
    } else {
        html += renderSubjectGroupView();
    }

    container.innerHTML = html;
}

/* =========================================
   학기별 보기
   ========================================= */

function renderSemesterView() {
    const data = getCurrentSemesterData();

    const tabHtml = data.map((sem, index) => {
        const label = sem.title.replace('▶', '').replace('편성표', '').trim();

        return `
            <button class="semester-tab ${currentSemesterIndex === index ? 'active' : ''}" onclick="setSemester(${index})">
                ${label}
            </button>
        `;
    }).join('');

    const selectedSemester = data[currentSemesterIndex];

    return `
        <div class="semester-tabs">
            ${tabHtml}
        </div>

        <div class="selected-view-title">
            <h2>${selectedSemester.title.replace('▶', '').trim()}</h2>
            <p>과목명을 클릭하면 과목의 성격, 주요 내용, 진로 정보를 볼 수 있습니다.</p>
        </div>

        ${renderSemesterPanel(selectedSemester)}
    `;
}

function renderSemesterPanel(sem) {
    let mandatoryHtml = renderSubjectTable(sem.mandatory || [], '학교 지정');

    let electiveHtml = '';

    if (sem.electives && sem.electives.length > 0) {
        electiveHtml = sem.electives.map(group => {
            return `
                <div class="rule-block-vertical">
                    <div class="rule-desc-header">${group.rule.replace(/\n/g, '<br>')}</div>
                    ${renderSubjectTable(group.subjects || [], '학생 선택')}
                </div>
            `;
        }).join('');
    } else {
        electiveHtml = `
            <div class="empty-message">
                해당 학기에는 학생 선택 과목이 없습니다.
            </div>
        `;
    }

    return `
        <div class="subject-group group-mandatory">
            <div class="group-title">📌 학교 지정 과목</div>
            ${mandatoryHtml}
        </div>

        <div class="subject-group group-elective">
            <div class="group-title">✅ 학생 선택 과목</div>
            ${electiveHtml}
        </div>
    `;
}

function renderSubjectTable(subjects, placement) {
    if (!subjects || subjects.length === 0) {
        return `
            <div class="empty-message">
                해당 과목이 없습니다.
            </div>
        `;
    }

    const rows = subjects.map(sub => {
        const noteBadge = sub.note ? `<span class="subject-note-badge">${getShortNote(sub.note)}</span>` : '';
        const subjectCellContent = renderSubjectNameButtons(sub);
        const evalTargetName = getEvalTargetName(sub.n);

        return `
            <tr>
                <td>${sub.g}</td>
                <td>${sub.t}</td>
                <td style="text-align:left; padding-left:15px;">${subjectCellContent} ${noteBadge}</td>
                <td>${sub.c}</td>
                <td>${getShortEval(evalTargetName, sub.g, sub.t)}</td>
            </tr>
        `;
    }).join('');

    return `
        <table class="inner-table">
            <thead>
                <tr>
                    <th width="15%">교과군</th>
                    <th width="15%">구분</th>
                    <th width="40%">과목명</th>
                    <th width="10%">학점</th>
                    <th width="20%">성적처리</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}

/* =========================================
   교과군별 보기
   ========================================= */

function renderSubjectGroupView() {
    const groupList = [
        '국어',
        '수학',
        '영어',
        '사회',
        '과학',
        '체육',
        '예술',
        '정보',
        '제2외국어',
        '교양'
    ];

    const groupButtonHtml = groupList.map(group => {
        return `
            <button class="subject-group-tab ${currentSubjectGroup === group ? 'active' : ''}" onclick="setSubjectGroup('${group}')">
                ${group}
            </button>
        `;
    }).join('');

    const rows = collectSubjectsByGroup(currentSubjectGroup);

    let tableHtml = '';

    if (rows.length === 0) {
        tableHtml = `
            <div class="empty-message">
                ${currentSubjectGroup} 교과군에 해당하는 과목이 없습니다.
            </div>
        `;
    } else {
        tableHtml = renderGroupSubjectTable(rows);
    }

    return `
        <div class="subject-group-tabs">
            ${groupButtonHtml}
        </div>

        <div class="selected-view-title">
            <h2>📚 ${currentSubjectGroup} 교과군 과목</h2>
            <p>학년·학기와 편성 형태를 확인하고, 과목명을 클릭하면 상세 정보를 볼 수 있습니다.</p>
        </div>

        ${tableHtml}
    `;
}

function collectSubjectsByGroup(groupName) {
    const data = getCurrentSemesterData();
    const result = [];

    data.forEach(sem => {
        const semesterLabel = sem.title
            .replace('▶', '')
            .replace('편성표', '')
            .trim();

        if (sem.mandatory && sem.mandatory.length > 0) {
            sem.mandatory.forEach(sub => {
                if (isSameGroup(sub.g, groupName)) {
                    result.push({
                        ...sub,
                        semester: semesterLabel,
                        placement: '학교 지정',
                        rule: ''
                    });
                }
            });
        }

        if (sem.electives && sem.electives.length > 0) {
            sem.electives.forEach(electiveGroup => {
                if (electiveGroup.subjects && electiveGroup.subjects.length > 0) {
                    electiveGroup.subjects.forEach(sub => {
                        if (isSameGroup(sub.g, groupName)) {
                            result.push({
                                ...sub,
                                semester: semesterLabel,
                                placement: '학생 선택',
                                rule: electiveGroup.rule || ''
                            });
                        }
                    });
                }
            });
        }
    });

    return result;
}

function isSameGroup(originalGroup, selectedGroup) {
    if (selectedGroup === '정보') {
        return originalGroup === '기술·가정/정보';
    }

    return originalGroup === selectedGroup;
}

function renderGroupSubjectTable(rows) {
    const rowHtml = rows.map(sub => {
        const noteBadge = sub.note ? `<span class="subject-note-badge">${getShortNote(sub.note)}</span>` : '';
        const subjectCellContent = renderSubjectNameButtons(sub);

        return `
            <tr>
                <td style="text-align:left; padding-left:15px;">${subjectCellContent} ${noteBadge}</td>
                <td>${sub.semester}</td>
                <td><span class="placement-badge ${sub.placement === '학교 지정' ? 'mandatory' : 'elective'}">${sub.placement}</span></td>
                <td>${sub.t}</td>
                <td>${sub.c}</td>
            </tr>
        `;
    }).join('');

    return `
        <table class="inner-table group-view-table">
            <thead>
                <tr>
                    <th width="34%">과목명</th>
                    <th width="22%">학년/학기</th>
                    <th width="18%">편성</th>
                    <th width="14%">구분</th>
                    <th width="12%">학점</th>
                </tr>
            </thead>
            <tbody>
                ${rowHtml}
            </tbody>
        </table>
    `;
}

/* =========================================
   과목명 버튼 공통 처리
   음악 ↔ 미술처럼 묶인 과목도 각각 클릭 가능
   ========================================= */

function renderSubjectNameButtons(sub) {
    if (sub.n.includes('↔')) {
        const parts = sub.n.split('↔').map(p => p.trim());

        const buttons = parts.map(p => {
            return `
                <button class="inner-sub-btn subject-name-fixed" onclick="renderSubjectDetail('${p}', '${sub.g}', '${sub.t}')">
                    ${p}
                </button>
            `;
        }).join('<span class="subject-swap-mark">↔</span>');

        return `<div class="subject-name-wrap">${buttons}</div>`;
    }

    return `
        <div class="subject-name-wrap">
            <button class="inner-sub-btn subject-name-fixed" onclick="renderSubjectDetail('${sub.n}', '${sub.g}', '${sub.t}')">
                ${sub.n}
            </button>
        </div>
    `;
}

function getEvalTargetName(subjectName) {
    if (subjectName.includes('↔')) {
        return subjectName.split('↔')[0].trim();
    }

    return subjectName;
}

/* =========================================
   note 표시 줄이기
   고시외 과목 → 고시외
   과학 계열 → 과학계열
   ========================================= */

function getShortNote(note) {
    if (!note) return '';

    const noteMap = {
        '고시외 과목': '고시외',
        '과학 계열': '과학계열',
        '체육 계열': '체육계열',
        '예술 계열': '예술계열',
        '전문 교과': '전문교과'
    };

    return noteMap[note] || note;
}

/* =========================================
   수능 및 평가 방식 자동 판별
   ========================================= */

function getEvalRule(subjectName, groupName, subjectType) {
    let evalLabel = '5단계 / 석차 5등급';
    let evalBadgeClass = 'grade5';
    let suneungClass = 'excluded';
    let suneungText = '수능 미출제';

    const pureName = subjectName
        .replace(' ↔ 미술', '')
        .replace(' ↔ 음악', '')
        .replace('1·2', '1')
        .trim();

    const csatSubjects = [
        "화법과 언어",
        "독서와 작문",
        "문학",
        "대수",
        "미적분Ⅰ",
        "확률과 통계",
        "영어Ⅰ",
        "영어Ⅱ",
        "한국사1",
        "한국사2",
        "통합사회1",
        "통합사회2",
        "통합과학1",
        "통합과학2",
        "일본어",
        "중국어"
    ];

    if (csatSubjects.includes(pureName)) {
        suneungClass = 'included';

        if (pureName === "일본어" || pureName === "중국어") {
            suneungText = '수능 출제 / 제2외국어';
        } else {
            suneungText = '수능 출제';
        }
    }

    if (groupName === '교양') {
        evalLabel = 'P/F / 등급 미산출';
        evalBadgeClass = 'pf';
    } else if (groupName === '체육' || groupName === '예술' || pureName.includes('과학탐구실험')) {
        if (pureName.includes('전공 실기')) {
            evalLabel = '5단계 / 석차 5등급';
            evalBadgeClass = 'grade5';
        } else {
            evalLabel = '3단계 / 등급 미산출';
            evalBadgeClass = 'grade3';
        }
    } else {
        const noRankFusion = [
            "사회문제 탐구",
            "금융과 경제생활",
            "윤리문제 탐구",
            "기후변화와 환경생태",
            "기후변화와 지속가능한 세계",
            "역사로 탐구하는 현대 세계",
            "과학의 역사와 문화",
            "융합과학 탐구"
        ];

        if (noRankFusion.includes(pureName)) {
            evalLabel = '5단계 / 등급 미산출';
            evalBadgeClass = 'norank';
        } else {
            evalLabel = '5단계 / 석차 5등급';
            evalBadgeClass = 'grade5';
        }
    }

    const evalText = `<span class="eval-badge ${evalBadgeClass}">${evalLabel}</span>`;

    return {
        evalLabel,
        evalBadgeClass,
        evalText,
        suneungClass,
        suneungText
    };
}

function getShortEval(subjectName, groupName, subjectType) {
    return getEvalRule(subjectName, groupName, subjectType).evalText;
}

/* =========================================
   상세 내용에서 반복 배지 제거
   ========================================= */

function cleanContentItem(item) {
    if (!item) return '';

    return item
        .replace(/<span class=['"]k-tag k-know['"]>학습 내용<\/span>/g, '')
        .replace(/<span class=['"]k-tag k-skill['"]>과정·기능<\/span>/g, '')
        .replace(/<span class=['"]k-tag k-know['"]>지식·이해<\/span>/g, '')
        .trim();
}

/* =========================================
   과목 상세 화면
   ========================================= */

function renderSubjectDetail(subjectName, groupName, subjectType) {
    const viewDetail = document.getElementById('view-detail');
    const { evalLabel, evalBadgeClass, evalText, suneungClass, suneungText } = getEvalRule(subjectName, groupName, subjectType);

    let pureName = subjectName.replace('1·2', '1').trim();

    let sd =
        detailedData[subjectName] ||
        detailedData[pureName] ||
        groupDefaults[groupName] ||
        {
            careers: ["실무 전문가", "교육기획자", "융합 산업 종사자"],
            majors: [`${groupName} 관련 전공`]
        };

    const goal = sd.goal || `<b>${subjectName}</b> 과목은 ${groupName} 분야의 핵심 개념을 탐구하며 비판적 사고력을 길러주는 과목입니다.`;

    let contentsHtml = '';

    if (sd.contents) {
        const colors = ['blue', 'green', 'yellow'];

        sd.contents.forEach((c, idx) => {
            const color = colors[idx % colors.length];
            const listHtml = c.l.map(item => `<li>${cleanContentItem(item)}</li>`).join('');

            contentsHtml += `
                <div class="content-box ${color}">
                    <h4>${c.t}</h4>
                    <ul class="content-list">${listHtml}</ul>
                </div>
            `;
        });
    } else {
        contentsHtml = `
            <div class="content-box blue">
                <h4>📌 영역: 기초 학문 탐구</h4>
                <ul class="content-list">
                    <li>핵심 원리 파악 및 이론적 배경 탐구</li>
                </ul>
            </div>
            <div class="content-box green">
                <h4>📌 영역: 심화 탐구 및 응용</h4>
                <ul class="content-list">
                    <li>비판적 사고 및 융합적 문제 해결 실습 수행</li>
                </ul>
            </div>
        `;
    }

    const careerTagsHtml = (sd.careers || []).map(job => `<span class="career-tag">${job}</span>`).join('');

    const majorListHtml = (sd.majors || []).map(mj => {
        const longClass = mj.length >= 11 ? ' long-major' : '';
        return `<li class="${longClass}">${mj}</li>`;
    }).join('');

    viewDetail.innerHTML = `
        <div class="detail-card" style="animation: fadeIn 0.3s ease-out;">
            <div class="top-nav" style="padding: 10px 0 8px 0; border-bottom:3px solid var(--primary-color); margin-bottom: 16px;">
                <div>
                    <span class="subject-badge">${groupName} | ${subjectType}</span>
                    <h1 class="detail-title">${subjectName}</h1>
                </div>
                <button class="btn-action home" onclick="showView('view-accordion')">← 목록으로</button>
            </div>

            <div class="detail-layout">
                <div class="detail-main">
                    <section>
                        <h2 class="section-title">📘 어떤 과목인가요?</h2>
                        <p class="section-desc">${goal}</p>
                    </section>

                    <section>
                        <h2 class="section-title">📝 무엇을 배우나요?</h2>
                        <div>${contentsHtml}</div>
                    </section>
                </div>

                <div class="detail-side">
                    <div class="eval-box">
                        <div style="font-size:1.05rem; font-weight:900; margin-bottom:12px; color:#1e293b;">
                            📋 평가 정보
                        </div>
                        <div class="eval-chip-row">
                            <span class="eval-chip ${suneungClass}">${suneungText}</span>
                            <span class="eval-chip ${evalBadgeClass}">${evalLabel}</span>
                        </div>
                    </div>

                    <div class="career-box" style="background:white; border:1px solid #e2e8f0; border-radius:16px; padding:22px; box-shadow:0 4px 10px rgba(0,0,0,0.03);">
                        <h4 style="margin: 0 0 10px 0; font-size:1.05rem; color:#1e293b;">💼 관련 직업</h4>
                        <div class="career-tags" style="display:flex; flex-wrap:wrap; gap:8px;">
                            ${careerTagsHtml}
                        </div>

                        <h4 style="margin: 24px 0 10px 0; font-size:1.05rem; color:#1e293b;">🎓 관련 학과</h4>
                        <ul class="major-list">
                            ${majorListHtml}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;

    showView('view-detail');
    window.scrollTo(0, 0);
}