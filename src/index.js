import s from "./common/settings";
import { randomInt, setLoadAllCallback } from "./common/util";
import GameController from "./controller/GameController";
import EnemyModel from "./model/EnemyModel";
import PlayerModel from "./model/PlayerModel";
import StageModel from "./model/StageModel";

const playerStopImages = [new Image(), new Image()];
const playerMoveImages = [new Image(), new Image()];
const enemyStopImages = [new Image(), new Image()];
const enemyMoveImages = [new Image(), new Image()];

setLoadAllCallback([
  playerStopImages[0], playerStopImages[1],
  playerMoveImages[0], playerMoveImages[1],
  enemyStopImages[0], enemyStopImages[1],
  enemyMoveImages[0], enemyMoveImages[1]
], function () {
  const player = new PlayerModel({
    stopImage: { normal: playerStopImages[0], trans: playerStopImages[1] },
    moveImages: { normal: [playerStopImages[0], playerMoveImages[0]], trans: [playerStopImages[1], playerMoveImages[1]] }
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
      return new EnemyModel({
        startPosition: x,
        moveImages: { normal: [enemyStopImages[0], enemyMoveImages[0]], trans: [enemyStopImages[1], enemyMoveImages[1]] }
      });
    }));
  }

  const game = new GameController({ player, stages, enemies });
  game.run();
});

playerStopImages[0].src = "./assets/images/player_stop.png";
playerStopImages[1].src = "./assets/images/player_stop_trans.png";
playerMoveImages[0].src = "./assets/images/player_move.png";
playerMoveImages[1].src = "./assets/images/player_move_trans.png";

enemyStopImages[0].src = "./assets/images/enemy_stop.png";
enemyStopImages[1].src = "./assets/images/enemy_stop_trans.png";
enemyMoveImages[0].src = "./assets/images/enemy_move.png";
enemyMoveImages[1].src = "./assets/images/enemy_move_trans.png";