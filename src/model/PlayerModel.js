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
    this.standingPos = 0;
    this.jumpTop = undefined;
    this.jumpingTimer = 0;

    this.currentStage = undefined;

    this.downing = false;
    this.downingTimer = 0;
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

    if (game.keyboard.find(key => key === "ArrowUp") && !this.jumping && !this.downing) {
      this.jumping = true;
      this.standingPos = this.realY;
      this.jumpTop = undefined
      this.jumpingTimer = 0;
    }

    const standPlaces = game.drawItems.stage.getStandPlace(game);
    const playerPosX = this.realX + this.height / 2;
    if (
      this.currentStage &&
      (this.currentStage.x > playerPosX || this.currentStage.x + this.currentStage.width < playerPosX) &&
      !this.downing && !this.jumping
    ) {
      this.downing = true;
      this.standingPos = this.realY;
      this.downingTimer = 0;
    }

    if (this.jumping) {
      this._jump(standPlaces);
    }

    if (this.downing) {
      this._down(standPlaces);
    }
  }

  _jump(standPlaces) {
    const prevY = this.realY;
    this.realY = this.standingPos + 0.5 * s.GRAVITY * this.jumpingTimer * this.jumpingTimer - this.yv * this.jumpingTimer;
    this.jumpingTimer++;

    if (this.realY > 1) {
      this._reset();
    }

    const returnJump = prevY < this.realY;
    if (returnJump && !this.jumpTop) {
      this.jumpTop = prevY;
    }
    const stage = standPlaces.find(stage =>
      this.jumpTop <= stage.y - s.GROUND_START_Y &&
      prevY <= stage.y - s.GROUND_START_Y &&
      this.realY >= stage.y - s.GROUND_START_Y
    );
    if (returnJump && stage) {
      this._reset(stage);
    }
    this.viewY = this.realY;
  }

  _down(standPlaces) {
    const prevY = this.realY;
    this.realY = 0.5 * s.GRAVITY * this.downingTimer * this.downingTimer + this.standingPos;
    this.downingTimer++;

    if (this.realY > 1) {
      this._reset();
    }

    const stage = standPlaces.find(stage =>
      prevY <= stage.y - s.GROUND_START_Y &&
      this.realY >= stage.y - s.GROUND_START_Y
    );

    if (stage) {
      this._reset(stage);
    }

    this.viewY = this.realY;
  }

  _reset(stage = undefined) {
    if (stage) {
      this.realY = stage.y - stage.height + this.height / 2 - s.GROUND_START_Y + 5;
      this.jumping = false;
      this.downing = false;
      this.jumpTop = undefined;
      this.currentStage = stage;
    } else {
      this.realY = 0;
      this.downing = false;
      this.currentStage = undefined;
      this.jumping = false;
      this.jumpTop = undefined;
    }

  }
}
