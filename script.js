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

