import GameController from "./controller/GameController";
import PlayerModel from "./model/PlayerModel";

const game = new GameController();
const player = new PlayerModel();
game.addDrawItems(player);
game.run();
