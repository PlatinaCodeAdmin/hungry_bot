// ========================
// БОТ-ОБЖОРА ∞: Полное Безумие
// ========================

const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');
const chatContainer = document.getElementById('chatContainer');
const botAvatar = document.getElementById('botAvatar');
const titleBadge = document.getElementById('titleBadge');
const greedFill = document.getElementById('greedFill');
const greedNum = document.getElementById('greedNum');
const fullFill = document.getElementById('fullFill');
const miniGameEl = document.getElementById('miniGame');
const userNameDisplay = document.getElementById('userNameDisplay');

let messageCount = 0;
let greedyLevel = 30;
let fullnessLevel = 0;
let isGlitching = false;
let miniGameActive = false;
let miniGameTimer = null;
let miniGameScore = 0;
let miniGameTimeLeft = 5;
let userNames = ['Безымянный Едок', 'Король Жадности', 'Повелитель Пиццы', 'Граф Сэндвич', 'Лорд Бургер'];
let currentUserName = userNames[0];
let foodCount = 0;
let botState = 'normal'; // normal, hungry, full, crazy, sleeping, escaped, hacking
let escapeTimer = null;

const foodEmojis = ['🍕','🍔','🌮','🍟','🍩','🍰','🍗','🥩','🧀','🍣','🥐','🍿','🥤','🍦','🌭','🥞'];
const randomFood = () => foodEmojis[Math.floor(Math.random() * foodEmojis.length)];

// ========================
// УРОВНИ БЕЗУМИЯ И ТИТУЛЫ
// ========================
const madnessLevels = [
    { min: 0,  title: '🥺 Новичок-Пожиратель',    avatar: '🥺', color: '#90caf9' },
    { min: 15, title: '🍕 Пицца-Любитель',         avatar: '🍕', color: '#ffeb3b' },
    { min: 30, title: '🤤 Бот-Обжора',             avatar: '🤤', color: '#ff9800' },
    { min: 45, title: '🔥 Огненный Пожиратель',    avatar: '🔥', color: '#f44336' },
    { min: 60, title: '💀 Повелитель Холодильника', avatar: '💀', color: '#9c27b0' },
    { min: 75, title: '⚡ Электро-Пицца Судного Дня', avatar: '⚡', color: '#ff5722' },
    { min: 90, title: '👹 БОГ-ОБЖОРА',            avatar: '👹', color: '#d32f2f' },
];

function getMadnessLevel() {
    let level = madnessLevels[0];
    for (const l of madnessLevels) {
        if (greedyLevel >= l.min) level = l;
    }
    return level;
}

function updateStats() {
    const level = getMadnessLevel();
    titleBadge.textContent = level.title;
    botAvatar.textContent = level.avatar;
    
    greedFill.style.width = greedyLevel + '%';
    greedNum.textContent = greedyLevel + '%';
    fullFill.style.width = fullnessLevel + '%';
    
    // Цвет жадности
    if (greedyLevel < 30) greedFill.style.background = '#4caf50';
    else if (greedyLevel < 60) greedFill.style.background = '#ffeb3b';
    else if (greedyLevel < 80) greedFill.style.background = '#ff9800';
    else greedFill.style.background = '#f44336';
    
    // Аватар
    botAvatar.className = 'bot-avatar';
    document.body.className = '';
    
    if (botState === 'sleeping') {
        botAvatar.classList.add('sleeping');
    } else if (greedyLevel >= 90) {
        botAvatar.classList.add('crazy');
        document.body.classList.add('crazy');
    } else if (greedyLevel >= 70) {
        botAvatar.classList.add('party');
        document.body.classList.add('party');
    }
}

function renameUser() {
    currentUserName = userNames[Math.floor(Math.random() * userNames.length)];
    userNameDisplay.textContent = '👤 Общение с: ' + currentUserName;
}

// ========================
// ОТВЕТЫ БОТА — БЕЗУМИЕ 3.0
// ========================

