// Estado Global de la Aplicación
const state = {
    ataques: [],
    contrahechizos: [],
    curacion: [],
    rulesData: [],
    normsData: [],
    sessionQuestions: [],
    currentRound: 0,
    score: 0,
    errors: [], // Guardará objetos: { question, yourAnswer, correctAnswer }
    maxRounds: 10,
    timerInterval: null,
    timeRemaining: 10000, // 10 segundos en milisegundos
    isOutOfTime: false
};

// Elementos del DOM
const DOM = {
    screens: {
        start: document.getElementById('start-screen'),
        game: document.getElementById('game-screen'),
        result: document.getElementById('result-screen'),
        study: document.getElementById('study-screen')
    },
    buttons: {
        startQuiz: document.getElementById('start-btn'),
        startStudy: document.getElementById('study-btn'),
        restart: document.getElementById('restart-btn'),
        backFromStudy: document.getElementById('back-from-study-btn'),
        backFromGame: document.getElementById('back-from-game-btn'),
        backFromResult: document.getElementById('back-from-result-btn'),
        scrollTop: document.getElementById('scroll-top-btn')
    },
    game: {
        roundIndicator: document.getElementById('round-indicator'),
        scoreIndicator: document.getElementById('score-indicator'),
        questionText: document.getElementById('question-text'),
        optionsContainer: document.getElementById('options-container'),
        timerBar: document.getElementById('timer-bar')
    },
    result: {
        finalScore: document.getElementById('final-score'),
        scoreMessage: document.getElementById('score-message'),
        errorsContainer: document.getElementById('errors-container')
    },
    study: {
        tabBtns: document.querySelectorAll('.tab-btn'),
        tabContents: document.querySelectorAll('.tab-content'),
        rulesList: document.getElementById('rules-list'),
        normsList: document.getElementById('norms-list'),
        spellsGrid: document.getElementById('spells-grid'),
        searchInput: document.getElementById('spell-search'),
        contentContainer: document.getElementById('study-content-container')
    }
};

// Inicialización
async function init() {
    try {
        const response = await fetch('teoria.json');
        if (!response.ok) {
            throw new Error('No se pudo cargar la data');
        }
        const fullData = await response.json();
        
        // Manejo de la nueva estructura jerárquica
        state.ataques = fullData.ataques || [];
        state.contrahechizos = fullData.contrahechizos || [];
        state.curacion = fullData.curacion || [];
        state.rulesData = fullData.reglas || [];
        state.normsData = fullData.normas || [];
        
        setupEventListeners();
        renderTextContent();
        renderSpellsGrid('ataques'); // Renderizar ataques por defecto
        
    } catch (error) {
        console.error("Error al inicializar:", error);
        DOM.game.questionText.innerText = "Error cargando los hechizos. Por favor revisa tu conexión.";
    }
}

