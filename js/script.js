const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const score = document.querySelector(".score--value");
const finalScore = document.querySelector(".final-score > span");
const menu = document.querySelector(".menu-screen");
const buttonPlay = document.querySelector(".btn-play");
const introScreen = document.querySelector(".intro-screen"); // Seleciona a tela de introdução
const startButton = document.querySelector(".btn-start"); // Seleciona o botão de início
const explanationOverlay = document.querySelector(".explanation-overlay");
const explanationText = document.querySelector(".explanation-text");
const closeExplanationButton = document.querySelector(".close-explanation");

const audio = new Audio("../assets/audio.mp3");

const size = 30;

const initialPosition = { x: 270, y: 240 };

let snake = [initialPosition];

const incrementScore = () => {
    score.innerText = +score.innerText + 10;
};

const randomNumber = (min, max) => {
    return Math.round(Math.random() * (max - min) + min);
};

const randomPosition = () => {
    const number = randomNumber(0, canvas.width - size);
    return Math.round(number / size) * size; // Corrigido para usar a variável size
};

const randomColor = () => {
    const red = randomNumber(0, 255);
    const green = randomNumber(0, 255);
    const blue = randomNumber(0, 255);

    return `rgb(${red}, ${green}, ${blue})`;
};

const food = {
   x: randomPosition(),
   y: randomPosition(),
   color: randomColor()
};

let direction, loopId;
let isGamePaused = false; // Variável para controlar o estado do jogo

const drawFood = () => {
    const { x, y } = food;

    ctx.fillStyle = "red"; // Cor da maçã
    ctx.shadowColor = "rgba(255,0,0,0.5)"; // Cor da sombra
    ctx.shadowBlur = 10; // Intensidade do brilho

    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2); // Desenha um círculo
    ctx.fill();

    ctx.shadowBlur = 0; // Reseta a sombra
};

const drawSnake = () => {
   ctx.fillStyle = "#0c570a ";

   snake.forEach((position, index) => {
       if (index == snake.length - 1) {
           ctx.fillStyle = "#0f6d0d";
       }

       ctx.fillRect(position.x, position.y, size, size);
   });
};

const moveSnake = () => {
   if (!direction) return;

   const head = snake[snake.length - 1];

   if (direction == "right") {
       snake.push({ x: head.x + size, y: head.y });
   }

   if (direction == "left") {
       snake.push({ x: head.x - size, y: head.y });
   }

   if (direction == "down") {
       snake.push({ x: head.x, y: head.y + size });
   }

   if (direction == "up") {
       snake.push({ x: head.x, y: head.y - size });
   }

   snake.shift();
};

const drawGrid = () => {
   ctx.lineWidth = 0.2; 
   ctx.strokeStyle = "#191919"; 

   for (let i = size; i < canvas.width; i += size) { // Corrigido para usar a variável size
       ctx.beginPath();
       ctx.lineTo(i, 0);
       ctx.lineTo(i, canvas.height); // Corrigido para usar canvas.height
       ctx.stroke();

       ctx.beginPath();
       ctx.lineTo(0, i);
       ctx.lineTo(canvas.width, i); // Corrigido para usar canvas.width
       ctx.stroke();
   }
};

const chackEat = () => {
   const head = snake[snake.length - 1];

   if (head.x === food.x && head.y === food.y) { // Usando comparação estrita
       incrementScore();
       snake.push(head);
       audio.play();
       showExplanation(); // Adiciona uma nova explicação

       let x = randomPosition();
       let y = randomPosition();

       while (snake.find((position) => position.x === x && position.y === y)) { // Usando comparação estrita
           x = randomPosition();
           y = randomPosition();
       }

       food.x = x; 
       food.y = y; 
       food.color = randomColor(); 
   }
};

