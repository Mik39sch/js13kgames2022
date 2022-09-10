import { setLoadAllCallback } from "./common/util";
import GameController from "./controller/GameController";

import PlayerModel from "./model/PlayerModel";


const playerStopImages = [new Image(), new Image()];
const playerMoveImages = [new Image(), new Image()];
const enemyStopImages = [new Image(), new Image()];
const enemyMoveImages = [new Image(), new Image()];
const coinImage = new Image();
const rosaryImage = new Image();

setLoadAllCallback([
  playerStopImages[0], playerStopImages[1],
  playerMoveImages[0], playerMoveImages[1],
  enemyStopImages[0], enemyStopImages[1],
  enemyMoveImages[0], enemyMoveImages[1],
  coinImage, rosaryImage
], function () {
  const player = new PlayerModel({
    stopImage: { normal: playerStopImages[0], trans: playerStopImages[1] },
    moveImages: { normal: [playerStopImages[0], playerMoveImages[0]], trans: [playerStopImages[1], playerMoveImages[1]] }
  });

  const game = new GameController({ player, stages: [], enemies: [], enemyMoveImages, enemyStopImages, coinImage, rosaryImage });
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

coinImage.src = "./assets/images/coin.png";
rosaryImage.src = "./assets/images/rosary.png";