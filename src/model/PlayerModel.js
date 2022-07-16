import BaseModel from "./BaseModel"
import s from "../common/settings";

export default class PlayerModel extends BaseModel {
  constructor(options) {
    super(options);
    this.height = 32;

    this.positionY = 0;
    this.positionX = 0;

    this.jumping = false;
    this.moving = false;

    this.jumpingTimer = 0;
  }

  draw(game) {
    // draw character
    const radius = this.height / 2;

    game.ctx.beginPath();

    game.ctx.arc(
      radius + this.positionX,                 // 円の中心座標(x)
      s.GROUND_START_Y + this.positionY - radius - 0.5,   // 円の中心座標(y)
      radius,                       // 半径
      0 * Math.PI / 180,            // 開始角度: 0度 (0 * Math.PI / 180)
      360 * Math.PI / 180,          // 終了角度: 360度 (360 * Math.PI / 180)
      false                         // 方向: true=反時計回りの円、false=時計回りの円
    );
    game.ctx.fillStyle = "red";
    game.ctx.fill();

    game.ctx.strokeStyle = "crimson";
    game.ctx.lineWidth = 1;
    game.ctx.stroke();
  }

  update(game) {
    if (game.keyboard.find(key => key === "ArrowRight")) {
      this.moving = true;
      this.positionX += 2;
    } else if (game.keyboard.find(key => key === "ArrowLeft")) {
      this.moving = true;
      this.positionX -= 2;
    } else {
      this.moving = false;
    }

    if (game.keyboard.find(key => key === "ArrowUp") && !this.jumping) {
      this.jumping = true;
      this.jumpingTimer = 0;
    }

    this.jump();
  }

  jump() {
    if (this.jumping) {
      this.positionY = 0.5 * s.GRAVITY * this.jumpingTimer * this.jumpingTimer - s.yv * this.jumpingTimer;
      this.jumpingTimer++;
    }

    if (this.positionY > 1) {
      this.positionY = 0;
      this.jumping = false;
    }
  }
}
