let quizData = [];
let currentIndex = 0;

const card = document.getElementById('card');
const questionText = document.getElementById('question-text');
const answerText = document.getElementById('answer-text');
const counter = document.getElementById('counter');
const progressBar = document.getElementById('progress-bar');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const flipBtn = document.getElementById('flip-btn');

// 1. JSON 파일 로드
async function loadData() {
  try {
    const res = await fetch('./data.json');
    if (!res.ok) throw new Error('데이터 파일을 불러올 수 없습니다.');
    quizData = await res.json();
    renderCard();
  } catch (error) {
    questionText.textContent = '데이터 로딩 실패: ' + error.message;
  }
}

// 2. 화면 갱신
function renderCard() {
  if (quizData.length === 0) return;

  // 카드 앞면으로 원위치
  card.classList.remove('is-flipped');

  const item = quizData[currentIndex];
  questionText.textContent = item.question;
  answerText.textContent = item.answer;

  // 카운터 및 프로그레스 바 갱신
  counter.textContent = `${currentIndex + 1} / ${quizData.length}`;
  const percentage = ((currentIndex + 1) / quizData.length) * 100;
  progressBar.style.width = `${percentage}%`;

  // 이전/다음 버튼 활성화 상태 제어
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === quizData.length - 1;
}

// 3. 카드 뒤집기 토글
function toggleFlip() {
  card.classList.toggle('is-flipped');
}

// 4. 이벤트 리스너
card.addEventListener('click', toggleFlip);
flipBtn.addEventListener('click', toggleFlip);

prevBtn.addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex--;
    renderCard();
  }
});

nextBtn.addEventListener('click', () => {
  if (currentIndex < quizData.length - 1) {
    currentIndex++;
    renderCard();
  }
});

// 실행
loadData();