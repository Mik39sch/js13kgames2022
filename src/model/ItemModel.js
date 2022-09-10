import BaseModel from "./BaseModel"
import s from "../common/settings";
import { getTime } from "../common/util";

export default class ItemModel extends BaseModel {
  constructor(options) {
    super(options);
    this.image = options.image;
    this.type = options.type;
    this.x = options.x;
    this.y = options.y;
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
    game.ctx.drawImage(
      this.image,
      this.x - adjustX,
      s.GROUND_START_Y + this.y - 32
    );
  }

  coinAction(game) {
    game.header.coin.point++;
  }

  rosaryAction(game) {
    game.header.rosary.point++;
  }

  action(game) {
    if (this.type === "coin") {
      this.coinAction(game);
    }
    if (this.type === "rosary") {
      this.rosaryAction(game);
    }
  }
}
