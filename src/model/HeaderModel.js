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
    this.rosary = {
      x: this.lifePoint.img.width * maxPoint + 150, y: 0, img: options.rosaryImage, point: 0
    };
    this.coin = {
      x: this.lifePoint.img.width * maxPoint + 150 + this.rosary.img.width + 30, y: -3, img: options.coinImage, point: 0
    };
    this.time = {
      x: s.CANVAS_WIDTH - 10, y: 10, startTime: getTime(), nowTime: 0
    }
    this.stageText = {
      x: this.lifePoint.x + (this.lifePoint.maxPoint + 1) * this.lifePoint.img.width, y: 10
    }
  }

  draw(game) {
    for (let i = 0; i < this.lifePoint.point; i++) {
      game.ctx.drawImage(
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

    game.ctx.beginPath();
    game.ctx.textBaseline = 'top';
    game.ctx.textAlign = 'left';
    game.ctx.fillStyle = "white";
    game.ctx.font = "bold " + fontSize + "px Arial, meiryo, sans-serif";
    game.ctx.fillText(
      stageText, this.stageText.x, this.stageText.y);

    game.ctx.beginPath();
    game.ctx.textBaseline = 'top';
    game.ctx.textAlign = 'right';
    game.ctx.fillText(
      Math.floor(getTime() - this.time.startTime / 1000) / 1000, this.time.x, this.time.y);

    game.ctx.drawImage(
      this.rosary.img,
      this.rosary.x,
      this.rosary.y
    );
    game.ctx.beginPath();
    game.ctx.textBaseline = 'top';
    game.ctx.textAlign = 'left';
    game.ctx.fillStyle = "white";
    game.ctx.fillText(
      this.rosary.point, this.rosary.x + this.rosary.img.width + 5, this.rosary.y + 10);

    game.ctx.drawImage(
      this.coin.img,
      this.coin.x,
      this.coin.y
    );
    game.ctx.beginPath();
    game.ctx.textBaseline = 'top';
    game.ctx.textAlign = 'left';
    game.ctx.fillStyle = "white";
    game.ctx.fillText(
      this.coin.point, this.coin.x + this.coin.img.width + 5, this.coin.y + 13);

  }
}
