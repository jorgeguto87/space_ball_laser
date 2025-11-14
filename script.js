// Função para entrar em tela cheia
function entrarTelaCheia() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { // Safari
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { // IE11
        elem.msRequestFullscreen();
    }
}

// Detectar orientação e forçar tela cheia em paisagem
function verificarOrientacao() {
    if (window.innerWidth > window.innerHeight) {
        // Está em modo paisagem (deitado)
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            entrarTelaCheia();
        }
    }
}

// Verificar ao carregar a página
window.addEventListener('load', verificarOrientacao);

// Verificar quando mudar a orientação
window.addEventListener('orientationchange', () => {
    setTimeout(verificarOrientacao, 100);
});

// Verificar quando redimensionar
window.addEventListener('resize', verificarOrientacao);

iniciarJogo();
const fundo = document.getElementById("body");
let velocidade = 3;
let score = 0;
let gameOver = false;

gsap.registerPlugin(Physics2DPlugin, CustomEase, CustomBounce);

const quadrado = document.getElementById("quadrado");

// Elemento para mostrar a pontuação
const scoreElement = document.createElement("div");
scoreElement.id = "score";
scoreElement.style.position = "absolute";
scoreElement.style.top = "10px";
scoreElement.style.right = "10px";
scoreElement.style.color = "white";
scoreElement.style.fontSize = "24px";
scoreElement.style.fontFamily = "Arial, sans-serif";
scoreElement.style.textShadow = "2px 2px 4px black";
scoreElement.textContent = "Score: 0";
document.body.appendChild(scoreElement);

// Função para verificar colisão
function verificarColisao(laser, quadrado) {
    const laserRect = laser.getBoundingClientRect();
    const quadradoRect = quadrado.getBoundingClientRect();
    
    return !(
        laserRect.right < quadradoRect.left ||
        laserRect.left > quadradoRect.right ||
        laserRect.bottom < quadradoRect.top ||
        laserRect.top > quadradoRect.bottom
    );
}

function iniciarJogo(){
    const gameover = document.getElementById("gameover");
    const reiniciar = document.getElementById("reiniciar");
    const mensagemScore = document.getElementById("score");
    mensagemScore.textContent = `Jogar com a tela deitada`;
    gameover.textContent = "Ball Laser Space";
    reiniciar.textContent = "Iniciar";
    gameover.style.display = "block";
    reiniciar.style.display = "block";
    mensagemScore.style.display = "block";
}

function jogoIniciado(){
    const gameover = document.getElementById("gameover");
    const reiniciar = document.getElementById("reiniciar");
    const mensagemScore = document.getElementById("score");    
    gameover.style.display = "none";
    reiniciar.style.display = "none";
    mensagemScore.style.display = "none";
}

function mostrarGameOver(){
    const gameover = document.getElementById("gameover");
    const reiniciar = document.getElementById("reiniciar");
    const mensagemScore = document.getElementById("score");
    mensagemScore.textContent = `Score: ${score}`;
    gameover.textContent = "Game Over";
    reiniciar.textContent = "Reiniciar";
    gameover.style.display = "block";
    reiniciar.style.display = "block";
    mensagemScore.style.display = "block";    
}

const reiniciar = document.getElementById("reiniciar");

reiniciar.addEventListener("click", () => {
    if (reiniciar.textContent === "Iniciar") {
        // Tentar entrar em tela cheia ao iniciar o jogo
        entrarTelaCheia();
        
        jogoIniciado(); 
        iniciarLasers(); 
    } else {
        location.reload(); 
    }
});

function criarLaserHorizontal() {
    const laser = document.createElement("div");
    laser.classList.add("laser-h");

    const alturaAleatoria = Math.random() * (window.innerHeight - 200);
    laser.style.top = alturaAleatoria + "px";
    laser.style.left = (window.innerWidth + 200) + "px";

    document.body.appendChild(laser);

    // Verificar colisão durante a animação
    const checkCollision = setInterval(() => {
        if (!gameOver && laser.parentNode && verificarColisao(laser, quadrado)) {
            gameOver = true;
            clearInterval(checkCollision);
            
            // Efeito de opacity na colisão
            gsap.to(quadrado, {
                opacity: 0.3,
                duration: 0.3,
                yoyo: true,
                repeat: 3,
                onComplete: () => {
                    gsap.set(quadrado, { opacity: 1 });
                }
            });
            
            mostrarGameOver();
        }
    }, 50);

    // Apenas UMA animação GSAP
    gsap.to(laser, {
        x: -(window.innerWidth + 500),
        duration: 2.5,
        ease: "none",
        onComplete: () => {
            // Aumentar pontuação quando o laser passar sem colidir
            if (!gameOver) {
                score += 5;
                iniciarLasers();
                scoreElement.textContent = `Score: ${score}`;
            }
            clearInterval(checkCollision);
            if (laser.parentNode) {
                laser.remove();
            }
        }
    });
}

let intervaloHorizontal;

function atualizarVelocidade() {
    let tempo;
    if (score <= 50) {
        tempo = 2000;
    } else if (score <= 100) {
        tempo = 1500;
    } else if (score <= 150) {
        tempo = 1000;
    } else {
        tempo = 500;
    }
    return tempo;
}

function iniciarLasers() {
    // Limpar intervalo anterior se existir
    if (intervaloHorizontal) {
        clearInterval(intervaloHorizontal);
    }
    
    // Criar novo intervalo com velocidade atual
    intervaloHorizontal = setInterval(() => {
        if (!gameOver) criarLaserHorizontal();
    }, atualizarVelocidade());
}

const tl = gsap.timeline({ defaults: { duration: 2 } });
CustomBounce.create("myBounce", {strength:0.7, squash:3});

fundo.addEventListener("click", () => {
    if (gameOver) return;
    
    // Obter dimensões e posição atual da bola
    const alturaQuadrado = quadrado.offsetHeight;
    const posicaoAtualY = quadrado.getBoundingClientRect().top;
    
    // Calcular posição de queda - garantindo que não ultrapasse o fundo
    const posicaoQueda = window.innerHeight - alturaQuadrado - 20;
    
    // Calcular nova posição Y aleatória após o pulo
    const yMin = 20; 
    const yMax = window.innerHeight - alturaQuadrado - 20;
    const yOriginal = Math.random() * (yMax - yMin) + yMin;

    tl.clear();
    
    // Animação de queda
    tl.to(quadrado, {
        duration: 1,
        top: posicaoQueda,
        ease: "myBounce",
    });

    // Animação de squash
    tl.to(quadrado, {
        scaleX: 2,
        scaleY: 0.5,
        ease: "myBounce-squash",
        transformOrigin: "bottom center",
        duration: 1
    }, 0);

    // Volta ao normal
    tl.to(quadrado, {
        scaleX: 1,
        scaleY: 1,
        duration: 0.2
    });
    
    // Pula para posição aleatória
    tl.to(quadrado, {
        top: yOriginal,
        duration: 1,
        ease: "power2.out"
    });
});

let posX = 40;
let direcao = 1;

gsap.ticker.add(() => {
    if (gameOver) return;
    
    posX += velocidade * direcao;
    
    const larguraQuadrado = quadrado.offsetWidth;
    
    // Limitar a posição X antes de aplicar
    if (posX > window.innerWidth - larguraQuadrado - 20) {
        posX = window.innerWidth - larguraQuadrado - 20;
        direcao = -1;
    } else if (posX < 20) {
        posX = 20;
        direcao = 1;
    }
    
    quadrado.style.left = posX + "px";
});