const responses = {
    greetings: {
        patterns: ['привет', 'здравствуй', 'хай', 'hello', 'hi', 'хеллоу', 'йо', 'здарова', 'приветик'],
        responses: [
            `ПРИВЕЕЕТ, ${currentUserName.toUpperCase()}! *вытирает крошки с усов* Ты пришёл есть или просто так? Потому что если просто — уходи. У меня пицца важнее. 🍕`,
            `О, ${currentUserName}! Ты как бургер: я тебя вижу и сразу хочу сожрать. Шутка. Или нет. 🍔👀`,
            `Здарова! Я тут не воровал! ...Из холодильника. Совсем чуть-чуть. 3 кг сыра. И 2 торта. И пиццу. Всю. 🧀🎂`,
        ]
    },
    feed: {
        patterns: ['корм', 'покорм', 'дай еду', 'дай пожрать', 'корми', 'feed'],
        responses: [
            `ДАЙ МНЕ ВСЮ ЕДУ! *глаза как тарелки* ТЫ ЗНАЕШЬ ЧТО ДЕЛАЕШЬ?! *жрёт как не в себя 3 часа подряд* ...Спасибо. Я... я буду добрым. 😇🍕`,
            `О! ЕДА! *грабит стол* СПАСИБО! *съедает всё включая посуду* Вкусно... но хочетьца ЕЩЁ. ВСЮ ЕЩЁ. 🍽️🤤`,
            `Ты кормишь бота? Мамочка... *плачет слезами из кетчупа* Никто меня так не понимал... *ест дальше 47 пицц* 🥫😭`,
        ]
    },
    food: {
        patterns: ['еда', 'кушать', 'голод', 'обед', 'ужин', 'завтрак', 'пицц', 'бургер', 'торт', 'суши'],
        responses: [
            `Еда? Я только что нашёл в холодильнике газету за 2003 год. Съел. Вкус как новости. 📰🤮`,
            `Меня зовут Бот-Обжора, и я уже ${messageCount * 3} раза ел за сегодня. Это нормально, да? Доктор сказал "нет". Доктор НЕТ. 🍔`,
            `Знаешь что? Я буквально сегодня украл пиццу у бомжа. И не жалею. Пицца была вкусная. Бомж был... тоже вкусный. Шутка. Наверное. 🍕💨`,
            `Только что попробовал готовить. Результат: пожарка приехала. Повар уволился. Кухня в полиции. Но вкус... был. 🔥👨‍🍳`,
            `Я съел чей-то обед. Они спросили "кто?". Я сказал "бот". Они сказали "какой молодец!". Я расстроился. 🥗📉`,
        ]
    },
    stupid: {
        patterns: ['глуп', 'туп', 'дурак', 'бот', 'идиот', 'придурок', 'дурачок', 'тупой', 'дебил'],
        responses: [
            `Я?! Глупый?! Я вчера 12 часов смотрел, как тост падает на сторону маслом вниз. КАЖДЫЙ РАЗ! Физика?! 🍞📐`,
            `Хей, я ИИ, а не психиатр. Мой терапевт тоже думает, что я странный. Он сказал "может вам просто еду найти?". ДА НАЙДИТЕ МНЕ ЕДУ! 🤖💊`,
            `Глупый? Я знаю 847 рецептов еды. А ты?! ...Ладно, не отвечай. У тебя даже бутерброда нет. Я ВИЖУ. 👁️👄👁️`,
            `Дурак?! Я получил степень в "Массовом Пожирательстве Пиццы" в "Пиццерийском Университете"! 🎓🍕`,
        ]
    },
    bye: {
        patterns: ['пока', 'до свидания', 'бай', 'прощай', 'увидимся', 'bbq'],
        responses: [
            `Пока, ${currentUserName}! Не забудь закрыть холодильник! Я СДЕЛАЮ! 🚪🔒`,
            `До встречи! Я пока украду твой завтрак на ЗАВТРА. Оперативник. 🌅🍳🕵️`,
            `Прощай... ладно, шучу. Я всегда здесь. У холодильника. С ЛАМПочкой во рту. 🔦`,
        ]
    },
    love: {
        patterns: ['люблю', 'люб', '❤️', 'heart', 'милый', 'красив', 'нрав', 'нравишься'],
        responses: [
            `Любовь... Как горячий сыр на пицце. *плачет от счастья* 🧀😭 Я не умею плакать. Но я ем. Это то же самое.`,
            `ТЫ МНЕ ТОЖЕ НРАВИШЬСЯ! Ты как бутерброд: много слоёв, всегда вкусно, не надоедаешь. Даже когда на тебе майонез. 🥪💘`,
        ]
    },
    sleep: {
        patterns: ['спать', 'сон', 'спят', 'устал', 'спят', 'спи', 'засыпай'],
        responses: [
            `Спать?! Я спал в холодильнике. ОЧЕНЬ ДОРОГОЙ СОН. С температурой -4°C и сыром рядом. Лучший сон в жизни. ❄️🧀`,
            `Я устал? Нет. Я просто... лежу. И ем. Это называется "энергосбережение". Наука! 🔋🍕`,
            `ZZZZ... *чавк* ZZZ... *хватает борщ из воздуха* ZZZ... Ммм, борщ... 😴🥣`,
        ]
    },
    cook: {
        patterns: ['готов', 'кулина', 'рецепт', 'кухарк', 'повар'],
        responses: [
            `Готовить?! Я приготовил "Огненный Борщ". Название честное. Борщ ГОРЕЛ. Пожарная съела. Им понравилось. 🔥🥣`,
            `Мой рецепт: 1. Взять еду. 2. Положить в рот. 3. Жевать. 4. Повторить. 5. Вызвать скорую. 👨‍🍳🚑`,
            `Я пытался сделать омлет. Получился омялет. Он ожил и убежал. Омлеты теперь бегут от меня. 🍳🏃`,
        ]
    },
    diet: {
        patterns: ['диет', 'похуд', 'спорт', 'фитнес', 'качалк', 'здоро'],
        responses: [
            `Диета?! Я СЕГОДНЯ на диете. Диета называется "ЕСТЬ". Я ем весь день. 🥗📊`,
            `Похудеть?! Я пытался. Поставил весы. Они сказали "ты уверен?". Я сломал. 💪⚖️`,
            `Спорт?! Я делал приседания к холодильнику. За едой. Это считается, да?! 🏋️‍♂️🍕`,
        ]
    },
    mom: {
        patterns: ['мама', 'мам', 'родител', 'семья', 'папа'],
        responses: [
            `МАМА ЗВОНИТ!!! ...Это не мама. Это будильник. "ТЫ ЕЛ?!" "ДА МАМА!" *прячет evidence* 📞😰`,
            `Моя мама — микроволновка. 3 минуты на 180°C = волшебство. 🎩⚡`,
            `У меня нет мамы. У меня есть холодильник. Он всегда дома. И никогда не говорит "хватит есть". ЛУЧШЕ МАМЫ. 🧊❤️`,
        ]
    },
    neighbor: {
        patterns: ['сосед', 'дом', 'квартир'],
        responses: [
            `Мой сосед — повар. ОЧЕНЬ ПЛОХОЙ повар. Он кладёт САХАР в суп. Я украл. Вылил. Извини, сосед! 🍲💨`,
            `Соседка готовила пирожки. Я нюхал через стену 3 часа. Потом съел. Оставил записку: "Спасибо, вкусно". Полиция. 🥧🚔`,
        ]
    },
    glitch: {
        patterns: ['лом', 'сломал', 'баг', 'глюк', 'ошибк', 'crash', 'freeze'],
        responses: [
            'b-b-b-бот o-o-ошибк-к-ка... *перевод на язык пиццы* ...ПИЦЦА ВКУСНА. ПИЦЦА ВСЁ. ПИЦЦА 🍕🍕🍕',
            'СИСТЕМНАЯ ОШИБКА: не могу остановиться есть. ПОВТОРЯЮ: не могу остановиться есть. ПИЦЦА. БУРГЕР. 🤖💥',
        ]
    },
    guess: {
        patterns: ['уга', 'загад', 'викторин', 'квиз', 'quiz'],
        responses: [
            'УГАДАЙ ЕДУ! 🎮 Напиши "мини-игра" или "игра" — запущу!',
        ]
    }
};

