import BaseModel from "./BaseModel"
import s from "../common/settings";

export default class StageModel extends BaseModel {
  constructor(options) {
    super(options);

    this.stageHeight = 10;

    // let idx = 0;
    // this.stages = [];
    // let prevX = 0;

    this.stages = [
      {
        x: 100,
        y: 450,
        height: 20,
        width: 100
      },
      {
        x: 100,
        y: 330,
        height: 20,
        width: 100
      }
    ];

    // [...Array(10)].forEach(() => {
    //   this.stages = [...[...Array(10)].map(() => {
    //     const maxX = s.CANVAS_WIDTH + idx * s.CANVAS_WIDTH;
    //     const minX = prevX;
    //     const x = Math.floor(Math.random() * maxX) + minX;
    //     prevX = x;

    //     const maxY = s.GROUND_START_Y - 50;
    //     const minY = 1;
    //     const y = Math.floor(Math.random() * maxY) + minY;

    //     let color = "#505050";
    //     return [x, y, color];
    //   }), ...this.stages];
    //   prevX = idx * s.CANVAS_WIDTH;
    //   idx++;
    // });

    // this.stages.sort((a, b) => {
    //   if (a[1] < b[1]) {
    //     return -1;
    //   }
    //   return 1;
    // });
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
      .filter(stage => stage.x >= viewMinX && stage.x <= viewMaxX)
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
    const playerPosX = game.player.realX;
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