// Explicações sobre pilhas
const explanations = [
   "Uma pilha é uma estrutura de dados que segue o princípio LIFO (Last In, First Out).",
   "No jogo da cobrinha, cada segmento da cobra pode ser visto como um item em uma pilha.",
   "Quando a cobra come, um novo segmento é adicionado ao final, assim como um item é empilhado.",
   "Quando a cobra se move, ela 'remove' o segmento da frente, semelhante ao funcionamento de uma pilha.",
   "Se você tentar mover a cobra para trás imediatamente, será como tentar acessar um item que não está no topo da pilha.",
   "As operações principais em uma pilha são push (adicionar) e pop (remover).",
   "Entender pilhas pode ajudar na lógica de jogos e na programação em geral!"
];

let explanationIndex = 0;

const showExplanation = () => {
   if (explanationIndex < explanations.length) { // Verifica se ainda há explicações disponíveis
       explanationText.innerText = explanations[explanationIndex]; // Define o texto da explicação
       explanationOverlay.style.display = "flex"; // Mostra o overlay
       isGamePaused = true; // Pausa o jogo
       clearInterval(loopId); // Para o loop do jogo
       explanationIndex++; // Avança para a próxima explicação
   }
};

// Função para fechar a explicação
const closeExplanation = () => {
   explanationOverlay.style.display = "none"; // Oculta o overlay
   isGamePaused = false; // Retorna ao estado normal do jogo
   gameLoop(); // Reinicia o loop do jogo
};

// Adiciona evento para fechar a explicação ao clicar no botão de fechar
closeExplanationButton.addEventListener("click", closeExplanation);

// Adiciona evento para fechar a explicação ao pressionar teclas de movimentação
document.addEventListener("keydown", ({ key }) => {
   if (key === "ArrowRight" || key === "ArrowLeft" || key === "ArrowDown" || key === "ArrowUp") {
       if (isGamePaused) { // Verifica se o jogo está pausado antes de fechar a explicação
           closeExplanation();
       }
   }
});

// Função para iniciar o jogo
startButton.addEventListener("click", () => {
     introScreen.style.display= "none"; // Oculta a tela de introdução
     gameLoop(); // Inicia o loop do jogo
});

const checkCollision = () => {
   const head = snake[snake.length - 1];
   const canvasLimitX = canvas.width - size; 
   const canvasLimitY = canvas.height - size; 
   
   const neckIndex = snake.length - 2;

   const wallCollision =
      head.x < 0 || head.x > canvasLimitX || head.y < 0 || head.y > canvasLimitY;

   const selfCollision = snake.find((position, index) => {
      return index < neckIndex && position.x === head.x && position.y === head.y; // Usando comparação estrita
   });

   if (wallCollision || selfCollision) { 
      gameOver(); 
   }
};

const gameOver = () => {
     direction = undefined;

     menu.style.display = "flex"; 
     finalScore.innerText = score.innerText; 
     canvas.style.filter = "blur(2px)";
     
     // Limpa as explicações ao fim do jogo
     explanationIndex=0; // Reseta o índice das explicações
     explanationOverlay.style.display= "none"; // Garante que o overlay esteja escondido ao final do jogo
};

const gameLoop= () => { 
     if (isGamePaused) return; // Se estiver pausado, não faz nada

     clearInterval(loopId);

     ctx.clearRect(0, 0, canvas.width, canvas.height); 
     drawFood(); 
     moveSnake(); 
     drawSnake(); 
     chackEat(); 
     checkCollision();

     loopId= setTimeout(() => { 
         gameLoop(); 
     },250); 
};

// Inicia o loop do jogo inicialmente oculto pela tela de introdução.
gameLoop();

document.addEventListener("keydown", ({ key }) => { 
     if (key === "ArrowRight" && direction !== "left") { 
         direction= "right"; 
     }

     if (key === "ArrowLeft" && direction !== "right") { 
         direction= "left"; 
     }

     if (key === "ArrowDown" && direction !== "up") { 
         direction= "down"; 
     }

     if (key === "ArrowUp" && direction !== "down") { 
         direction= "up"; 
     }
});

buttonPlay.addEventListener("click", () => { 
     score.innerText= "00"; 
     menu.style.display= "none"; 
     canvas.style.filter= "none";

     snake= [initialPosition]; 

     // Limpa as explicações ao reiniciar o jogo
     explanationIndex=0;  
});