import BaseModel from "./BaseModel"
import s from "../common/settings";
import { randomInt } from "../common/util";

export default class StageModel extends BaseModel {
  constructor(options) {
    super(options);

    this.width = randomInt({ max: 300, min: 100 });
    this.height = 20;

    this.x = randomInt({
      max: s.CANVAS_WIDTH + options.widthIndex * s.CANVAS_WIDTH,
      min: options.widthIndex * s.CANVAS_WIDTH
    });
    this.y = randomInt({ max: s.GROUND_START_Y - 50, min: 1 });
  }

  draw(game) {
    game.ctx.strokeStyle = "gray";
    game.ctx.fillStyle = "#505050";

    let adjustX = 0;
    const stageMiddle = s.CANVAS_WIDTH / 2;
    if (game.player.realX <= stageMiddle) {
      adjustX = 0;
    } else if (game.player.realX >= stageMiddle && game.player.realX <= s.STAGE_MAX_X - stageMiddle) {
      adjustX = game.player.realX - stageMiddle;
    } else if (game.player.realX >= s.STAGE_MAX_X - stageMiddle) {
      adjustX = s.STAGE_MAX_X - s.CANVAS_WIDTH;
    }
    game.ctx.strokeRect(this.x - adjustX, this.y, this.width, this.height);
    game.ctx.fillRect(this.x - adjustX, this.y, this.width, this.height);
  }
}
