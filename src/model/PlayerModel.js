import BaseModel from "./BaseModel"
import s from "../common/settings";

export default class PlayerModel extends BaseModel {
  constructor(options) {
    super(options);
    this.height = this.width = 32;
    this.maxXV = 5;
    this.yv = 10;

    this.initialize();

    this.stopImage = options.stopImage;
    this.moveImages = options.moveImages;
  }

  initialize() {
    this.xv = 0;

    this.realY = 0;
    this.realX = 0;
    this.viewY = 0;
    this.viewX = 0;

    this.moving = false;
    this.movingTImer = 0;
    this.movingImageIdx = 0;
    this.turn = false;

    this.jumping = false;
    this.standingPos = 0;
    this.jumpTop = undefined;
    this.jumpingTimer = 0;

    this.currentStage = undefined;

    this.downing = false;
    this.downingTimer = 0;

    this.hitting = false;
    this.hittingTimer = 0;
  }

  draw(game, ctx) {
    const imgKey = this.turn ? "trans" : "normal";
    const moveImgs = this.moveImages[imgKey];
    let img = this.stopImage[imgKey];

    if (this.moving) {
      if (this.movingTImer % 5 === 0) {
        this.movingImageIdx++;
        if (this.movingImageIdx >= moveImgs.length) {
          this.movingImageIdx = 0;
        }
      }
      img = moveImgs[this.movingImageIdx];
    }
    if (this.jumping || this.downing) {
      img = moveImgs[0];
    }

    if (!this.hitting || (this.hittingTimer > 0 && this.hittingTimer % 2 === 0)) {
      ctx.drawImage(
        img,
        this.viewX,
        s.GROUND_START_Y + this.viewY - this.height
      );
    }


  }

  update(game) {
    if (game.keyboard.find(key => key === "ArrowRight")) {
      this.moving = true;
      this.turn = false;
      this.realX += 2 + this.xv;
      this.movingTImer++;

      const stageMiddle = s.CANVAS_WIDTH / 2;
      if (this.realX >= stageMiddle && this.realX <= game.stageMaxX - stageMiddle) {
        this.viewX = s.CANVAS_WIDTH / 2;
      } else if (this.realX >= game.stageMaxX) {
        this.realX = game.stageMaxX;
        this.viewX = s.CANVAS_WIDTH;
      } else {
        this.viewX += 2 + this.xv;
      }
    } else if (game.keyboard.find(key => key === "ArrowLeft")) {
      this.moving = true;
      this.turn = true;
      this.movingTImer++;
      this.realX -= 2 + this.xv;

      const stageMiddle = s.CANVAS_WIDTH / 2;
      if (this.realX >= stageMiddle && this.realX <= game.stageMaxX - stageMiddle) {
        this.viewX = s.CANVAS_WIDTH / 2;
      } else if (this.realX <= 0) {
        this.realX = this.viewX = 0;
      } else {
        this.viewX -= 2 + this.xv;
      }
    } else {
      this.moving = false;
      this.xv = 0;
      this.movingTImer = 0;
    }

    if (this.moving && this.xv <= this.maxXV) this.xv += 0.01;

    if (game.keyboard.find(key => key === "ArrowUp") && !this.jumping && !this.downing) {
      this.jumping = true;
      this.standingPos = this.realY;
      this.jumpTop = undefined;
      this.jumpingTimer = 0;
    }

    const standPlaces = game.getViewStages({ x: this.realX, height: this.height });
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

    if (this.jumping) this._jump(standPlaces);
    if (this.downing) this._down(standPlaces);

    if (this.hitting) {
      this.hittingTimer -= 1;
      if (this.hittingTimer === 0) {
        this.hitting = false;
      }
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
      this.realY = stage.y - s.GROUND_START_Y;
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
