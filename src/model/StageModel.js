import BaseModel from "./BaseModel"
import s from "../common/settings";
import { randomInt } from "../common/util";

export default class StageModel extends BaseModel {
  constructor(options) {
    super(options);

    this.width = options.width;
    this.height = options.height;
    this.x = options.x;
    this.y = options.y;
    this.color = options.color;
  }

  draw(game, ctx) {
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;

    let adjustX = 0;
    const stageMiddle = s.CANVAS_WIDTH / 2;
    if (game.player.realX <= stageMiddle) {
      adjustX = 0;
    } else if (game.player.realX >= stageMiddle && game.player.realX <= game.stageMaxX - stageMiddle) {
      adjustX = game.player.realX - stageMiddle;
    } else if (game.player.realX >= game.stageMaxX - stageMiddle) {
      adjustX = game.stageMaxX - s.CANVAS_WIDTH;
    }
    ctx.strokeRect(this.x - adjustX, this.y, this.width, this.height);
    ctx.fillRect(this.x - adjustX, this.y, this.width, this.height);
  }
}
