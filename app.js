// Estado Global de la Aplicación
const state = {
    allSpells: [],
    sessionQuestions: [],
    currentRound: 0,
    score: 0,
    errors: [], // Guardará objetos: { question, yourAnswer, correctAnswer }
    maxRounds: 10
};

// Elementos del DOM
const DOM = {
    screens: {
        start: document.getElementById('start-screen'),
        game: document.getElementById('game-screen'),
        result: document.getElementById('result-screen')
    },
    buttons: {
        start: document.getElementById('start-btn'),
        restart: document.getElementById('restart-btn')
    },
    game: {
        roundIndicator: document.getElementById('round-indicator'),
        scoreIndicator: document.getElementById('score-indicator'),
        questionText: document.getElementById('question-text'),
        optionsContainer: document.getElementById('options-container')
    },
    result: {
        finalScore: document.getElementById('final-score'),
        scoreMessage: document.getElementById('score-message'),
        errorsContainer: document.getElementById('errors-container')
    }
};

// Inicialización
async function init() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('No se pudo cargar la data');
        state.allSpells = await response.json();
        
        DOM.buttons.start.addEventListener('click', startGame);
        DOM.buttons.restart.addEventListener('click', startGame);
    } catch (error) {
        console.error("Error al inicializar:", error);
        DOM.game.questionText.innerText = "Error cargando los hechizos. Por favor revisa tu conexión o el archivo JSON.";
    }
}

// Control de Pantallas
function showScreen(screenName) {
    Object.values(DOM.screens).forEach(screen => {
        screen.classList.remove('active');
        screen.classList.add('hidden');
    });
    DOM.screens[screenName].classList.remove('hidden');
    // Pequeño timeout para que la transición CSS se aplique
    setTimeout(() => {
        DOM.screens[screenName].classList.add('active');
    }, 10);
}

// Iniciar Juego
function startGame() {
    // Resetear Estado
    state.currentRound = 0;
    state.score = 0;
    state.errors = [];
    state.sessionQuestions = getRandomItems(state.allSpells, state.maxRounds);
    
    updateHeader();
    showScreen('game');
    loadQuestion();
}

// Cargar Pregunta
function loadQuestion() {
    const currentData = state.sessionQuestions[state.currentRound];
    
    // Decidir aleatoriamente el tipo de pregunta (0: A, 1: B, 2: C)
    const questionType = Math.floor(Math.random() * 3);
    
    let questionText = "";
    let correctAnswer = "";
    let fieldForIncorrect = "";

    switch (questionType) {
        case 0: // Tipo A
            questionText = `Te atacan con el hechizo "${currentData.hechizo}". ¿Cuál es el contrahechizo correcto?`;
            correctAnswer = currentData.contrahechizo;
            fieldForIncorrect = "contrahechizo";
            break;
        case 1: // Tipo B
            questionText = `Recibes el hechizo "${currentData.hechizo}". ¿Qué mímica debes realizar al instante?`;
            correctAnswer = currentData.mimica;
            fieldForIncorrect = "mimica";
            break;
        case 2: // Tipo C
            questionText = `Ves que tu oponente hace la siguiente mímica: "${currentData.mimica}". ¿Qué hechizo acabas de recibir?`;
            correctAnswer = currentData.hechizo;
            fieldForIncorrect = "hechizo";
            break;
    }

    DOM.game.questionText.innerText = questionText;
    
    // Obtener opciones incorrectas
    const incorrectOptions = getIncorrectOptions(correctAnswer, fieldForIncorrect, 3);
    const allOptions = shuffleArray([correctAnswer, ...incorrectOptions]);

    // Renderizar Botones
    DOM.game.optionsContainer.innerHTML = '';
    allOptions.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = option;
        btn.onclick = () => handleAnswer(btn, option, correctAnswer, questionText);
        DOM.game.optionsContainer.appendChild(btn);
    });
}

// Manejar Respuesta
function handleAnswer(btnElement, selectedOption, correctAnswer, questionText) {
    const isCorrect = selectedOption === correctAnswer;
    
    // Deshabilitar todos los botones para evitar múltiples clics
    const allBtns = DOM.game.optionsContainer.querySelectorAll('.option-btn');
    allBtns.forEach(b => b.disabled = true);

    if (isCorrect) {
        btnElement.classList.add('correct');
        state.score++;
    } else {
        btnElement.classList.add('incorrect');
        // Buscar el botón correcto y marcarlo
        allBtns.forEach(b => {
            if (b.innerText === correctAnswer) b.classList.add('correct');
        });
        
        // Guardar el error
        state.errors.push({
            question: questionText,
            yourAnswer: selectedOption,
            correctAnswer: correctAnswer
        });
    }

    updateHeader();

    // Esperar y pasar a la siguiente
    setTimeout(() => {
        state.currentRound++;
        if (state.currentRound < state.maxRounds) {
            loadQuestion();
            updateHeader();
        } else {
            endGame();
        }
    }, 1500); // 1.5 segundos de retroalimentación
}

// Actualizar UI Header
function updateHeader() {
    DOM.game.roundIndicator.innerText = `Ronda ${state.currentRound + 1}/${state.maxRounds}`;
    DOM.game.scoreIndicator.innerText = `Puntaje: ${state.score}`;
}

// Pantalla Final
function endGame() {
    showScreen('result');
    DOM.result.finalScore.innerText = state.score;
    
    // Mensaje personalizado
    if (state.score === 10) {
        DOM.result.scoreMessage.innerText = "¡Excepcional! Digno de la inteligencia de Rowena Ravenclaw.";
    } else if (state.score >= 7) {
        DOM.result.scoreMessage.innerText = "Muy buen trabajo. Estás casi listo para el Club de Duelo.";
    } else if (state.score >= 4) {
        DOM.result.scoreMessage.innerText = "Necesitas estudiar un poco más en la biblioteca de Hogwarts.";
    } else {
        DOM.result.scoreMessage.innerText = "Un desastre. ¡Gilderoy Lockhart lo haría mejor!";
    }

    // Renderizar errores
    DOM.result.errorsContainer.innerHTML = '';
    if (state.errors.length === 0) {
        DOM.result.errorsContainer.innerHTML = '<p style="text-align:center; color:#2ecc71;">¡No cometiste ningún error! Perfecto.</p>';
    } else {
        state.errors.forEach(err => {
            const errDiv = document.createElement('div');
            errDiv.className = 'error-item';
            errDiv.innerHTML = `
                <p><strong>Pregunta:</strong> ${err.question}</p>
                <p><strong>Fallaste con:</strong> ${err.yourAnswer}</p>
                <p><span class="correct-answer">Respuesta Correcta:</span> ${err.correctAnswer}</p>
            `;
            DOM.result.errorsContainer.appendChild(errDiv);
        });
    }
}

// Funciones Auxiliares
function getRandomItems(array, count) {
    const shuffled = shuffleArray([...array]);
    return shuffled.slice(0, count);
}

function getIncorrectOptions(correctItem, field, count) {
    const incorrectPool = state.allSpells.filter(spell => spell[field] !== correctItem);
    // Eliminar duplicados para evitar 2 opciones incorrectas iguales
    const uniquePool = Array.from(new Set(incorrectPool.map(s => s[field])));
    
    return getRandomItems(uniquePool, count);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Iniciar aplicación al cargar
document.addEventListener('DOMContentLoaded', init);