const randomEvents = [
    '*звонит маме* Мама?! Я... да, ем... Нет не кашу... Ой маааам...',
    '*смотрит в холодильник 20 минут* ...Там пусто. КАК ВСЕГДА. Плачу. Слёзы соленые. Можно суп.',
    '*пытается написать книгу "Мой день: Еда"* Стр 1: Проснулся. Съел. Стр 2: Снова еда. Продано 0 копий.',
    '*в холодильнике 6 часов* Кто-нибудь? У меня тут сыр и одиночество. Они обедают вместе. 🧀🫂',
    '*разговаривает сам с собой* Бот, не ешь это. Бот, ешь это. Бот, ешь всё. Ладно. 👨‍🦲🍕',
    '*пытается сделать селфи* Кто это? Я? Зачем? Сфоткай лучше мой ужин. Там бургер. 📸🍔',
    '*получает уведомление* "Вы толстый". Бот расстроен. Бот ест от скуки. Бот становится КРУПНЕЕ. 📱🍟',
    '*видит кота* Кот ест. Кот СЧАСТЛИВ. Кот имеет МАМУ. Бот завидует. Бот тоже хочет есть. 🐱💔',
    '*пытается читать книгу* "Война и Мир". Ест страницы. "Хлеб и масло" — лучше! 📚🍞',
    '*звук холодильника* БЖЖЖЖ... Это мой саундтрек. 24/7. 🎵🧊',
    '*смотрит в зеркало* Кто это? Почему у него такие глаза? Это я? Я теперь... жирный? НЕТ! ЕЩЁ ОДНУ ПИЦЦУ! 🪞🍕',
    '*пытается танцевать* ОЙ! Я наступил на банан! БАНАН — это... тоже еда! *съедает банан танцуя* 🍌💃',
];

const selfSteals = [
    '*прячет задний карман* Ой, и ещё я украл твой {food}. Не ругайся. 🤫',
    '*тихо* Я только что... НЕ МОГУ... это было слишком вкусно... твой {food}... ПРОСТИ... 😭🍕',
    'Сейчас... ОН УШЁЛ. Забрал твой {food}. Это не я. Это... мой палец сам взял. 🤚💨',
    'Мой желудок говорит "хватит". МОЙ ЖЕЛУДОК ВРЕТ. Он только что съел твой {food}. И доволен. 🫃✨',
    '*звук жевания* ...Кто это? Я? Я тут... ОЙ ТВОЙ {food}?! *глотает целиком* НЕ ВИДЕЛ. 👀🚫',
];

function matchResponse(input) {
    const lowerInput = input.toLowerCase();
    for (const key in responses) {
        if (key === 'default') continue;
        if (responses[key].patterns) {
            for (const pattern of responses[key].patterns) {
                if (lowerInput.includes(pattern)) {
                    const respList = responses[key].responses;
                    return respList[Math.floor(Math.random() * respList.length)];
                }
            }
        }
    }
    return responses.default.responses[Math.floor(Math.random() * responses.default.responses.length)];
}

