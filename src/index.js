import s from "./common/settings";
import { randomInt, setLoadAllCallback } from "./common/util";
import GameController from "./controller/GameController";
import EnemyModel from "./model/EnemyModel";
import PlayerModel from "./model/PlayerModel";
import StageModel from "./model/StageModel";

const playerStopImage = new Image();
const playerMoveImage1 = new Image();
const playerMoveImage2 = new Image();
setLoadAllCallback([playerStopImage, playerMoveImage1, playerMoveImage2], function () {
  const player = new PlayerModel({
    stopImage: playerStopImage,
    moveImages: [playerMoveImage1, playerMoveImage2]
  });
  let stages = [];
  for (let idx = 0; idx < s.STAGE_MAX_X / s.CANVAS_WIDTH; idx++) {
    const stageLength = randomInt({ max: 10, min: 3 });
    stages = stages.concat([...Array(stageLength)].map(() => new StageModel({ widthIndex: idx })));
  }

  let enemies = [];
  for (let idx = 0; idx < s.STAGE_MAX_X / s.CANVAS_WIDTH; idx++) {
    const enemyLength = randomInt({ max: 3, min: 1 });
    enemies = enemies.concat([...Array(enemyLength)].map(() => {
      const x = randomInt({
        max: s.CANVAS_WIDTH + idx * s.CANVAS_WIDTH,
        min: idx * s.CANVAS_WIDTH
      });
      return new EnemyModel({ startPosition: x });
    }));
  }

  const game = new GameController({ player, stages, enemies });
  game.run();
});

playerStopImage.src = "./assets/images/player_stop.png";
playerMoveImage1.src = "./assets/images/player_move1.png";
playerMoveImage2.src = "./assets/images/player_move2.png";

