import BaseModel from "./BaseModel"
import s from "../common/settings";
import { getTime } from "../common/util";

export default class HeaderModel extends BaseModel {
  constructor(options) {
    super(options);

    const maxPoint = 3;
    this.lifePoint = {
      x: 0, y: 0, img: options.image, point: maxPoint, maxPoint: maxPoint
    };
    this.time = {
      x: s.CANVAS_WIDTH - 10, y: 25, startTime: getTime(), nowTime: 0
    }
    this.stageText = {
      x: 0, y: 0
    }
  }

  draw(game, ctx) {
    for (let i = 0; i < this.lifePoint.point; i++) {
      ctx.drawImage(
        this.lifePoint.img,
        this.lifePoint.x + i * game.player.width + 5,
        this.lifePoint.y
      );
    }
    const fontSize = 20;
    let stageText = `STAGE ${game.level}`;
    if (game.level > 3) {
      stageText = "BOSS STAGE"
    }

    ctx.beginPath();
    ctx.textBaseline = 'left';
    ctx.textAlign = 'left';
    ctx.fillStyle = "white";
    ctx.font = "bold " + fontSize + "px Arial, meiryo, sans-serif";
    ctx.fillText(
      stageText, this.lifePoint.x + (this.lifePoint.maxPoint + 1) * game.player.width, 25);

    ctx.beginPath();
    ctx.textBaseline = 'right';
    ctx.textAlign = 'right';
    ctx.fillText(
      Math.floor(getTime() - this.time.startTime / 1000) / 1000, this.time.x, this.time.y);
  }
}