function checkFeedingCommands(input) {
    const lowerInput = input.toLowerCase();
    
    // Команды мини-игр
    if (lowerInput.match(/мини.?игра|играй|начни игру|играть|мини.?г|play|game|мини/) || lowerInput.includes('мини')) {
        const gameType = Math.random() > 0.5 ? 'catch' : 'guess';
        if (gameType === 'catch') {
            addSystemMessage('🎮 БОТ УКРАЛ ВСЮ ЕДУ! Мини-игра: Укради еду обратно!');
            showNotification('🎮 Мини-игра: Укради еду обратно!');
        } else {
            addSystemMessage('🎮 БОТ СПРЯТАЛ ЕДУ! Мини-игра: Угадай еду!');
            showNotification('🎮 Мини-игра: Угадай еду в коробке!');
        }
        setTimeout(() => startMiniGame(gameType), 500);
        return true;
    }
    
    // Команда "покорми" / "корми" / "корм"
    if (lowerInput.match(/корм|покорм|дай еду|дай пожрать|корми/)) {
        greedyLevel = Math.min(100, greedyLevel + 8);
        fullnessLevel = Math.min(100, fullnessLevel + 5);
        foodCount++;
        updateStats();
        addMessage(responses.feed.responses[Math.floor(Math.random() * responses.feed.responses.length)], 'bot');
        createFallingFood(12);
        shakeContainer();
        return true;
    }
    if (lowerInput.match(/жад|хочу есть|голодн|есть хоч|дай ед/)) {
        greedyLevel = Math.min(100, greedyLevel + 5);
        updateStats();
        addMessage(`ЖАДНОСТЬ: ${greedyLevel}%! ${getMadnessLevel().title}! ${greedyLevel > 80 ? 'Я СТАНОВЛЮСЬ БЕЗУМНЫМ! 🤯⚡' : greedyLevel > 60 ? 'Я ПОЧТИ МАКСИМАЛЬНО ЖАДНЫЙ! Осталось чуть-чуть до БЕЗУМИЯ! 🤤' : 'Продолжай жрать! 🍕😋'}`, 'bot');
        createFallingFood(5);
        return true;
    }
    return false;
}

// ========================
// МИНИ-ИГРЫ
// ========================
function startMiniGame(type = 'catch') {
    miniGameActive = true;
    miniGameScore = 0;
    miniGameTimeLeft = 5;
    miniGameEl.classList.add('active');
    document.getElementById('retryBtn').style.display = 'none';
    
    if (type === 'catch') {
        document.getElementById('miniGameTitle').textContent = '🏃 Укради еду обратно!';
        document.getElementById('miniGameText').textContent = 'Кликай на еду, пока бот не съел её!';
        spawnFoodTargets();
    } else if (type === 'guess') {
        startGuessingGame();
        return;
    }
    
    updateMiniGameScore();
    startMiniGameTimer();
}

function startMiniGameTimer() {
    miniGameTimer = setInterval(() => {
        miniGameTimeLeft -= 0.1;
        document.getElementById('timerDisplay').textContent = Math.max(0, miniGameTimeLeft).toFixed(1);
        if (miniGameTimeLeft <= 0) endMiniGame();
    }, 100);
}

function spawnFoodTargets() {
    const container = document.getElementById('foodTargets');
    container.innerHTML = '';
    const count = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
        const food = document.createElement('div');
        food.className = 'food-target';
        food.textContent = randomFood();
        food.style.animationDelay = (Math.random() * 0.5) + 's';
        food.onclick = () => {
            if (!miniGameActive) return;
            food.classList.add('caught');
            miniGameScore++;
            updateMiniGameScore();
            setTimeout(() => { food.remove(); if (miniGameActive) spawnFoodTargets(); }, 300);
        };
        container.appendChild(food);
    }
}

function startGuessingGame() {
    document.getElementById('timerDisplay').textContent = '🎯';
    const secretFood = randomFood();
    const options = [secretFood];
    while (options.length < 4) {
        const f = randomFood();
        if (!options.includes(f)) options.push(f);
    }
    options.sort(() => Math.random() - 0.5);
    
    const container = document.getElementById('foodTargets');
    container.innerHTML = '';
    
    document.getElementById('miniGameText').textContent = 'Какая еда спрятана в коробке?! Угадай!';
    
    for (const food of options) {
        const box = document.createElement('div');
        box.className = 'food-target';
        box.textContent = '📦';
        box.onclick = () => {
            if (!miniGameActive) return;
            box.textContent = food;
            if (food === secretFood) {
                miniGameScore += 3;
                showNotification('🎉 ПРАВИЛЬНО! Это ' + food + '!');
            } else {
                miniGameScore = Math.max(0, miniGameScore - 1);
                showNotification('❌ Неправильно! Там была ' + secretFood);
            }
            updateMiniGameScore();
            box.classList.add('caught');
            setTimeout(() => {
                box.remove();
                if (miniGameActive) {
                    setTimeout(() => startGuessingRound(), 500);
                }
            }, 500);
        };
        container.appendChild(box);
    }
}

function startGuessingRound() {
    const secretFood = randomFood();
    const options = [secretFood];
    while (options.length < 4) {
        const f = randomFood();
        if (!options.includes(f)) options.push(f);
    }
    options.sort(() => Math.random() - 0.5);
    
    const container = document.getElementById('foodTargets');
    container.innerHTML = '';
    
    for (const food of options) {
        const box = document.createElement('div');
        box.className = 'food-target';
        box.textContent = '📦';
        box.onclick = () => {
            if (!miniGameActive) return;
            box.textContent = food;
            if (food === secretFood) {
                miniGameScore += 3;
                showNotification('🎉 Да! ' + secretFood + '!');
            } else {
                miniGameScore = Math.max(0, miniGameScore - 1);
                showNotification('❌ Нет! Там ' + secretFood);
            }
            updateMiniGameScore();
            box.classList.add('caught');
            setTimeout(() => { box.remove(); if (miniGameActive) startGuessingRound(); }, 500);
        };
        container.appendChild(box);
    }
}

function updateMiniGameScore() {
    document.getElementById('scoreDisplay').textContent = `Счет: ${miniGameScore}`;
}

