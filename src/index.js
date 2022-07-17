import GameController from "./controller/GameController";
import PlayerModel from "./model/PlayerModel";
import StageModel from "./model/StageModel";

const game = new GameController();
const player = new PlayerModel();
const stage = new StageModel();
game.setPlayer(player);
game.addDrawItems(stage);
game.run();
