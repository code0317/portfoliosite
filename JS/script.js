// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// DOM 요소 선택
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

// 프로젝트 슬라이더 기능
document.addEventListener('DOMContentLoaded', function() {
    // 프로젝트 동적 렌더링
    const projectSlider = document.querySelector('.project-slider');
    if (projectSlider) {
        const projects = JSON.parse(localStorage.getItem('projects')) || [
            { title: '프로젝트 1', desc: '프로젝트 설명', img: 'img/1.png', tags: ['HTML','CSS','JavaScript'] },
            { title: '프로젝트 2', desc: '프로젝트 설명', img: 'img/2.png', tags: ['React','Node.js'] },
            { title: '프로젝트 3', desc: '프로젝트 설명', img: 'img/3.png', tags: ['Vue.js','Firebase'] },
            { title: '프로젝트 4', desc: '프로젝트 설명', img: 'img/4.png', tags: ['Python','Django'] },
            { title: '프로젝트 5', desc: '프로젝트 설명', img: 'img/5.png', tags: ['TypeScript','Next.js'] },
            { title: '프로젝트 6', desc: '프로젝트 설명', img: 'img/6.png ', tags: ['Angular','MongoDB'] },
            { title: '프로젝트 7', desc: '프로젝트 설명', img: 'img/7.png', tags: ['PHP','MySQL'] },
            { title: '프로젝트 8', desc: '프로젝트 설명', img: 'img/8.png', tags: ['Java','Spring'] },
        ];
        projectSlider.innerHTML = projects.map(p => `
            <div class="project-slide">
                <img src="../img/${p.img}" alt="${p.title}">
                <div class="content">
                    <h3>${p.title}</h3>
                    <p>${p.desc}</p>
                    <div class="tags">${p.tags.map(t=>`<span>${t}</span>`).join('')}</div>
                </div>
            </div>
        `).join('');
    }

    // 슬라이더 기능 초기화는 동적 렌더링 후에 실행
    const slider = document.querySelector('.project-slider');
    const slides = document.querySelectorAll('.project-slide');
    const prevButton = document.querySelector('.slider-button.prev');
    const nextButton = document.querySelector('.slider-button.next');
    const sliderNav = document.querySelector('.slider-nav');
    
    // 무한 슬라이드를 위한 복제 슬라이드 추가
    const firstSlideClone = slides[0].cloneNode(true);
    const lastSlideClone = slides[slides.length - 1].cloneNode(true);
    slider.appendChild(firstSlideClone);
    slider.insertBefore(lastSlideClone, slides[0]);

    let currentSlide = 1; // 실제 첫 번째 슬라이드의 인덱스
    let touchStartX = 0;
    let touchEndX = 0;
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = -100; // 첫 번째 슬라이드 위치
    let prevTranslate = -100;
    let isTransitioning = false;

    // 슬라이더 초기화
    function initSlider() {
        // 도트 네비게이션 생성 (실제 슬라이드 수만큼)
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('slider-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index + 1));
            sliderNav.appendChild(dot);
        });

        updateSliderPosition(false);
    }

    // 슬라이드 이동
    function goToSlide(index, animate = true) {
        if (isTransitioning) return;
        currentSlide = index;
        updateSliderPosition(animate);
        updateDots();
    }

    // 슬라이더 위치 업데이트
    function updateSliderPosition(animate = true) {
        currentTranslate = currentSlide * -100;
        slider.style.transition = animate ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none';
        slider.style.transform = `translateX(${currentTranslate}%)`;

        if (animate) {
            isTransitioning = true;
            setTimeout(() => {
                isTransitioning = false;
                // 무한 슬라이드 처리
                if (currentSlide === 0) {
                    currentSlide = slides.length;
                    updateSliderPosition(false);
                } else if (currentSlide === slides.length + 1) {
                    currentSlide = 1;
                    updateSliderPosition(false);
                }
            }, 500); // 전환 시간과 동기화
        }
    }

    // 도트 업데이트
    function updateDots() {
        const dots = document.querySelectorAll('.slider-dot');
        const realIndex = currentSlide === 0 ? slides.length - 1 : 
                         currentSlide === slides.length + 1 ? 0 : 
                         currentSlide - 1;
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === realIndex);
        });
    }

    // 이전 슬라이드
    function prevSlide() {
        if (isTransitioning) return;
        currentSlide--;
        updateSliderPosition(true);
        updateDots();
    }

    // 다음 슬라이드
    function nextSlide() {
        if (isTransitioning) return;
        currentSlide++;
        updateSliderPosition(true);
        updateDots();
    }

    // 터치 이벤트 핸들러
    function touchStart(e) {
        if (isTransitioning) return;
        touchStartX = e.type === 'mousedown' ? e.pageX : e.touches[0].clientX;
        isDragging = true;
        startPos = touchStartX;
        
        slider.style.cursor = 'grabbing';
        slider.style.transition = 'none';
    }

    function touchMove(e) {
        if (!isDragging || isTransitioning) return;
        
        const currentPosition = e.type === 'mousemove' ? e.pageX : e.touches[0].clientX;
        const diff = currentPosition - startPos;
        const move = (diff / slider.offsetWidth) * 100;
        currentTranslate = prevTranslate + move;
        
        slider.style.transform = `translateX(${currentTranslate}%)`;
    }

    function touchEnd() {
        if (!isDragging) return;
        isDragging = false;
        const movedBy = currentTranslate - prevTranslate;
        
        if (Math.abs(movedBy) > 15) { // 슬라이드 감지 임계값 조정
            if (movedBy > 0) {
                prevSlide();
            } else {
                nextSlide();
            }
        } else {
            goToSlide(currentSlide);
        }
        
        slider.style.cursor = 'grab';
        prevTranslate = currentTranslate;
    }

    // 이벤트 리스너 등록
    prevButton.addEventListener('click', prevSlide);
    nextButton.addEventListener('click', nextSlide);

    // 터치/마우스 이벤트
    slider.addEventListener('mousedown', touchStart);
    slider.addEventListener('touchstart', touchStart);
    slider.addEventListener('mousemove', touchMove);
    slider.addEventListener('touchmove', touchMove);
    slider.addEventListener('mouseup', touchEnd);
    slider.addEventListener('touchend', touchEnd);
    slider.addEventListener('mouseleave', touchEnd);

    // 자동 슬라이드
    let autoSlide = setInterval(nextSlide, 5000);

    slider.addEventListener('mouseenter', () => {
        clearInterval(autoSlide);
    });

    slider.addEventListener('mouseleave', () => {
        autoSlide = setInterval(nextSlide, 5000);
    });

    // 슬라이더 초기화
    initSlider();
});