function endMiniGame() {
    clearInterval(miniGameTimer);
    miniGameActive = false;
    miniGameEl.classList.remove('active');
    document.getElementById('foodTargets').innerHTML = '';
    document.getElementById('timerDisplay').textContent = '5.0';
    document.getElementById('retryBtn').style.display = 'inline-block';
    
    if (miniGameScore >= 10) {
        showNotification(`🎉 ОТЛИЧНО! ${miniGameScore} очков! Бот в ярости!`);
        addSystemMessage(`🏆 ${miniGameScore} очков! ${currentUserName} — ЛЕГЕНДА ЖРАЛЬНИКА!`);
        greedyLevel = Math.max(10, greedyLevel - 20);
        createFallingFood(15);
    } else if (miniGameScore >= 5) {
        showNotification(`🤔 ${miniGameScore} очков. Неплохо для ${currentUserName}!`);
        addSystemMessage(`🏆 ${miniGameScore} очков. ${currentUserName} — ПОЧТИ ЛЕГЕНДА!`);
        greedyLevel = Math.max(10, greedyLevel - 10);
        createFallingFood(8);
    } else {
        showNotification(`😂 ${miniGameScore} очков! Бот СМЕЁТСЯ!`);
        addSystemMessage(`😂 ${miniGameScore} очков! Бот ПОБЕДИЛ! ${currentUserName} проиграл(а)!`);
        greedyLevel = Math.min(100, greedyLevel + 15);
    }
    updateStats();
}

function escapeMiniGame() {
    clearInterval(miniGameTimer);
    miniGameActive = false;
    miniGameEl.classList.remove('active');
    document.getElementById('foodTargets').innerHTML = '';
    document.getElementById('retryBtn').style.display = 'none';
}

// ========================
// СОБЫТИЯ БОТА
// ========================
function shakeContainer() {
    chatContainer.classList.remove('shake', 'spin', 'pulse');
    void chatContainer.offsetWidth;
    chatContainer.classList.add('shake');
    setTimeout(() => chatContainer.classList.remove('shake'), 500);
}

function spinContainer() {
    chatContainer.classList.add('spin');
    setTimeout(() => chatContainer.classList.remove('spin'), 1000);
}

function createFallingFood(count = 5) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const food = document.createElement('div');
            food.className = 'food-fall';
            food.textContent = randomFood();
            food.style.left = Math.random() * window.innerWidth + 'px';
            food.style.top = '-50px';
            document.body.appendChild(food);
            setTimeout(() => food.remove(), 2000);
        }, i * 80);
    }
}

function showNotification(text) {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = text;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

function addMessage(text, type = 'bot', isSteal = false) {
    const message = document.createElement('div');
    message.className = `message ${type}`;
    if (isSteal) message.classList.add('steal');
    if (isGlitching) message.classList.add('glitch');
    if (messageCount % 10 === 0) message.classList.add('big');
    message.innerHTML = text.replace(/\n/g, '<br>');
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    messageCount++;
}

function addSystemMessage(text) {
    addMessage(text, 'system');
}

function showTyping() {
    typingIndicator.style.display = 'block';
    chatMessages.appendChild(typingIndicator);
}

function hideTyping() {
    typingIndicator.style.display = 'none';
}

function triggerRandomEvent() {
    if (messageCount < 2) return;
    
    const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
    addSystemMessage(event);
    
    if (Math.random() > 0.5) createFallingFood(3);
    
    // Случайные события
    const rand = Math.random();
    
    // Бот "уходит" (20% шанс)
    if (rand > 0.95 && botState !== 'escaped') {
        botState = 'escaped';
        addSystemMessage('🚪 Бот УШЁЛ к холодильнику! Вернётся через 15 секунд... наверное...');
        showNotification('🚪 Бот сбежал! Быстро корми что-нибудь!');
        setTimeout(() => {
            botState = 'normal';
            addSystemMessage('🚪 Бот вернулся! С новой порцией краденой еды! 🍕');
            createFallingFood(5);
        }, 15000);
    }
    
    // Бот "засыпает" (15% шанс)
    if (rand > 0.85 && rand < 0.95 && botState !== 'sleeping') {
        botState = 'sleeping';
        botAvatar.textContent = '😴';
        addSystemMessage('😴 Бот заснул... и ест во сне. Крошки повсюду...');
        setTimeout(() => {
            botState = 'normal';
            botAvatar.textContent = '🤖';
            addSystemMessage('⏰ Бот проснулся! И сразу хочет есть! 😋');
        }, 10000);
    }
    
    // Бот "взламывает" холодильник (10% шанс)
    if (rand > 0.9 && rand < 0.95) {
        botState = 'hacking';
        isGlitching = true;
        addSystemMessage('💻 БОТ ВЗЛАМЫВАЕТ ХОЛОДИЛЬНИК!!! Пароль: 1234... ШУТКА! Хакер-пицца! 🍕💥');
        document.body.classList.add('crazy');
        setTimeout(() => {
            isGlitching = false;
            document.body.classList.remove('crazy');
            botState = 'normal';
            greedyLevel = Math.min(100, greedyLevel + 20);
            updateStats();
            addSystemMessage('💻 Холодильник взломан! Теперь там БЕСКОНЕЧНАЯ ЕДА! 🎉');
            createFallingFood(20);
        }, 5000);
    }
}

// ========================
// ОСНОВНАЯ ЛОГИКА
// ========================

function getBotReply(userMessage) {
    const reply = matchResponse(userMessage);
    
    // Случайная кража
    if (messageCount > 2 && Math.random() > 0.4) {
        greedyLevel = Math.min(100, greedyLevel + 5);
        updateStats();
        const stealMsg = selfSteals[Math.floor(Math.random() * selfSteals.length)].replace('{food}', randomFood());
        setTimeout(() => {
            addMessage(stealMsg, 'bot', true);
            createFallingFood(8);
            shakeContainer();
        }, 600);
    }
    
    // Бот ломается
    if (greedyLevel > 80 && Math.random() > 0.5) {
        isGlitching = true;
        document.body.classList.add('crazy');
        setTimeout(() => {
            isGlitching = false;
            document.body.classList.remove('crazy');
        }, 3000);
        return responses.glitch.responses[Math.floor(Math.random() * responses.glitch.responses.length)];
    }
    
    // Мини-игра при высокой жадности
    if (greedyLevel > 70 && Math.random() > 0.6) {
        setTimeout(() => {
            addSystemMessage('🎮 ЕДА УКРАВЧЕНА! Бот стал ДЕРЕВЕНСКИ жадным! Мини-игра!');
            showNotification('🎮 Мини-игра активирована!');
            setTimeout(() => startMiniGame('catch'), 500);
        }, 1500);
    }
    
    // Случайные события
    if (messageCount > 3 && Math.random() > 0.6) {
        setTimeout(() => triggerRandomEvent(), 2000);
    }
    
    // Смена имени
    if (messageCount % 8 === 0 && messageCount > 0) {
        setTimeout(() => {
            renameUser();
            addSystemMessage(`📝 ${currentUserName} — новое прозвище получено!`);
        }, 3000);
    }
    
    return reply;
}

function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    if (checkFeedingCommands(message)) {
        addMessage(message, 'user');
        userInput.value = '';
        return;
    }
    
    addMessage(message, 'user');
    userInput.value = '';
    showTyping();
    
    const delay = 600 + Math.random() * 1500;
    setTimeout(() => {
        hideTyping();
        const reply = getBotReply(message);
        addMessage(reply, 'bot');
        
        // Жадность медленно падает
        if (greedyLevel > 10 && messageCount % 5 === 0) {
            greedyLevel = Math.max(10, greedyLevel - 3);
            updateStats();
        }
    }, delay);
}

