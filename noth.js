var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");

var unit = new Image();
var bg = new Image();
var platform = new Image();

var prompt = prompt('выберите персонажа за которого хотите играть. Ниндзя - 1, барашек - 2, кролик - 3, космонавт - 4');

var scrollSpeed = 3; // Скорость опускания экрана
var jumpHeight = 140; // Максимальная высота прыжка
var jumpSpeed = 10; // Скорость прыжка
var isJumping = false; // Флаг для отслеживания прыжка
var currentJumpHeight = 0; // Текущая высота прыжка
var gravity = 1; // Начальное значение гравитации
var gravityIncrement = 0.01; // Величина увеличения гравитации
var maxGravity = 3; // Максимальное значение гравитации
var platformWidth = 100;
var platformY = canvas.height - 50; // Начальная позиция платформ
var platformX = (canvas.width - platformWidth) / 2; // Центр холста по горизонтали
var platforms = [];
var platformDropped = false; // Флаг для отслеживания опущенных платформ
var platformDropSpeed = 2; // Скорость опускания платформ
var xVelocity = 4; // Горизонтальная скорость персонажа
var xAcceleration = 3; // Горизонтальное ускорение персонажа
var maxXVelocity = 5; // Максимальная горизонтальная скорость персонажа
var score = 0; // Начальное значение счета

// Функция для отрисовки изображений после их загрузки
function drawImagesOnLoad() {
  if (unit.complete && bg.complete && platform.complete) {
    initPlatforms();
    animate();
  }
}

// Обработчики событий загрузки и ошибки для изображений
unit.onload = drawImagesOnLoad;
bg.onload = drawImagesOnLoad;
platform.onload = drawImagesOnLoad;

// Пути к изображениям
bg.src = "/DOODLE/GameModel/bg.png"
if (prompt == '1') {unit.src = "/DOODLE/GameModel/unit.png"}
if (prompt == '2') {unit.src = "/DOODLE/GameModel/unit2.png"}
if (prompt == '3') {unit.src = "/DOODLE/GameModel/unit3.png"}
if (prompt == '4') {unit.src = "/DOODLE/GameModel/unit4.png"}
platform.src = "/DOODLE/GameModel/platform.png"

var xPosition = canvas.width / 2;
var yPosition = canvas.height / 2;
var prevYPosition = yPosition; // Предыдущая позиция персонажа по оси Y

// Функция для инициализации платформ
function initPlatforms() {
  platforms = [
    { x: platformX, y: platformY, image: platform },
    { x: platformX + 60, y: platformY - 110, image: platform },
    { x: platformX - 70, y: platformY - 220, image: platform },
    { x: platformX + 85, y: platformY - 330, image: platform },
    { x: platformX - 80, y: platformY - 440, image: platform },
    { x: platformX + 90, y: platformY - 550, image: platform }
  ];
}

function draw() {
  // Очищаем холст перед отрисовкой нового кадра
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

  // Проверяем, нужно ли опустить платформы
  if (yPosition < canvas.height / 2 && !isJumping) {
    platforms.forEach(function(platform) {
      platform.y += platformDropSpeed; // Опускаем платформы с заданной скоростью
    });
    platformDropped = true; // Устанавливаем флаг, чтобы сгенерировать новую платформу
    score++; // Увеличиваем счет
    var scoreDisplay = document.getElementById('score');
    scoreDisplay.innerHTML = score;

    // Увеличиваем гравитацию в зависимости от счета
    if (gravity < maxGravity) {
      gravity += score + gravityIncrement;
    }
  }

  // Генерируем новую платформу, если платформы были опущены
  if (platformDropped) {
    var highestPlatform = platforms.reduce(function(prev, curr) {
      return (prev.y < curr.y) ? prev : curr;
    });
    var newPlatformY = highestPlatform.y - 100; // Позиция по оси Y для новой платформы
    
 
    var newPlatformX = Math.random() * (canvas.width - platformWidth); // Случайная позиция по оси X
    platforms.unshift({ x: newPlatformX, y: newPlatformY, image: platform }); // Добавляем новую платформу в начало массива
    platformDropped = false; // Сбрасываем флаг
  }

  platforms.forEach(function(platform) {
    ctx.drawImage(platform.image, platform.x, platform.y, platformWidth, 10);
  });

  ctx.drawImage(unit, xPosition - 25, yPosition, 90, 70);

  // Обновляем предыдущую позицию персонажа
  prevYPosition = yPosition;

  // Плавный прыжок
  if (isJumping) {
    yPosition -= jumpSpeed;
    currentJumpHeight += jumpSpeed;
    if (currentJumpHeight >= jumpHeight) {
      isJumping = false;
      currentJumpHeight = 0;
    }
  } else {
    yPosition += gravity; // Применяем гравитацию
  }

  // Проверяем условие для перезагрузки страницы
  if (yPosition >= canvas.height) {
    location.reload();
  }

  // Границы холста по горизонтали
  if (xPosition >= canvas.width) {
    xPosition = 0;
  } else if (xPosition <= 0) {
    xPosition = canvas.width;
  }

  platforms.forEach(function(platform) {
    var centerOfCharacter = xPosition + 25; // Центральная точка персонажа (25 - половина ширины персонажа)
    if (centerOfCharacter >= platform.x && centerOfCharacter <= platform.x + platformWidth
        && yPosition + 70 >= platform.y && yPosition <= platform.y) {
      if (!isJumping) {//находится ли персонаж на платформе, если да, то доступен новый прыжок
        isJumping = true; // Устанавливаем флаг прыжка
        currentJumpHeight = 0; // Сбрасываем текущую высоту прыжка
      }
    }
  });

  // Обновляем горизонтальную скорость персонажа
  xVelocity = Math.max(-maxXVelocity, Math.min(maxXVelocity, xVelocity));
  xPosition += xVelocity;
}

function animate() {
  draw();
  requestAnimationFrame(animate);
}

document.addEventListener('keydown', moveCharacter);
document.addEventListener('keyup', stopCharacter);

function moveCharacter(event) {
  const key = event.key;

  switch (key) {
    case 'ArrowLeft':
      xVelocity -= xAcceleration;
      break;
    case 'ArrowRight':
      xVelocity += xAcceleration;
      break;
  }
}


function stopCharacter() {
  xVelocity = 0;
}

initPlatforms();
animate();