// 모바일 메뉴 토글
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// 네비게이션 링크 클릭시 모바일 메뉴 닫기
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// 스크롤 이벤트
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
    } else {
        header.style.boxShadow = 'none';
    }
});

// Form submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Here you would typically send the form data to a server
        alert('메시지가 전송되었습니다!');
        contactForm.reset();
    });
}

// Scroll animation
const sections = document.querySelectorAll('.section');

const checkVisibility = () => {
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const sectionBottom = section.getBoundingClientRect().bottom;
        const windowHeight = window.innerHeight;

        if (sectionTop < windowHeight * 0.75 && sectionBottom > 0) {
            section.classList.add('visible');
        }
    });
};

window.addEventListener('scroll', checkVisibility);
window.addEventListener('load', checkVisibility);

// 프로젝트 편집 모달 기능
const projectEditModal = document.getElementById('projectEditModal');
const closeProjectEdit = document.getElementById('closeProjectEdit');
const saveProjectEdit = document.getElementById('saveProjectEdit');
const cancelProjectEdit = document.getElementById('cancelProjectEdit');
const editProjectTitle = document.getElementById('editProjectTitle');
const editProjectDesc = document.getElementById('editProjectDesc');
const editProjectImg = document.getElementById('editProjectImg');

let currentEditIndex = null;

// 수정 버튼 이벤트 등록
const editProjectBtns = document.querySelectorAll('.edit-project-btn');
editProjectBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        currentEditIndex = this.getAttribute('data-index');
        // 현재 값 채우기
        const title = document.getElementById(`project-title-${currentEditIndex}`);
        const desc = document.getElementById(`project-desc-${currentEditIndex}`);
        const img = document.getElementById(`project-img-${currentEditIndex}`);
        editProjectTitle.value = title ? title.textContent : '';
        editProjectDesc.value = desc ? desc.textContent : '';
        editProjectImg.value = img ? img.getAttribute('src') : '';
        projectEditModal.classList.add('show');
    });
});

function closeProjectEditModal() {
    projectEditModal.classList.remove('show');
    currentEditIndex = null;
}

closeProjectEdit.addEventListener('click', closeProjectEditModal);
cancelProjectEdit.addEventListener('click', closeProjectEditModal);

saveProjectEdit.addEventListener('click', function() {
    if (!currentEditIndex) return;
    const title = document.getElementById(`project-title-${currentEditIndex}`);
    const desc = document.getElementById(`project-desc-${currentEditIndex}`);
    const img = document.getElementById(`project-img-${currentEditIndex}`);
    if (title) title.textContent = editProjectTitle.value;
    if (desc) desc.textContent = editProjectDesc.value;
    if (img) img.setAttribute('src', editProjectImg.value);
    closeProjectEditModal();
});

// 모달 외부 클릭 시 닫기
projectEditModal.addEventListener('click', (e) => {
    if (e.target === projectEditModal) {
        closeProjectEditModal();
    }
}); 