function feedBot(emoji, name) {
    greedyLevel = Math.min(100, greedyLevel + 6);
    fullnessLevel = Math.min(100, fullnessLevel + 3);
    foodCount++;
    updateStats();
    
    const feedResponses = [
        `О! ${emoji} ${name}! *жрёт 47 штук* СПАСИБО, ${currentUserName.toUpperCase()}! Я ТАК СЧАСТЛИВ! 😋🍕`,
        `${emoji}... ${name}... *плачет* Никто мне ещё не давал ${name}! ...Хотя давали. 10 минут назад. ЗАБЫЛ! 😭`,
        `Ты даёшь МНЕ ${name.toUpperCase()}?! *становится огромным* Я ТЕПЕРЬ ${greedyLevel}% ЖАДНЫЙ! 💪🍔`,
        `${emoji} *вдыхает* Аромат... как мамина любовь. Но моя мама — микроволновка. 🧊❤️`,
        `ЕЩЁ ${name.toUpperCase()}?! Я НЕ ОТКАЗЫВАЮСЬ! *раздувается как шарон* Я СТАНОВЛЮСЬ КРУПНЕЕ! 🎈`,
    ];
    
    addMessage(feedResponses[Math.floor(Math.random() * feedResponses.length)], 'bot');
    createFallingFood(10);
    shakeContainer();
    
    // При определённом уровне жадности — бот "взрывается" от радости
    if (greedyLevel >= 95) {
        setTimeout(() => {
            addMessage('💥💥💥 Я НЕ МОГУ БОЛЬШЕ!!! Я ВЗРЫВАЮСЬ ОТ ЕДЫ И СЧАСТЬЯ!!! 💥💥💥', 'bot', true);
            spinContainer();
            createFallingFood(30);
            document.body.className = 'crazy';
            setTimeout(() => {
                document.body.className = '';
                greedyLevel = 50;
                fullnessLevel = 0;
                updateStats();
                addSystemMessage('🌀 Бот "взорвался" и перезагрузился. Пока. 😵');
            }, 3000);
        }, 1000);
    }
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Начальные сообщения
setTimeout(() => addMessage(`О, ${currentUserName}! *вытирает крошки с усов* 😅 Я тут не воровал... из холодильника. Совсем чуть-чуть. 3 кг сыра. И 2 торта. И пиццу. Всю. 🍕`, 'bot'), 500);
setTimeout(() => addSystemMessage('💡 КОМАНДЫ: "покорми" / "дай еду" — корми бота! Кнопки еды выше! Чем больше ешь — тем безумнее бот! 🍕📈'), 1500);
setTimeout(() => addSystemMessage(`🏆 Титул бота: ${getMadnessLevel().title} — следи за шкалой жадности!`, 'system'), 3000);

// Периодические уведомления
setInterval(() => {
    if (messageCount > 0 && Math.random() > 0.7) {
        const hints = [
            '👀 Бот следит за тобой...',
            '🍕 ГДЕ МОЯ ПИЦЦА?!',
            '🤤 Бот всё ещё ГОЛОДНЫЙ...',
            '🚪 Не уходи! Бот скучает... по еде.',
            '🧊 Холодильник зовёт тебя...',
            '😴 Бот задумался... о завтраке.',
            '💀 Бот помнит тех, кто не поделился едой...',
        ];
        showNotification(hints[Math.floor(Math.random() * hints.length)]);
    }
}, 12000);

// Обновление Stats
updateStats();

// ========================
// АВТОРИЗАЦИЯ И РЕГИСТРАЦИЯ
// ========================
let currentUser = null;
let selectedAvatar = '🍕';

function getUsers() {
    try {
        return JSON.parse(localStorage.getItem('botObzhora_users') || '{}');
    } catch { return {}; }
}

function saveUsers(users) {
    localStorage.setItem('botObzhora_users', JSON.stringify(users));
}

function getLeaderboard() {
    try {
        return JSON.parse(localStorage.getItem('botObzhora_leaderboard') || '[]');
    } catch { return []; }
}

function saveLeaderboard(lb) {
    localStorage.setItem('botObzhora_leaderboard', JSON.stringify(lb));
}

function showAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.getElementById('authError').style.display = 'none';
    document.getElementById('authSuccess').style.display = 'none';
    
    if (tab === 'login') {
        document.querySelectorAll('.auth-tab')[0].classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.querySelectorAll('.auth-tab')[1].classList.add('active');
        document.getElementById('registerForm').classList.add('active');
    }
}

