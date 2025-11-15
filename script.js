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