function setupEventListeners() {
    // Navegación principal
    DOM.buttons.startQuiz.addEventListener('click', startGame);
    DOM.buttons.startStudy.addEventListener('click', () => showScreen('study'));
    
    // Botones de Regreso al Menú
    const goMenu = () => {
        clearInterval(state.timerInterval); // Asegurar que el timer se detenga
        showScreen('start');
    };
    DOM.buttons.backFromStudy.addEventListener('click', goMenu);
    DOM.buttons.backFromGame.addEventListener('click', goMenu); 
    DOM.buttons.backFromResult.addEventListener('click', goMenu);
    
    // Reiniciar
    DOM.buttons.restart.addEventListener('click', startGame);
    
    // Pestañas del Modo Estudio
    DOM.study.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Limpiar activos
            DOM.study.tabBtns.forEach(b => b.classList.remove('active'));
            DOM.study.tabContents.forEach(c => c.classList.remove('active'));
            
            // Activar botón clickeado
            btn.classList.add('active');
            
            const tabName = btn.dataset.tab;
            
            if (tabName === 'reglas') {
                document.getElementById('tab-reglas').classList.add('active');
            } else {
                document.getElementById('tab-spells').classList.add('active');
                renderSpellsGrid(tabName);
                
                // Reiniciar búsqueda al cambiar de pestaña
                DOM.study.searchInput.value = '';
                const cards = DOM.study.spellsGrid.querySelectorAll('.spell-card');
                cards.forEach(card => card.classList.remove('hidden'));
            }
        });
    });

    // Buscador en Tiempo Real
    DOM.study.searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const cards = DOM.study.spellsGrid.querySelectorAll('.spell-card');
        
        cards.forEach(card => {
            const name = card.querySelector('.spell-name').innerText.toLowerCase();
            const details = card.innerText.toLowerCase();
            if (name.includes(query) || details.includes(query)) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    });

    // Botón Flotante Scroll
    DOM.study.contentContainer.addEventListener('scroll', () => {
        if (DOM.study.contentContainer.scrollTop > 200) {
            DOM.buttons.scrollTop.classList.remove('hidden');
        } else {
            DOM.buttons.scrollTop.classList.add('hidden');
        }
    });

    DOM.buttons.scrollTop.addEventListener('click', () => {
        DOM.study.contentContainer.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Control de Pantallas
function showScreen(screenName) {
    Object.values(DOM.screens).forEach(screen => {
        if(screen) {
            screen.classList.remove('active');
            screen.classList.add('hidden');
        }
    });
    if(DOM.screens[screenName]) {
        DOM.screens[screenName].classList.remove('hidden');
        setTimeout(() => {
            DOM.screens[screenName].classList.add('active');
        }, 10);
    }
}

// ==========================================
// MODO ESTUDIO
// ==========================================
function renderTextContent() {
    DOM.study.rulesList.innerHTML = '';
    state.rulesData.forEach(rule => {
        const li = document.createElement('li');
        li.innerText = rule;
        DOM.study.rulesList.appendChild(li);
    });

    DOM.study.normsList.innerHTML = '';
    state.normsData.forEach(norm => {
        const li = document.createElement('li');
        li.innerText = norm;
        DOM.study.normsList.appendChild(li);
    });
}

function renderSpellsGrid(category) {
    DOM.study.spellsGrid.innerHTML = '';
    
    // Obtener el array correcto del estado según la categoría
    const spellsArray = state[category] || [];
    
    spellsArray.forEach(spell => {
        const card = document.createElement('div');
        card.className = 'spell-card';
        
        let dynamicFieldHTML = '';
        
        // Renderizado condicional basado en la presencia de 'efectivo_contra'
        if (spell.efectivo_contra) {
            dynamicFieldHTML = `
                <div class="spell-block">
                    <strong>Anula / Efectivo contra:</strong>
                    <span class="spell-effective-against">${spell.efectivo_contra.join(', ')}</span>
                </div>
            `;
        } else if (spell.contrahechizo) {
            dynamicFieldHTML = `
                <div class="spell-block">
                    <strong>Contrahechizo:</strong>
                    <span>${spell.contrahechizo}</span>
                </div>
            `;
        }

        card.innerHTML = `
            <h3 class="spell-name">${spell.hechizo}</h3>
            ${spell.pronunciacion ? `<span class="spell-pronunciation">${spell.pronunciacion}</span>` : ''}
            <div class="spell-block">
                <strong>Descripción:</strong>
                <span>${spell.descripcion || 'Sin descripción.'}</span>
            </div>
            <div class="spell-block">
                <strong>Mímica:</strong>
                <span>${spell.mimica || 'No requiere mímica'}</span>
            </div>
            ${dynamicFieldHTML}
        `;
        DOM.study.spellsGrid.appendChild(card);
    });
}


// ==========================================
// MODO DUELO (QUIZ)
// ==========================================

function startGame() {
    state.currentRound = 0;
    state.score = 0;
    state.errors = [];
    
    // El quiz SOLO saca preguntas de los Hechizos de Ataque para mantener coherencia
    state.sessionQuestions = getRandomItems(state.ataques, state.maxRounds);
    
    updateHeader();
    showScreen('game');
    loadQuestion();
}

function startTimer() {
    clearInterval(state.timerInterval);
    state.timeRemaining = 10000; // 10 segundos
    state.isOutOfTime = false;
    DOM.game.timerBar.style.width = '100%';
    DOM.game.timerBar.classList.remove('warning');

    const updateInterval = 50; 

    state.timerInterval = setInterval(() => {
        state.timeRemaining -= updateInterval;
        let widthPercentage = (state.timeRemaining / 10000) * 100;
        
        DOM.game.timerBar.style.width = `${widthPercentage}%`;

        if (state.timeRemaining <= 3000 && !DOM.game.timerBar.classList.contains('warning')) {
            DOM.game.timerBar.classList.add('warning'); // Rojo en los últimos 3 segundos
        }

        if (state.timeRemaining <= 0) {
            clearInterval(state.timerInterval);
            DOM.game.timerBar.style.width = '0%';
            state.isOutOfTime = true;
            // IMPORTANTE: NO pasamos automáticamente de pregunta, solo marcamos el flag de tiempo.
        }
    }, updateInterval);
}

function loadQuestion() {
    const currentData = state.sessionQuestions[state.currentRound];
    const questionType = Math.floor(Math.random() * 3);
    
    let questionText = "";
    let correctAnswer = "";
    let fieldForIncorrect = "";

    switch (questionType) {
        case 0:
            questionText = `Te atacan con el hechizo "${currentData.hechizo}". ¿Cuál es el contrahechizo correcto?`;
            correctAnswer = currentData.contrahechizo;
            fieldForIncorrect = "contrahechizo";
            break;
        case 1:
            questionText = `Recibes el hechizo "${currentData.hechizo}". ¿Qué mímica o reacción debes realizar al instante?`;
            correctAnswer = currentData.mimica;
            fieldForIncorrect = "mimica";
            break;
        case 2:
            questionText = `Ves que tu oponente tiene la siguiente reacción: "${currentData.mimica}". ¿Qué hechizo acabas de lanzarle/recibir?`;
            correctAnswer = currentData.hechizo;
            fieldForIncorrect = "hechizo";
            break;
    }

    DOM.game.questionText.innerText = questionText;
    
    const incorrectOptions = getIncorrectOptions(correctAnswer, fieldForIncorrect, 3);
    const allOptions = shuffleArray([correctAnswer, ...incorrectOptions]);

    DOM.game.optionsContainer.innerHTML = '';
    allOptions.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = option;
        btn.onclick = () => handleAnswer(btn, option, correctAnswer, questionText);
        DOM.game.optionsContainer.appendChild(btn);
    });

    // Iniciar el temporizador de 10s
    startTimer();
}

