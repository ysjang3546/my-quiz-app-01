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

  // LaTeX 수식($...$)을 HTML로 변환하는 함수
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

    // 프로그레스 바 및 상단 정보
    const progressPercent = ((currentIndex + 1) / quizData.length) * 100;
    progressBar.style.width = `${progressPercent}%`;
    questionNumber.innerText = `문제 ${currentIndex + 1} / ${quizData.length}`;

    // 문제 텍스트 및 프롬프트 (수식 렌더링 적용)
    questionText.innerHTML = renderLatex(currentQuiz.question);
    
    if (currentQuiz.prompt) {
      questionPrompt.innerHTML = renderLatex(currentQuiz.prompt);
      questionPrompt.style.display = 'block';
    } else {
      questionPrompt.innerHTML = '';
      questionPrompt.style.display = 'none';
    }

    // 이미지 (도형)
    if (currentQuiz.image) {
      imageContainer.innerHTML = `<img src="${currentQuiz.image}" alt="문제 도형">`;
      imageContainer.style.display = 'block';
    } else {
      imageContainer.innerHTML = '';
      imageContainer.style.display = 'none';
    }

    // 보기 버튼 생성 (수식 렌더링 적용)
    optionsContainer.innerHTML = '';
    currentQuiz.options.forEach((opt, idx) => {
      const button = document.createElement('button');
      button.className = 'option-btn';
      if (userAnswers[currentIndex] === idx) {
        button.classList.add('selected');
      }
      button.innerHTML = `${idx + 1}. ${renderLatex(opt)}`;
      button.addEventListener('click', () => selectOption(idx));
      optionsContainer.appendChild(button);
    });

    // 버튼 상태 제어
    prevBtn.disabled = currentIndex === 0;
    nextBtn.innerText = currentIndex === quizData.length - 1 ? '채점하기' : '다음';
  }

  // 보기 선택
  function selectOption(optionIndex) {
    userAnswers[currentIndex] = optionIndex;
    const buttons = optionsContainer.querySelectorAll('.option-btn');
    buttons.forEach((btn, idx) => {
      if (idx === optionIndex) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });
  }

  // 이전 버튼
  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      renderQuestion();
    }
  });

  // 다음 / 채점하기 버튼
  nextBtn.addEventListener('click', () => {
    if (userAnswers[currentIndex] === null) {
      alert('보기를 선택해 주세요!');
      return;
    }

    if (currentIndex < quizData.length - 1) {
      currentIndex++;
      renderQuestion();
    } else {
      calculateResult();
    }
  });

  // 채점 결과 계산
  function calculateResult() {
    let score = 0;
    quizData.forEach((quiz, idx) => {
      if (userAnswers[idx] === quiz.answer) {
        score += 10; // 문제당 10점
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
});
