import BaseModel from "./BaseModel"
import s from "../common/settings";
import { randomInt } from "../common/util";

const enemyPatterns = [
  { speed: 1, jump: 0, walkLength: 100 },
  { speed: 1, jump: 10, walkLength: 200 },
  { speed: 3, jump: 0, walkLength: 100 },
  { speed: 2, jump: 100, walkLength: 300 },
  { speed: 3, jump: 100, walkLength: 250 }
]

export default class EnemyModel extends BaseModel {
  constructor(options) {
    super(options);
    let patternMax = 4;
    if (options.level) {
      patternMax = options.level + 1;
      if (options.level === 3) {
        patternMax = 5;
      }
    }
    this.pattern = enemyPatterns[randomInt({ max: patternMax, min: 0 })];
    if (options.pattern) {
      this.pattern = options.pattern;
    }

    this.x = 0;
    this.yv = 10;
    this.startPosition = options.startPosition;
    this.turn = false;

    this.y = 0;
    this.height = this.width = 32;
    if (options.size) {
      this.height = this.width = options.size;
    }

    this.jumping = false;
    this.standingPos = 0;
    this.jumpTop = undefined;
    this.jumpingTimer = 0;

    this.currentStage = undefined;

    this.downing = false;
    this.downingTimer = 0;

    this.moveImages = options.moveImages;
    this.imageIndex = 0;
    this.timer = 0;
    this.hitting = false;
    this.hittingTimer = 0;

    this.hitPoint = 0;
    if (options.hitPoint) {
      this.hitPoint = options.hitPoint;
    }
  }

  draw(game) {
    let adjustX = 0;
    const stageMiddle = s.CANVAS_WIDTH / 2;
    if (game.player.realX <= stageMiddle) {
      adjustX = 0;
    } else if (game.player.realX >= stageMiddle && game.player.realX <= game.stageMaxX - stageMiddle) {
      adjustX = game.player.realX - stageMiddle;
    } else if (game.player.realX >= game.stageMaxX - stageMiddle) {
      adjustX = game.stageMaxX - s.CANVAS_WIDTH;
    }

    const imgKey = this.turn ? "trans" : "normal";
    const moveImgs = this.moveImages[imgKey];
    let img = moveImgs[0];
    if (this.timer % 5 === 0) {
      this.imageIndex++;
      if (this.imageIndex >= moveImgs.length) {
        this.imageIndex = 0;
      }
    }
    img = moveImgs[this.imageIndex];
    if (this.jumping || this.downing) {
      img = moveImgs[0];
    }

    if (!this.hitting || (this.hittingTimer > 0 && this.hittingTimer % 2 === 0)) {
      game.ctx.drawImage(
        img,
        this.x + this.startPosition - adjustX,
        s.GROUND_START_Y + this.y - this.height,
        this.width,
        this.height
      );
    }
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
    this.timer++;

    if (this.hitting) {
      this.hittingTimer -= 1;
      if (this.hittingTimer === 0) {
        this.hitting = false;
      }
    }
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
      this.y = stage.y - s.GROUND_START_Y;
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
