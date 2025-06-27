document.addEventListener('DOMContentLoaded', () => {
    const memoList = document.getElementById('memoList');
    const addMemoButton = document.getElementById('addMemo');
    const memoModal = document.getElementById('memoModal');
    const deleteModal = document.getElementById('deleteModal');
    const closeButtons = document.querySelectorAll('.close-btn');
    const cancelButton = document.getElementById('cancelMemo');
    const saveButton = document.getElementById('saveMemo');
    const memoTitle = document.getElementById('memoTitle');
    const memoContent = document.getElementById('memoContent');
    const confirmDeleteButton = document.getElementById('confirmDelete');
    const cancelDeleteButton = document.getElementById('cancelDelete');

    let memos = JSON.parse(localStorage.getItem('memos')) || [];
    let editingIndex = null;
    let deletingIndex = null;

    // 모달 열기
    function openModal(index = null) {
        if (index !== null) {
            editingIndex = index;
            const memo = memos[index];
            memoTitle.value = memo.title;
            memoContent.value = memo.content;
            document.querySelector('.modal-header h3').textContent = '메모 수정';
        } else {
            editingIndex = null;
            memoTitle.value = '';
            memoContent.value = '';
            document.querySelector('.modal-header h3').textContent = '새 메모';
        }
        memoModal.classList.add('show');
        memoTitle.focus();
    }

    // 모달 닫기
    function closeModal() {
        memoModal.classList.remove('show');
        editingIndex = null;
    }

    // 메모 저장
    function saveMemo() {
        const title = memoTitle.value.trim();
        const content = memoContent.value.trim();

        if (!title || !content) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }

        const now = new Date();
        const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        const newMemo = {
            title,
            content,
            date
        };

        if (editingIndex !== null) {
            memos[editingIndex] = newMemo;
        } else {
            memos.unshift(newMemo);
        }

        saveMemos();
        renderMemos();
        closeModal();
    }

    // 메모 렌더링
    function renderMemos() {
        memoList.innerHTML = memos.map((memo, index) => `
            <div class="memo-item">
                <div class="actions">
                    <button onclick="editMemo(${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteMemo(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="title">${memo.title}</div>
                <div class="content">${memo.content}</div>
                <div class="date">${memo.date}</div>
            </div>
        `).join('');
    }

    // 메모 수정
    window.editMemo = function(index) {
        openModal(index);
    };

    // 삭제 모달 열기
    function openDeleteModal(index) {
        deletingIndex = index;
        deleteModal.classList.add('show');
    }

    // 삭제 모달 닫기
    function closeDeleteModal() {
        deleteModal.classList.remove('show');
        deletingIndex = null;
    }

    // 메모 삭제
    function deleteMemo() {
        if (deletingIndex !== null) {
            memos.splice(deletingIndex, 1);
            saveMemos();
            renderMemos();
            closeDeleteModal();
        }
    }

    // 메모 삭제 버튼 클릭 이벤트
    window.deleteMemo = function(index) {
        openDeleteModal(index);
    };

    // 메모 저장
    function saveMemos() {
        localStorage.setItem('memos', JSON.stringify(memos));
    }

    // 이벤트 리스너
    addMemoButton.addEventListener('click', () => openModal());
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (memoModal.classList.contains('show')) {
                closeModal();
            } else if (deleteModal.classList.contains('show')) {
                closeDeleteModal();
            }
        });
    });
    cancelButton.addEventListener('click', closeModal);
    saveButton.addEventListener('click', saveMemo);
    confirmDeleteButton.addEventListener('click', deleteMemo);
    cancelDeleteButton.addEventListener('click', closeDeleteModal);

    // 모달 외부 클릭 시 닫기
    memoModal.addEventListener('click', (e) => {
        if (e.target === memoModal) {
            closeModal();
        }
    });

    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            closeDeleteModal();
        }
    });

    // Enter 키로 저장
    memoTitle.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveMemo();
        }
    });

    // 초기 렌더링
    renderMemos();
}); 