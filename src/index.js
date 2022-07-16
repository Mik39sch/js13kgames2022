
const cWidth = 1000;
const cHeight = cWidth - (cWidth * 4 / 10);
const ground = cHeight / 10 * 1;
const groundStart = cHeight - ground;

const gravity = 0.4;
const yv = 10;

let ballX = 0;
let ballY = 0;

let initialLoad = true;

let moving = false;
let direction = undefined;

let jumping = false;
let jumpingTime = 0;
let jumpingStartTime = undefined;

let g_canvas, parentDiv, ctx;

const writeStage = () => {
  ctx.fillStyle = 'skyblue';
  ctx.fillRect(0, 0, cWidth, cHeight);

  ctx.fillStyle = 'green';
  ctx.fillRect(0, groundStart, cWidth, ground);
};

const writeBall = () => {
  const characterH = 20;
  const radius = characterH / 2;

  ctx.beginPath();

  ctx.arc(
    radius + ballX,                 // 円の中心座標(x)
    groundStart + ballY - radius - 0.5,   // 円の中心座標(y)
    radius,                       // 半径
    0 * Math.PI / 180,            // 開始角度: 0度 (0 * Math.PI / 180)
    360 * Math.PI / 180,          // 終了角度: 360度 (360 * Math.PI / 180)
    false                         // 方向: true=反時計回りの円、false=時計回りの円
  );
  ctx.fillStyle = "red";
  ctx.fill();

  ctx.strokeStyle = "crimson";
  ctx.lineWidth = 1;
  ctx.stroke();
};

const step = timestamp => {

  if (initialLoad) {
    g_canvas = document.getElementById("main");
    parentDiv = document.getElementById("wrapper");
    [parentDiv.style.width, parentDiv.style.height] = [`${cWidth}px`, `${cHeight}px`];
    [g_canvas.width, g_canvas.height] = [cWidth, cHeight];

    ctx = g_canvas.getContext('2d');

    writeStage();
    writeBall();
  }

  if (moving || jumping) {
    if (moving) {
      if (direction === "right") {
        ballX += 2;
      } else if (direction === "left") {
        ballX -= 2;
      }
    }

    if (jumping) {
      if (!jumpingStartTime) {
        jumpingStartTime = timestamp;
        jumpingTime = 0;
      }
      ballY = 0.5 * gravity * jumpingTime * jumpingTime - yv * jumpingTime;
      jumpingTime++;
    }
    ctx.clearRect(0, 0, cWidth, cHeight);
    writeStage();
    writeBall();

    if (ballY > 1) {
      ballY = 0;
      jumping = false;
      jumpingStartTime = undefined;
    }
  }

  window.requestAnimationFrame(step);
}

const onload = () => {

  window.addEventListener("keydown", e => {
    switch (e.code) {
      case "ArrowRight":
        direction = "right";
        moving = true;
        break;

      case "ArrowLeft":
        direction = "left";
        moving = true;
        break;
      case "ArrowUp":
        if (!jumping) {
          jumping = true;
          jumpingTime = 0;
        }
        break;
      default:
        break;
    }
  }, true);
  window.addEventListener("keyup", e => {
    switch (e.code) {
      case "ArrowRight":
      case "ArrowLeft":
        direction = undefined;
        moving = false;
        break;
      default:
        break;
    }
  }, true);

  window.requestAnimationFrame(step);
}

window.onload = onload();
