
const cWidth = 1000;
const cHeight = cWidth - (cWidth * 4 / 10);
const ground = cHeight / 10 * 1;
const groundStart = cHeight - ground;

let ballX = 0;
let ballY = 0;

const writeStage = ({ ctx }) => {
  ctx.fillStyle = 'skyblue';
  ctx.fillRect(0, 0, cWidth, cHeight);

  ctx.fillStyle = 'green';
  ctx.fillRect(0, groundStart, cWidth, ground);
}

const writeBall = ({ ctx }) => {
  const characterH = 20;
  const radius = characterH / 2;

  ctx.beginPath();

  ctx.arc(
    radius + ballX,                 // 円の中心座標(x)
    groundStart - radius - 0.5,   // 円の中心座標(y)
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
}

const onload = () => {
  const g_canvas = document.getElementById("main");
  const parentDiv = document.getElementById("wrapper");
  [parentDiv.style.width, parentDiv.style.height] = [`${cWidth}px`, `${cHeight}px`];
  [g_canvas.width, g_canvas.height] = [cWidth, cHeight];

  const ctx = g_canvas.getContext('2d');
  writeStage({ ctx });
  writeBall({ ctx });

  // window.addEventListener("keydown", keyDown, true);
  window.addEventListener("keyup", e => {
    switch (e.code) {
      case "ArrowRight":
        ctx.clearRect(0, 0, cWidth, cHeight);
        writeStage({ ctx });
        ballX += 2;
        writeBall({ ctx });
        break;

      case "ArrowLeft":
        ctx.clearRect(0, 0, cWidth, cHeight);
        writeStage({ ctx });
        ballX -= 2;
        writeBall({ ctx });
        break;

      default:
        break;
    }
  }, true);
}

window.onload = onload();