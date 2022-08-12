import BaseModel from "./BaseModel"
import s from "../common/settings";
import { randomInt } from "../common/util";

export default class StageModel extends BaseModel {
  constructor(options) {
    super(options);

    this.stageHeight = 10;
    this.stages = [];
    let prevX = 0;

    // this.stages = [
    //   {
    //     x: 100,
    //     y: 450,
    //     height: 20,
    //     width: 100
    //   },
    //   {
    //     x: 180,
    //     y: 330,
    //     height: 20,
    //     width: 100
    //   },
    //   {
    //     x: 260,
    //     y: 210,
    //     height: 20,
    //     width: 100
    //   }
    // ];

    [...Array(s.STAGE_MAX_X / s.CANVAS_WIDTH)].forEach((el, idx) => {
      const stageLength = randomInt({ max: 10, min: 3 });
      this.stages = [...[...Array(stageLength)].map(() => {
        const x = randomInt({
          max: s.CANVAS_WIDTH + idx * s.CANVAS_WIDTH,
          min: idx * s.CANVAS_WIDTH
        });
        const y = randomInt({ max: s.GROUND_START_Y - 50, min: 1 });
        const width = randomInt({ max: 300, min: 100 });

        return { x, y, height: 20, width };
      }), ...this.stages];
      prevX = idx * s.CANVAS_WIDTH;
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
      viewMinX = playerPosX - s.CANVAS_WIDTH / 2;
      viewMaxX = playerPosX + s.CANVAS_WIDTH / 2;
    }

    this.stages
      .filter(stage => stage.x + stage.width >= viewMinX && stage.x <= viewMaxX)
      .forEach(stage => {
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
        game.ctx.strokeRect(stage.x - adjustX, stage.y, stage.width, stage.height);
        game.ctx.fillRect(stage.x - adjustX, stage.y, stage.width, stage.height);
      });
  }

  getStandPlace(game) {
    const playerPosX = game.player.realX + game.player.height / 2;
    return this.stages
      .filter(stage => stage.x <= playerPosX && stage.x + stage.width >= playerPosX)
      .sort((a, b) => {
        if (a.y < b.y) {
          return -1;
        }
        return 1;
      });
  }
}
