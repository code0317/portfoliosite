document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소
    const userList = document.getElementById('userList');
    const adminMemoList = document.getElementById('adminMemoList');
    const totalUsersElement = document.getElementById('totalUsers');
    const totalMemosElement = document.getElementById('totalMemos');
    const todayMemosElement = document.getElementById('todayMemos');

    // 샘플 데이터 (실제로는 서버에서 데이터를 가져와야 함)
    const users = [
        { id: 1, name: '계정1', email: 'user1@example.com' },
        { id: 2, name: '계정2', email: 'user2@example.com' },
        { id: 3, name: '계정3', email: 'user3@example.com' }
    ];

    // 메모 데이터 가져오기
    const memos = JSON.parse(localStorage.getItem('memos')) || [];

    // 프로젝트 데이터 가져오기
    let projects = JSON.parse(localStorage.getItem('projects')) || [
        { title: '프로젝트 1', desc: '프로젝트 설명', img: 'img/1.png', tags: ['HTML','CSS','JavaScript'] },
        { title: '프로젝트 2', desc: '프로젝트 설명', img: 'img/2.png', tags: ['React','Node.js'] },
        { title: '프로젝트 3', desc: '프로젝트 설명', img: 'img/3.png', tags: ['Vue.js','Firebase'] },
        { title: '프로젝트 4', desc: '프로젝트 설명', img: 'project4.jpg', tags: ['Python','Django'] },
        { title: '프로젝트 5', desc: '프로젝트 설명', img: 'project5.jpg', tags: ['TypeScript','Next.js'] },
        { title: '프로젝트 6', desc: '프로젝트 설명', img: 'project6.jpg', tags: ['Angular','MongoDB'] },
        { title: '프로젝트 7', desc: '프로젝트 설명', img: 'project7.jpg', tags: ['PHP','MySQL'] },
        { title: '프로젝트 8', desc: '프로젝트 설명', img: 'project8.jpg', tags: ['Java','Spring'] },
    ];

    const adminProjectList = document.getElementById('adminProjectList');
    const addProjectBtn = document.getElementById('addProjectBtn');
    const projectModal = document.getElementById('projectModal');
    const closeProjectModal = document.getElementById('closeProjectModal');
    const saveProjectBtn = document.getElementById('saveProjectBtn');
    const cancelProjectBtn = document.getElementById('cancelProjectBtn');
    const projectTitleInput = document.getElementById('projectTitleInput');
    const projectDescInput = document.getElementById('projectDescInput');
    const projectImgInput = document.getElementById('projectImgInput');
    const projectTagsInput = document.getElementById('projectTagsInput');
    const projectModalTitle = document.getElementById('projectModalTitle');

    let editingProjectIndex = null;

    // 메모 슬라이드 관련 변수
    let memoSlideIndex = 0;
    const MEMOS_PER_PAGE = 3;

    // 프로젝트 슬라이드 관련 변수
    let projectSlideIndex = 0;
    const PROJECTS_PER_PAGE = 6;

    const addUserBtn = document.getElementById('addUserBtn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => {
            const name = prompt('이름을 입력하세요:');
            if (!name) return;
            const email = prompt('이메일을 입력하세요:');
            if (!email) return;
            const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
            users.push({ id: newId, name, email });
            renderUsers();
            updateStats();
        });
    }

    // 사용자 목록 렌더링
    function renderUsers() {
        userList.innerHTML = users.map(user => `
            <div class="user-item">
                <div class="name">${user.name}</div>
                <div class="email">${user.email}</div>
                <div class="actions">
                    <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">삭제</button>
                </div>
            </div>
        `).join('');
    }

    // 메모 목록 렌더링
    function renderMemos() {
        if (!adminMemoList) return;
        const total = memos.length;
        const start = memoSlideIndex * MEMOS_PER_PAGE;
        const end = start + MEMOS_PER_PAGE;
        const visibleMemos = memos.slice(start, end);
        let memosHtml = visibleMemos.map(memo => `
            <div class="memo-item">
                <div class="title">${memo.title}</div>
                <div class="content">${memo.content}</div>
                <div class="info">
                    <span>작성일: ${memo.date}</span>
                    <button class="btn btn-sm btn-danger" onclick="deleteMemo('${memo.date}')">삭제</button>
                </div>
            </div>
        `).join('');
        // 슬라이드 네비게이션 버튼
        let navHtml = '';
        if (total > MEMOS_PER_PAGE) {
            navHtml += `<div class=\"memo-slider-nav\" style=\"text-align:center;margin-top:16px;\">`;
            navHtml += `<button class=\"btn btn-sm\" id=\"memoPrevBtn\" ${memoSlideIndex === 0 ? 'disabled' : ''}>&lt;</button>`;
            navHtml += `<span style=\"margin:0 8px;\">${memoSlideIndex + 1} / ${Math.ceil(total / MEMOS_PER_PAGE)}</span>`;
            navHtml += `<button class=\"btn btn-sm\" id=\"memoNextBtn\" ${end >= total ? 'disabled' : ''}>&gt;</button>`;
            navHtml += `</div>`;
        }
        adminMemoList.innerHTML = memosHtml + navHtml;
        // 버튼 이벤트
        const prevBtn = document.getElementById('memoPrevBtn');
        const nextBtn = document.getElementById('memoNextBtn');
        if (prevBtn) prevBtn.onclick = () => { memoSlideIndex--; renderMemos(); };
        if (nextBtn) nextBtn.onclick = () => { memoSlideIndex++; renderMemos(); };
    }

    // 통계 업데이트
    function updateStats() {
        totalUsersElement.textContent = users.length;
        totalMemosElement.textContent = memos.length;
        
        const today = new Date().toISOString().split('T')[0];
        const todayMemosCount = memos.filter(memo => memo.date === today).length;
        todayMemosElement.textContent = todayMemosCount;
    }

    // 사용자 수정
    window.editUser = function(userId) {
        const user = users.find(u => u.id === userId);
        if (user) {
            const newName = prompt('새로운 이름을 입력하세요:', user.name);
            if (newName) {
                user.name = newName;
                renderUsers();
            }
        }
    };

    // 사용자 삭제
    window.deleteUser = function(userId) {
        if (confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
            const index = users.findIndex(u => u.id === userId);
            if (index !== -1) {
                users.splice(index, 1);
                renderUsers();
                updateStats();
            }
        }
    };

    // 메모 삭제
    window.deleteMemo = function(date) {
        if (confirm('정말로 이 메모를 삭제하시겠습니까?')) {
            const index = memos.findIndex(m => m.date === date);
            if (index !== -1) {
                memos.splice(index, 1);
                localStorage.setItem('memos', JSON.stringify(memos));
                renderMemos();
                updateStats();
            }
        }
    };

    function renderProjects() {
        const total = projects.length;
        const start = projectSlideIndex * PROJECTS_PER_PAGE;
        const end = start + PROJECTS_PER_PAGE;
        const visibleProjects = projects.slice(start, end);
        let projectsHtml = visibleProjects.map((p, i) => `
            <div class="project-item">
                <div class="project-info">
                    <h4>${p.title}</h4>
                    <p>${p.desc}</p>
                    <div class="tags">${p.tags.map(t=>`<span>${t}</span>`).join(' ')}</div>
                    <div class="image-name">이미지: ${p.img}</div>
                </div>
                <div class="actions">
                    <button class="btn btn-sm" onclick="editProject(${start + i})">수정</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProject(${start + i})">삭제</button>
                </div>
            </div>
        `).join('');
        let navHtml = '';
        if (total > PROJECTS_PER_PAGE) {
            navHtml += `<div class=\"project-slider-nav\" style=\"text-align:center;margin-top:24px;\">`;
            navHtml += `<button class=\"btn btn-sm\" id=\"projectPrevBtn\" ${projectSlideIndex === 0 ? 'disabled' : ''}>&lt;</button>`;
            navHtml += `<span style=\"margin:0 8px;\">${projectSlideIndex + 1} / ${Math.ceil(total / PROJECTS_PER_PAGE)}</span>`;
            navHtml += `<button class=\"btn btn-sm\" id=\"projectNextBtn\" ${end >= total ? 'disabled' : ''}>&gt;</button>`;
            navHtml += `</div>`;
        }
        adminProjectList.innerHTML = projectsHtml + navHtml;
        // 버튼 이벤트
        const prevBtn = document.getElementById('projectPrevBtn');
        const nextBtn = document.getElementById('projectNextBtn');
        if (prevBtn) prevBtn.onclick = () => { projectSlideIndex--; renderProjects(); };
        if (nextBtn) nextBtn.onclick = () => { projectSlideIndex++; renderProjects(); };
    }

    window.editProject = function(index) {
        editingProjectIndex = index;
        const p = projects[index];
        projectTitleInput.value = p.title;
        projectDescInput.value = p.desc;
        projectImgInput.value = p.img;
        projectTagsInput.value = p.tags.join(',');
        projectModalTitle.textContent = '프로젝트 수정';
        projectModal.classList.add('show');
    };

    window.deleteProject = function(index) {
        if (confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
            projects.splice(index, 1);
            saveProjects();
            renderProjects();
        }
    };

    addProjectBtn.addEventListener('click', () => {
        editingProjectIndex = null;
        projectTitleInput.value = '';
        projectDescInput.value = '';
        projectImgInput.value = '';
        projectTagsInput.value = '';
        projectModalTitle.textContent = '새 프로젝트 추가';
        projectModal.classList.add('show');
    });

    closeProjectModal.addEventListener('click', closeProjectModalFunc);
    cancelProjectBtn.addEventListener('click', closeProjectModalFunc);
    function closeProjectModalFunc() {
        projectModal.classList.remove('show');
        editingProjectIndex = null;
    }

    saveProjectBtn.addEventListener('click', () => {
        const title = projectTitleInput.value.trim();
        const desc = projectDescInput.value.trim();
        const img = projectImgInput.value.trim();
        const tags = projectTagsInput.value.split(',').map(t=>t.trim()).filter(Boolean);
        if (!title || !desc || !img) {
            alert('모든 항목을 입력하세요.');
            return;
        }
        const newProject = { title, desc, img, tags };
        if (editingProjectIndex !== null) {
            projects[editingProjectIndex] = newProject;
        } else {
            projects.push(newProject);
        }
        saveProjects();
        renderProjects();
        closeProjectModalFunc();
    });

    function saveProjects() {
        localStorage.setItem('projects', JSON.stringify(projects));
    }

    // 모달 외부 클릭 시 닫기
    projectModal.addEventListener('click', (e) => {
        if (e.target === projectModal) closeProjectModalFunc();
    });

    // 초기 렌더링
    renderUsers();
    renderMemos();
    renderProjects();
    updateStats();
}); 

saveProjectEdit.addEventListener('click', function () {
    if (currentEditIndex === null || currentEditIndex === undefined) return;

    const title = document.getElementById(`project-title-${currentEditIndex}`);
    const desc = document.getElementById(`project-desc-${currentEditIndex}`);
    const img = document.getElementById(`project-img-${currentEditIndex}`);

    if (title) title.textContent = editProjectTitle.value;
    if (desc) desc.textContent = editProjectDesc.value;
    if (img) img.setAttribute('src', editProjectImg.value);

    // ✅ 프로젝트 데이터 수정
    projects[currentEditIndex] = {
        title: editProjectTitle.value,
        desc: editProjectDesc.value,
        img: editProjectImg.value,
        tags: projects[currentEditIndex]?.tags || []  // 기존 태그 유지
    };

    // ✅ localStorage에 저장
    localStorage.setItem('projects', JSON.stringify(projects));

    closeProjectEditModal();
});