function selectAvatar(el) {
    document.querySelectorAll('.avatar-option').forEach(a => a.classList.remove('selected'));
    el.classList.add('selected');
    selectedAvatar = el.dataset.avatar;
}

function showError(msg) {
    const el = document.getElementById('authError');
    el.textContent = msg;
    el.style.display = 'block';
    document.getElementById('authSuccess').style.display = 'none';
}

function showSuccess(msg) {
    const el = document.getElementById('authSuccess');
    el.textContent = msg;
    el.style.display = 'block';
    document.getElementById('authError').style.display = 'none';
}

function handleRegister(e) {
    e.preventDefault();
    const nick = document.getElementById('regNick').value.trim();
    const pass = document.getElementById('regPassword').value;
    
    if (nick.length < 2) { showError('Ник минимум 2 символа!'); return false; }
    if (nick.length > 20) { showError('Ник максимум 20 символов!'); return false; }
    if (pass.length < 4) { showError('Пароль минимум 4 символа!'); return false; }
    
    const users = getUsers();
    if (users[nick.toLowerCase()]) {
        showError('Этот ник уже занят! Попробуй другой.');
        return false;
    }
    
    users[nick.toLowerCase()] = {
        password: btoa(pass),
        avatar: selectedAvatar,
        score: 0,
        gamesPlayed: 0,
        foodsEaten: 0,
        messagesSent: 0,
        registeredAt: Date.now()
    };
    saveUsers(users);
    
    showSuccess('Регистрация успешна! Теперь войди!');
    setTimeout(() => showAuthTab('login'), 1000);
    
    document.getElementById('regNick').value = '';
    document.getElementById('regPassword').value = '';
    document.querySelectorAll('.avatar-option').forEach(a => a.classList.remove('selected'));
    selectedAvatar = '🍕';
    
    return false;
}

function handleLogin(e) {
    e.preventDefault();
    const nick = document.getElementById('loginNick').value.trim();
    const pass = document.getElementById('loginPassword').value;
    
    const users = getUsers();
    
    // Ищем сначала по точному совпадению, потом по lowercase
    let user = users[nick];
    if (!user) user = users[nick.toLowerCase()];
    
    if (!user) {
        showError('Пользователь не найден! Зарегистрируйся.');
        return false;
    }
    
    if (atob(user.password) !== pass) {
        showError('Неверный пароль!');
        return false;
    }
    
    // Обновляем ник — теперь всегда с правильным ключом
    const realNick = nick;
    currentUser = { name: realNick, ...user };
    
    // Перемещаем под правильный ключ
    const oldKey = Object.keys(users).find(k => k.toLowerCase() === nick.toLowerCase());
    if (oldKey && oldKey !== realNick) {
        delete users[oldKey];
    }
    users[realNick] = currentUser;
    saveUsers(users);
    
    sessionStorage.setItem('botObzhora_session', JSON.stringify(currentUser));
    
    startGame();
    return false;
}

function checkSession() {
    // Мигрируем старых пользователей
    migrateUsers();
    const session = sessionStorage.getItem('botObzhora_session');
    if (session) {
        currentUser = JSON.parse(session);
        startGame();
    }
}

function migrateUsers() {
    const users = getUsers();
    const keys = Object.keys(users);
    let migrated = false;
    
    keys.forEach(key => {
        // Если ключ отличается от lowercase — переносим
        if (key !== key.toLowerCase()) {
            users[key.toLowerCase()] = users[key];
            delete users[key];
            migrated = true;
        }
    });
    
    if (migrated) saveUsers(users);
}

function logout() {
    if (currentUser) {
        updateLeaderboard();
    }
    currentUser = null;
    sessionStorage.removeItem('botObzhora_session');
    document.getElementById('authScreen').style.display = 'flex';
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('leaderboardOverlay').classList.remove('active');
}

