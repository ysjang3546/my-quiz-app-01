document.addEventListener('DOMContentLoaded', () => {
  let quizData = [];
  let currentIndex = 0;
  let userAnswers = {};

  // DOM 요소
  const quizView = document.getElementById('quiz-view');
  const resultView = document.getElementById('result-view');
  const progressBar = document.getElementById('progress-bar');
  const questionNumber = document.getElementById('question-number');
  const questionText = document.getElementById('question-text');
  const questionPrompt = document.getElementById('question-prompt');
  const imageContainer = document.getElementById('image-container');
  const optionsContainer = document.getElementById('options-container');
  const feedbackBox = document.getElementById('feedback-box');
  const feedbackTitle = document.getElementById('feedback-title');
  const feedbackExplanation = document.getElementById('feedback-explanation');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const scoreText = document.getElementById('score-text');
  const scoreDesc = document.getElementById('score-desc');
  const retryBtn = document.getElementById('retry-btn');

  // JSON 데이터 로드
  fetch('quiz.json')
    .then(response => response.json())
    .then(data => {
      quizData = data;
      userAnswers = new Array(quizData.length).fill(null);
      renderQuestion();
    })
    .catch(error => {
      questionText.innerText = '퀴즈 데이터를 불러오는데 실패했습니다.';
      console.error(error);
    });

  // LaTeX 수식($...$)을 KaTeX로 변환하는 함수
  function renderLatex(text) {
    if (!text) return '';
    return text.replace(/\$(.*?)\$/g, (match, formula) => {
      if (window.katex) {
        try {
          return katex.renderToString(formula, { throwOnError: false });
        } catch (e) {
          return formula;
        }
      }
      return formula;
    });
  }

  // 문제 렌더링
  function renderQuestion() {
    const currentQuiz = quizData[currentIndex];

    // 프로그레스 바 및 상단 번호
    const progressPercent = ((currentIndex + 1) / quizData.length) * 100;
    progressBar.style.width = `${progressPercent}%`;
    questionNumber.innerText = `문제 ${currentIndex + 1} / ${quizData.length}`;

    // 본문 및 프롬프트
    questionText.innerHTML = renderLatex(currentQuiz.question);
    if (currentQuiz.prompt) {
      questionPrompt.innerHTML = renderLatex(currentQuiz.prompt);
      questionPrompt.style.display = 'block';
    } else {
      questionPrompt.innerHTML = '';
      questionPrompt.style.display = 'none';
    }

    // 이미지
    if (currentQuiz.image) {
      imageContainer.innerHTML = `<img src="${currentQuiz.image}" alt="문제 도형">`;
      imageContainer.style.display = 'block';
    } else {
      imageContainer.innerHTML = '';
      imageContainer.style.display = 'none';
    }

    // 보기 버튼 생성
    optionsContainer.innerHTML = '';
    currentQuiz.options.forEach((opt, idx) => {
      const button = document.createElement('button');
      button.className = 'option-btn';
      button.innerHTML = `${idx + 1}. ${renderLatex(opt)}`;
      button.addEventListener('click', () => handleOptionClick(idx));
      optionsContainer.appendChild(button);
    });

    // 이미 푼 문제라면 정답/해설 상태 복원
    if (userAnswers[currentIndex] !== null) {
      showAnswerFeedback(userAnswers[currentIndex]);
    } else {
      feedbackBox.classList.add('hidden');
    }

    // 버튼 상태
    prevBtn.disabled = currentIndex === 0;
    nextBtn.innerText = currentIndex === quizData.length - 1 ? '결과 보기' : '다음';
  }

  // 보기를 눌렀을 때 즉시 채점 및 피드백 표시
  function handleOptionClick(selectedIndex) {
    // 이미 답을 고른 상태면 재클릭 방지
    if (userAnswers[currentIndex] !== null) return;

    userAnswers[currentIndex] = selectedIndex;
    showAnswerFeedback(selectedIndex);
  }

  // 정답/오답 표시 및 해설 박스 노출
  function showAnswerFeedback(selectedIndex) {
    const currentQuiz = quizData[currentIndex];
    const isCorrect = selectedIndex === currentQuiz.answer;
    const buttons = optionsContainer.querySelectorAll('.option-btn');

    // 보기 스타일 적용 및 클릭 비활성화
    buttons.forEach((btn, idx) => {
      btn.style.cursor = 'default';
      if (idx === currentQuiz.answer) {
        btn.classList.add('correct'); // 정답 보기는 항상 초록색
      } else if (idx === selectedIndex && !isCorrect) {
        btn.classList.add('wrong');   // 오답을 골랐다면 빨간색
      }
    });

    // 해설 박스 설정
    feedbackBox.className = 'feedback-box';
    if (isCorrect) {
      feedbackBox.classList.add('correct-bg');
      feedbackTitle.innerText = '⭕ 정답입니다!';
    } else {
      feedbackBox.classList.add('wrong-bg');
      feedbackTitle.innerText = `❌ 틀렸습니다. (정답: ${currentQuiz.answer + 1}번)`;
    }

    feedbackExplanation.innerHTML = renderLatex(currentQuiz.explanation);
    feedbackBox.classList.remove('hidden');
  }

  // 이전 버튼
  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      renderQuestion();
    }
  });

  // 다음 / 결과 보기 버튼
  nextBtn.addEventListener('click', () => {
    if (userAnswers[currentIndex] === null) {
      alert('보기를 선택해 정답을 확인해 주세요!');
      return;
    }

    if (currentIndex < quizData.length - 1) {
      currentIndex++;
      renderQuestion();
    } else {
      calculateResult();
    }
  });

  // 최종 결과 화면
  function calculateResult() {
    let score = 0;
    quizData.forEach((quiz, idx) => {
      if (userAnswers[idx] === quiz.answer) {
        score += 10;
      }
    });

    quizView.classList.add('hidden');
    resultView.classList.remove('hidden');

    scoreText.innerText = `${score}점 / 100점`;

    if (score === 100) {
      scoreDesc.innerText = '🎉 완벽해요! 모든 문제를 맞히셨습니다.';
    } else if (score >= 70) {
      scoreDesc.innerText = '👍 참 잘했어요! 조금만 더 하면 100점이에요.';
    } else {
      scoreDesc.innerText = '💪 다시 한번 도전해 보세요!';
    }
  }

  // 다시 풀기 버튼
  retryBtn.addEventListener('click', () => {
    currentIndex = 0;
    userAnswers = new Array(quizData.length).fill(null);
    resultView.classList.add('hidden');
    quizView.classList.remove('hidden');
    renderQuestion();
  });

  // 채점 결과 계산 (100점 만점 자동 환산)
function calculateResult() {
  let correctCount = 0;
  quizData.forEach((quiz, idx) => {
    if (userAnswers[idx] === quiz.answer) {
      correctCount++;
    }
  });

  const finalScore = Math.round((correctCount / quizData.length) * 100);

  quizView.classList.add('hidden');
  resultView.classList.remove('hidden');

  scoreText.innerText = `${finalScore}점 (${correctCount} / ${quizData.length}개 맞힘)`;
}
});
