import BaseModel from "./BaseModel"
import s from "../common/settings";

export default class StageModel extends BaseModel {
  constructor(options) {
    super(options);

    this.stageHeight = 10;

    let idx = 0;
    this.stages = [];
    [...Array(10)].forEach(() => {
      this.stages = [...[...Array(10)].map(() => {
        const maxX = s.CANVAS_WIDTH + idx * s.CANVAS_WIDTH;
        const minX = idx * s.CANVAS_WIDTH;
        const x = Math.floor(Math.random() * maxX) + minX;

        const maxY = s.GROUND_START_Y - 50;
        const minY = 1;
        const y = Math.floor(Math.random() * maxY) + minY;

        let color = "#000000";
        if (y <= maxY / 10 * 1) {
          color = "#e0e0e0";
        } else if (y <= maxY / 10 * 2) {
          color = "#c0c0c0";
        } else if (y <= maxY / 10 * 3) {
          color = "#a0a0a0";
        } else if (y <= maxY / 10 * 4) {
          color = "#808080";
        } else if (y <= maxY / 10 * 5) {
          color = "#606060";
        } else if (y <= maxY / 10 * 6) {
          color = "#404040";
        } else if (y <= maxY / 10 * 7) {
          color = "#303030";
        } else if (y <= maxY / 10 * 8) {
          color = "#202020";
        } else if (y <= maxY / 10 * 9) {
          color = "#101010";
        } else if (y <= maxY / 10 * 10) {
          color = "#000000";
        }

        return [x, y, color];
      }), ...this.stages];
      idx++;
    });

    this.stages.sort((a, b) => {
      if (a[1] < b[1]) {
        return -1;
      }
      return 1;
    });
  }

  draw(game) {
    const playerPosX = game.player.realX;
    let viewMinX = 0;
    let viewMaxX = s.CANVAS_WIDTH;
    if (playerPosX >= s.CANVAS_WIDTH / 2) {
      viewMinX = 0;
      viewMaxX = s.CANVAS_WIDTH;
    }

    this.stages
      .filter(stage => stage[1] >= viewMinX && stage[1] <= viewMaxX)
      .forEach(stage => {
        game.ctx.strokeStyle = "gray";
        game.ctx.fillStyle = stage[2];

        let adjustX = 0;
        const stageMiddle = s.CANVAS_WIDTH / 2;
        if (game.player.realX <= stageMiddle) {
          adjustX = 0;
        } else if (game.player.realX >= stageMiddle && game.player.realX <= s.STAGE_MAX_X - stageMiddle) {
          adjustX = game.player.realX - stageMiddle;
        } else if (game.player.realX >= s.STAGE_MAX_X - stageMiddle) {
          adjustX = s.STAGE_MAX_X - s.CANVAS_WIDTH;
        }
        game.ctx.strokeRect(stage[0] - adjustX, stage[1], 100, s.GROUND_START_Y - stage[1]);
        game.ctx.fillRect(stage[0] - adjustX, stage[1], 100, s.GROUND_START_Y - stage[1]);
      });
  }
}