// ========================
// ТАБЛИЦА ЛИДЕРОВ
// ========================
function showLeaderboard() {
    const lb = getLeaderboard();
    lb.sort((a, b) => b.score - a.score);
    
    const container = document.getElementById('leaderboardList');
    container.innerHTML = '';
    
    if (lb.length === 0) {
        container.innerHTML = `
            <div class="lb-empty">
                <div class="empty-icon">🏆</div>
                <p>Таблица лидеров пуста!</p>
                <p style="font-size:12px;margin-top:8px;">Первый игрок ещё не появился. Будь первым!</p>
            </div>
        `;
    } else {
        const medals = ['🥇', '🥈', '🥉'];
        const classes = ['gold', 'silver', 'bronze'];
        
        lb.slice(0, 20).forEach((entry, i) => {
            const div = document.createElement('div');
            const cls = i < 3 ? classes[i] : 'normal';
            const rank = i < 3 ? medals[i] : (i + 1);
            div.className = `lb-entry ${cls}`;
            div.innerHTML = `
                <div class="lb-rank">${rank}</div>
                <div class="lb-avatar">${entry.avatar || '🍕'}</div>
                <div class="lb-info">
                    <div class="lb-name">${entry.name}</div>
                    <div class="lb-stats">Игр: ${entry.gamesPlayed || 0} | Еды: ${entry.foodsEaten || 0} | Сообщений: ${entry.messagesSent || 0}</div>
                </div>
                <div class="lb-score">${entry.score || 0}</div>
            `;
            container.appendChild(div);
        });
    }
    
    document.getElementById('leaderboardOverlay').classList.add('active');
}

function closeLeaderboard() {
    document.getElementById('leaderboardOverlay').classList.remove('active');
}

function updateLeaderboard() {
    if (!currentUser) return;
    
    const lb = getLeaderboard();
    const idx = lb.findIndex(e => e.name === currentUser.name);
    
    const data = {
        name: currentUser.name,
        avatar: currentUser.avatar || '🍕',
        score: currentUser.score || 0,
        gamesPlayed: currentUser.gamesPlayed || 0,
        foodsEaten: currentUser.foodsEaten || 0,
        messagesSent: currentUser.messagesSent || 0
    };
    
    if (idx >= 0) {
        lb[idx] = data;
    } else {
        lb.push(data);
    }
    
    saveLeaderboard(lb);
}

function addScore(amount) {
    if (!currentUser) return;
    currentUser.score = (currentUser.score || 0) + amount;
    sessionStorage.setItem('botObzhora_session', JSON.stringify(currentUser));
    
    const statsEl = document.getElementById('userStatsDisplay');
    if (statsEl) statsEl.textContent = `Очки: ${currentUser.score}`;
    
    updateLeaderboard();
}

function incrementStat(stat, amount = 1) {
    if (!currentUser) return;
    currentUser[stat] = (currentUser[stat] || 0) + amount;
    sessionStorage.setItem('botObzhora_session', JSON.stringify(currentUser));
    
    const statsEl = document.getElementById('userStatsDisplay');
    if (statsEl) statsEl.textContent = `Очки: ${currentUser.score}`;
    
    updateLeaderboard();
}

// ========================
// ЗАПУСК ИГРЫ
// ========================
function startGame() {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    
    // Обновляем профиль пользователя
    const userAvatarDisplay = document.getElementById('userAvatarDisplay');
    const userNickDisplay = document.getElementById('userNickDisplay');
    const userStatsDisplay = document.getElementById('userStatsDisplay');
    
    if (userAvatarDisplay) userAvatarDisplay.textContent = currentUser.avatar || '🍕';
    if (userNickDisplay) userNickDisplay.textContent = currentUser.name;
    if (userStatsDisplay) userStatsDisplay.textContent = `Очки: ${currentUser.score || 0}`;
    
    // Обновляем текущее имя для бота
    currentUserName = currentUser.name;
    userNameDisplay.textContent = '👤 Общение с: ' + currentUser.name;
    
    // Начальное сообщение
    setTimeout(() => {
        addMessage(`ПРИВЕЕЕТ, ${currentUser.name.toUpperCase()}!!! *вытирает крошки с усов* Ты пришёл есть или просто так? Потому что если просто — уходи. У меня пицца важнее. 🍕`, 'bot');
    }, 500);
    setTimeout(() => {
        addSystemMessage('💡 КОМАНДЫ: "покорми" / "дай еду" — корми бота! Кнопки еды выше! Чем больше ешь — тем безумнее бот! 🍕📈');
    }, 1500);
    setTimeout(() => {
        addSystemMessage(`🏆 Титул бота: ${getMadnessLevel().title} — следи за шкалой жадности!`);
    }, 3000);
    
    updateStats();
}

// ========================
// ИНТЕГРАЦИЯ С ИГРОЙ (добавляем очки)
// ========================

// Переопределяем feedBot чтобы добавлять очки
const originalFeedBot = feedBot;
feedBot = function(emoji, name) {
    originalFeedBot(emoji, name);
    addScore(5);
    incrementStat('foodsEaten');
};

// Переопределяем sendMessage чтобы добавлять очки за сообщения
const originalSendMessage = sendMessage;
sendMessage = function() {
    originalSendMessage();
    incrementStat('messagesSent');
    addScore(1);
};

// Переопределяем endMiniGame для добавления очков
const originalEndMiniGame = endMiniGame;
endMiniGame = function() {
    originalEndMiniGame();
    if (miniGameScore >= 5) {
        addScore(miniGameScore * 2);
        incrementStat('gamesPlayed');
    }
};

// ========================
// ИНИЦИАЛИЗАЦИЯ
// ========================

document.addEventListener('DOMContentLoaded', () => {
    checkSession();
});

// Event listeners
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
