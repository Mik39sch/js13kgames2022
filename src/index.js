import s from "./common/settings";
import { randomInt } from "./common/util";
import GameController from "./controller/GameController";
import EnemyModel from "./model/EnemyModel";
import PlayerModel from "./model/PlayerModel";
import StageModel from "./model/StageModel";

const game = new GameController();

const player = new PlayerModel();
game.setPlayer(player);

const stage = new StageModel();
game.addDrawItems("stage", stage);

for (let idx = 0; idx < s.STAGE_MAX_X / s.CANVAS_WIDTH; idx++) {
  const enemyLength = randomInt({ max: 3, min: 1 });
  for (let eIdx = 0; eIdx < enemyLength; eIdx++) {
    const x = randomInt({
      max: s.CANVAS_WIDTH + idx * s.CANVAS_WIDTH,
      min: idx * s.CANVAS_WIDTH
    });
    const enemy = new EnemyModel({ startPosition: x });
    game.addDrawItems(`enemy${idx}_${eIdx}`, enemy);
    console.log(x);
  }
}

// [...Array(s.STAGE_MAX_X / s.CANVAS_WIDTH)].forEach((el, idx) => {
//   const enemyLength = randomInt({ max: 3, min: 1 });
//   [...Array(enemyLength)].forEach(() => {
//     const x = randomInt({
//       max: s.CANVAS_WIDTH + idx * s.CANVAS_WIDTH,
//       min: idx * s.CANVAS_WIDTH
//     });
//     const enemy = new EnemyModel(x);
//     game.addDrawItems("enemy", enemy);
//   });
//   idx++;
// });

game.run();
