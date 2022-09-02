import BaseModel from "./BaseModel"
import s from "../common/settings";
import { randomInt } from "../common/util";

const enemyPatterns = [
  { speed: 1, jump: 0, walkLength: 100 },
  { speed: 1, jump: 10, walkLength: 200 },
  { speed: 3, jump: 0, walkLength: 100 },
  { speed: 2, jump: 100, walkLength: 200 }
]

export default class EnemyModel extends BaseModel {
  constructor(options) {
    super(options);
    this.pattern = enemyPatterns[randomInt({ max: enemyPatterns.length, min: 0 })];
    this.x = 0;
    this.yv = 10;
    this.startPosition = options.startPosition;
    this.turn = false;

    this.y = 0;
    this.height = 32;

    this.jumping = false;
    this.standingPos = 0;
    this.jumpTop = undefined;
    this.jumpingTimer = 0;

    this.currentStage = undefined;

    this.downing = false;
    this.downingTimer = 0;
  }

  draw(game) {
    const radius = this.height / 2;

    let adjustX = 0;
    const stageMiddle = s.CANVAS_WIDTH / 2;
    if (game.player.realX <= stageMiddle) {
      adjustX = 0;
    } else if (game.player.realX >= stageMiddle && game.player.realX <= s.STAGE_MAX_X - stageMiddle) {
      adjustX = game.player.realX - stageMiddle;
    } else if (game.player.realX >= s.STAGE_MAX_X - stageMiddle) {
      adjustX = s.STAGE_MAX_X - s.CANVAS_WIDTH;
    }
    game.ctx.beginPath();

    game.ctx.arc(
      radius + this.x + this.startPosition - adjustX,                            // 円の中心座標(x)
      s.GROUND_START_Y + this.y - radius - 0.5,   // 円の中心座標(y)
      radius,                                             // 半径
      0 * Math.PI / 180,                                  // 開始角度: 0度 (0 * Math.PI / 180)
      360 * Math.PI / 180,                                // 終了角度: 360度 (360 * Math.PI / 180)
      false                                               // 方向: true=反時計回りの円、false=時計回りの円
    );
    game.ctx.fillStyle = "blue";
    game.ctx.fill();

    game.ctx.strokeStyle = "crimson";
    game.ctx.lineWidth = 1;
    game.ctx.stroke();
  }

  update(game) {
    if (this.x >= this.pattern.walkLength) {
      this.turn = true;
    }
    if (this.x <= 0) {
      this.turn = false;
    }
    if (!this.turn) {
      this.x += this.pattern.speed;
    } else {
      this.x -= this.pattern.speed;
    }

    if (!this.jumping && this.pattern.jump > 0 && this.x % this.pattern.jump === 0) {
      this.jumping = true;
      this.standingPos = this.y;
      this.jumpTop = undefined;
      this.jumpingTimer = 0;
    }

    const standPlaces = game.getViewStages({ x: this.x + this.startPosition, height: this.height });
    if (this.jumping) this._jump(standPlaces);
  }

  _jump(standPlaces) {
    const prevY = this.y;
    this.y = this.standingPos + 0.5 * s.GRAVITY * this.jumpingTimer * this.jumpingTimer - this.yv * this.jumpingTimer;
    this.jumpingTimer++;

    if (this.y > 1) {
      this._reset();
    }

    const returnJump = prevY < this.y;
    if (returnJump && !this.jumpTop) {
      this.jumpTop = prevY;
    }
    const stage = standPlaces.find(stage =>
      this.jumpTop <= stage.y - s.GROUND_START_Y &&
      prevY <= stage.y - s.GROUND_START_Y &&
      this.y >= stage.y - s.GROUND_START_Y
    );
    if (returnJump && stage) {
      this._reset(stage);
    }
  }

  _reset(stage = undefined) {
    if (stage) {
      this.y = stage.y - stage.height + this.height / 2 - s.GROUND_START_Y + 5;
      this.jumping = false;
      this.downing = false;
      this.jumpTop = undefined;
      this.currentStage = stage;
    } else {
      this.y = 0;
      this.downing = false;
      this.currentStage = undefined;
      this.jumping = false;
      this.jumpTop = undefined;
    }
  }
}
