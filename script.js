//variaveis
let currentQuestionIndex = 0;
let score = 0;
let triviaData = [];

const gameArea = document.getElementById('game-area');
const difficultySelection = document.getElementById('difficulty-selection');
const triviaContainer = document.getElementById('trivia-container');
const scoreContainer = document.getElementById('score-container');

/**
Função para traduzir um texto usando a API
@param {string} text //texto q vai ser traduzido
@returns {Promise<string>} texto traduzido ou o texto original se dar erro
 */

const translateText = async (text) => {
    try {
        const decodedText = decodeHtmlEntities(text);
        
        const response = await fetch(`https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=pt-BR&q=${encodeURIComponent(decodedText)}`);
        // A resposta é um array de arrays, onde o texto traduzido está em data[0][0]
        const data = await response.json();
        return data[0][0];
    } catch (error) {
        console.error('Erro ao traduzir texto:', error);
        // Retorna o texto original se a tradução falhar
        return text;
    }
};

/**
 * Função auxiliar para decodificar entidades HTML 
 * @param {string} text texto com entidades HTM
 * @returns {string} texto decodificado
 */

function decodeHtmlEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}

/**
 * Função para buscar perguntas na Open Trivia Database.
 * @param {string} difficulty A dificuldade das perguntas
 * @returns {Promise<Array<Object>>} Um array de objetos de perguntas
 */

const fetchTriviaQuestions = async()=> {

    const  url = `https://opentdb.com/api.php?amount=5&category=15`

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.response_code !== 0) {
            throw new Error('Erro ao buscar perguntas. Código de resposta: ' + data.response_code);
        }
        return data.results;
    } catch (error) {
        console.error('Erro ao buscar perguntas:', error);
        alert('Não foi possível carregar as perguntas. Tente novamente.');
        return [];
    }
};


//Funções de logica do jogo
/**
 * Inicia o jogo após a seleção da dificuldade.
 * @param {string} difficulty dificuldade selecionada
 */

const startGame = async (difficulty) => {
    difficultySelection.style.display = 'none';
    triviaContainer.innerHTML = '<h2>Carregando e traduzindo perguntas...</h2>';
    triviaContainer.style.display = 'block';

    const questions = await fetchTriviaQuestions(difficulty);
    if (questions.length === 0) {
        // Se falhar, volta para a seleção de dificuldade
        triviaContainer.style.display = 'none';
        difficultySelection.style.display = 'block';
        return;
    }

    // Traduzir todas as perguntas e respostas
    triviaData = await Promise.all(questions.map(async (q) => {
        // Decodifica entidades HTML antes de traduzir
        const questionText = decodeHtmlEntities(q.question);
        const correctText = decodeHtmlEntities(q.correct_answer);
        const incorrectTexts = q.incorrect_answers.map(decodeHtmlEntities);

        const translatedQuestion = await translateText(questionText);
        const translatedCorrect = await translateText(correctText);
        const translatedIncorrect = await Promise.all(incorrectTexts.map(translateText));

        // Combina e embaralha as respostas
        const allAnswers = [translatedCorrect, ...translatedIncorrect];
        // Função de embaralhamento Fisher-Yates simplificada
        for (let i = allAnswers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allAnswers[i], allAnswers[j]] = [allAnswers[j], allAnswers[i]];
        }

        return {
            question: translatedQuestion,
            correct_answer: translatedCorrect,
            all_answers: allAnswers
        };
    }));

    currentQuestionIndex = 0;
    score = 0;
    displayQuestion();
};



//Exiber a pergunta atual na tela

const displayQuestion = () => {
    if (currentQuestionIndex >= triviaData.length) {
        showFinalScore();
        return;
    }

    const questionData = triviaData[currentQuestionIndex];
    triviaContainer.innerHTML = `
        <h3>Questão ${currentQuestionIndex + 1} de ${triviaData.length}</h3>
        <p>${questionData.question}</p>
        <div id="answer-buttons">
            ${questionData.all_answers.map(answer => 
                `<button class="answer-button">${answer}</button>`
            ).join('')}
        </div>
    `;

    // Adiciona event listeners aos botões de resposta
    document.querySelectorAll('.answer-button').forEach(button => {
        button.addEventListener('click', () => handleAnswer(button, questionData.correct_answer));
    });
};

/**
 * Lida com a seleção de uma resposta pelo usuário.
 * @param {HTMLElement} selectedButton botão que foi clicado
 * @param {string} correctAnswer resposta correta para a pergunta atual.
 */
const handleAnswer = (selectedButton, correctAnswer) => {
    const isCorrect = selectedButton.innerText === correctAnswer;

    // Desabilita todos os botões de resposta e marca a correta/incorreta
    document.querySelectorAll('.answer-button').forEach(button => {
        button.classList.add('disabled');
        if (button.innerText === correctAnswer) {
            button.classList.add('correct');
        } else if (button === selectedButton) {
            button.classList.add('incorrect');
        }
    });

    if (isCorrect) {
        score++;
    }

    // Avança para a próxima pergunta após um pequeno atraso
    setTimeout(() => {
        currentQuestionIndex++;
        displayQuestion();
    }, 2000); // 
};

//exibiçao do placar final do jogo

const showFinalScore = () => {
    triviaContainer.style.display = 'none';
    scoreContainer.style.display = 'block';
    scoreContainer.innerHTML = `
        <h2>Fim de Jogo!</h2>
        <p>Você acertou ${score} de ${triviaData.length} perguntas.</p>
        <button onclick="window.location.reload()">Jogar Novamente</button>
    `;
};

//inicio do jogo

// Adiciona event listeners para a seleção de dificuldade
document.querySelectorAll('.difficulty-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const difficulty = e.target.getAttribute('data-difficulty');
        startGame(difficulty);
    });
});