function handleAnswer(btnElement, selectedOption, correctAnswer, questionText) {
    clearInterval(state.timerInterval); // Detener el temporizador

    const isCorrect = selectedOption === correctAnswer;
    const allBtns = DOM.game.optionsContainer.querySelectorAll('.option-btn');
    allBtns.forEach(b => b.disabled = true);

    if (isCorrect && !state.isOutOfTime) {
        // Correcto a tiempo
        btnElement.classList.add('correct');
        state.score++;
    } else if (isCorrect && state.isOutOfTime) {
        // Correcto fuera de tiempo
        btnElement.classList.add('correct');
        state.errors.push({
            question: questionText,
            yourAnswer: "Correcta (Fuera de tiempo - 0 pts)",
            correctAnswer: correctAnswer,
            isLateCorrect: true
        });
    } else {
        // Incorrecto
        btnElement.classList.add('incorrect');
        allBtns.forEach(b => {
            if (b.innerText === correctAnswer) b.classList.add('correct');
        });
        
        let answerText = selectedOption;
        if(state.isOutOfTime) answerText += " (Fuera de tiempo)";

        state.errors.push({
            question: questionText,
            yourAnswer: answerText,
            correctAnswer: correctAnswer,
            isLateCorrect: false
        });
    }

    updateHeader();
    proceedToNextQuestion();
}

function proceedToNextQuestion() {
    setTimeout(() => {
        if (!DOM.screens.game.classList.contains('active')) return; // Si el usuario salió al menú
        
        state.currentRound++;
        if (state.currentRound < state.maxRounds) {
            loadQuestion();
            updateHeader();
        } else {
            endGame();
        }
    }, 1500); 
}

function updateHeader() {
    DOM.game.roundIndicator.innerText = `Ronda ${state.currentRound + 1}/${state.maxRounds}`;
    DOM.game.scoreIndicator.innerText = `Puntaje: ${state.score}`;
}

function endGame() {
    showScreen('result');
    DOM.result.finalScore.innerText = state.score;
    
    // Nuevo sistema de mensajes temáticos
    const ravenclawMessages = [
        "Un desastre absoluto. ¡Incluso Gilderoy Lockhart tendría más reflejos que tú! Regresa a la Biblioteca de Duelo.",
        "Una mente sin límites es el mayor tesoro, pero hoy dejaste la tuya en la Sala Común. Tienes mucha teoría por repasar.",
        "El conocimiento es tu mejor escudo, y ahora mismo estás completamente desarmado. ¡Concéntrate y vuelve a los libros!",
        "Tu agudeza mental parece estar bajo los efectos de un encantamiento Confundus. Las águilas vuelan más alto que esto.",
        "Raspando la mediocridad. Un verdadero Ravenclaw no confía en la suerte; confía en su memoria y su agilidad mental.",
        "Justo a la mitad. Conoces los nombres, pero necesitas estudiar mucho más para sobrevivir en la plataforma de duelo.",
        "Aceptable, pero recuerda que el intelecto requiere disciplina. Un repaso más en la Biblioteca pulirá esos errores.",
        "Muy buen trabajo. Estás casi listo para el Club de Duelo. Tu mente analítica ya empieza a guiar tu varita.",
        "¡Destacado! Una demostración de ingenio y rapidez digna de nuestra casa. Ya eres un rival de temer en la arena.",
        "¡Brillante! Solo un minúsculo desliz te separó de la perfección. Tienes la sabiduría táctica de un verdadero campeón.",
        "¡Excepcional! Digno de la inteligencia de Rowena Ravenclaw. Una ejecución perfecta, veloz y con una memoria impecable."
    ];

    DOM.result.scoreMessage.innerText = ravenclawMessages[state.score];

    DOM.result.errorsContainer.innerHTML = '';
    if (state.errors.length === 0) {
        DOM.result.errorsContainer.innerHTML = '<p style="text-align:center; color:#2ecc71;">¡No cometiste ningún error! Perfecto.</p>';
    } else {
        state.errors.forEach(err => {
            const errDiv = document.createElement('div');
            errDiv.className = 'error-item';
            
            if (err.isLateCorrect) {
                errDiv.classList.add('time-out-correct');
            }

            errDiv.innerHTML = `
                <p><strong>Pregunta:</strong> ${err.question}</p>
                <p><span class="error-label">Tu Elección:</span> <span>${err.yourAnswer}</span></p>
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
    // Aquí siempre iteramos sobre state.ataques ya que el quiz solo de ahí saca sus opciones
    const incorrectPool = state.ataques.filter(spell => spell[field] !== correctItem && spell[field]);
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

document.addEventListener('DOMContentLoaded', init);
