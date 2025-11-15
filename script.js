//variaveis
let currentQuestionIndex = 0;
let score = 0;
let triviaData = [];
const NUMBER_OF_QUESTIONS = 5; // Mínimo de 5 questões

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
 * @param {string} difficulty A dificuldade das perguntas (easy, medium, hard).
 * @returns {Promise<Array<Object>>} Um array de objetos de perguntas.
 */

const fetchTriviaQuestions = async (difficulty) => {
    const CATEGORY_ID = 15; 
    const url = `https://opentdb.com/api.php?amount=${NUMBER_OF_QUESTIONS}&category=${CATEGORY_ID}&difficulty=${difficulty}&type=multiple`;
    
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