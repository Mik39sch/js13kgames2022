import BaseModel from "./BaseModel"
import s from "../common/settings";

export default class PlayerModel extends BaseModel {
  constructor(options) {
    super(options);
    this.height = 32;
    this.yv = 10;

    this.realY = 0;
    this.realX = 0;
    this.viewY = 0;
    this.viewX = 0;

    this.jumping = false;
    this.moving = false;

    this.jumpingTimer = 0;
  }

  draw(game) {
    const radius = this.height / 2;

    game.ctx.beginPath();

    game.ctx.arc(
      radius + this.viewX,                            // 円の中心座標(x)
      s.GROUND_START_Y + this.viewY - radius - 0.5,   // 円の中心座標(y)
      radius,                                             // 半径
      0 * Math.PI / 180,                                  // 開始角度: 0度 (0 * Math.PI / 180)
      360 * Math.PI / 180,                                // 終了角度: 360度 (360 * Math.PI / 180)
      false                                               // 方向: true=反時計回りの円、false=時計回りの円
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
      this.realX += 2;

      const stageMiddle = s.CANVAS_WIDTH / 2;
      if (this.realX >= stageMiddle && this.realX <= s.STAGE_MAX_X - stageMiddle) {
        this.viewX = s.CANVAS_WIDTH / 2;
      } else if (this.realX >= s.STAGE_MAX_X) {
        this.realX = s.STAGE_MAX_X;
        this.viewX = s.CANVAS_WIDTH;
      } else {
        this.viewX += 2;
      }
    } else if (game.keyboard.find(key => key === "ArrowLeft")) {
      this.moving = true;
      this.realX -= 2;

      const stageMiddle = s.CANVAS_WIDTH / 2;
      if (this.realX >= stageMiddle && this.realX <= s.STAGE_MAX_X - stageMiddle) {
        this.viewX = s.CANVAS_WIDTH / 2;
      } else if (this.realX <= 0) {
        this.realX = this.viewX = 0;
      } else {
        this.viewX -= 2;
      }
    } else {
      this.moving = false;
    }

    if (game.keyboard.find(key => key === "ArrowUp") && !this.jumping) {
      this.jumping = true;
      this.jumpingTimer = 0;
    }

    this._jump();
  }

  _jump() {
    if (this.jumping) {
      this.realY = 0.5 * s.GRAVITY * this.jumpingTimer * this.jumpingTimer - this.yv * this.jumpingTimer;
      this.jumpingTimer++;
    }

    if (this.realY > 1) {
      this.realY = 0;
      this.jumping = false;
    }

    this.viewY = this.realY;
  }
}
