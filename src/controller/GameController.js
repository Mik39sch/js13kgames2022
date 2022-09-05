import s from "../common/settings";
import EnemyModel from "../model/EnemyModel";
import StageModel from "../model/StageModel";
import { randomInt } from "../common/util";
import stage from "../model/StageConstant";

export default class GameController {
  constructor({ player, enemyMoveImages, enemyStopImages }) {
    this.player = player;
    this.stages = [];
    this.enemies = [];
    this.enemyMoveImages = enemyMoveImages;
    this.enemyStopImages = enemyStopImages;
    this.timer = 0;
    this.keyboard = [];
    this.setKeyEvent();

    this.gamemode = "title"; // title, play, gameover

    const appElement = document.querySelector(s.APP_ELEMENT);
    const [w, h] = [s.CANVAS_WIDTH, s.CANVAS_HEIGHT];
    [appElement.style.width, appElement.style.height] = [`${w}px`, `${h}px`];
    this.offscreenEl = document.createElement("canvas");
    [this.offscreenEl.width, this.offscreenEl.height] = [w, h];

    this.offscreenCtx = this.offscreenEl.getContext('2d');

    const canvasEl = document.createElement("canvas");
    [canvasEl.style.width, canvasEl.style.height] = [`${w}px`, `${h}px`];
    [canvasEl.width, canvasEl.height] = [w, h];

    this.ctx = canvasEl.getContext('2d');
    appElement.appendChild(canvasEl);
  }

  setPlayer(player) {
    this.player = player;
  }

  setKeyEvent() {
    document.addEventListener("keydown", e => {
      this.keyboard = [...new Set([...this.keyboard, e.code])];
    });
    document.addEventListener("keyup", e => {
      if (this.gamemode === "title") {
        this.gamemode = "play";
        this.player.initialize();
        this._draw();
      }
      if (this.gamemode === "gameover") {
        this.gamemode = "title";
        this._draw();
      }
      this.keyboard = this.keyboard.filter(a => a !== e.code);
    });
  }

  _draw() {
    this.offscreenCtx.save();
    if (this.gamemode !== "gameover") {
      this.offscreenCtx.fillStyle = 'maroon';
      this.offscreenCtx.fillRect(0, 0, s.CANVAS_WIDTH, s.CANVAS_HEIGHT);

      this.offscreenCtx.fillStyle = '#78882d';
      this.offscreenCtx.fillRect(0, s.GROUND_START_Y, s.CANVAS_WIDTH, s.GROUND_HEIGHT);
    }

    if (this.gamemode === "title") {
      this._drawTitle();
    }
    if (this.gamemode === "play") {
      this._drawGame();
    }
    if (this.gamemode === "gameover") {
      this._drawGameover();
    }

    this.offscreenCtx.restore();
    this.ctx.drawImage(this.offscreenEl, 0, 0);

    if (this.gamemode === "play") {
      this.timer = requestAnimationFrame(this._draw.bind(this));
    }
  }

  _drawTitle() {
    this.stages = stage["stage1"].map(s => new StageModel(s));

    this.enemies = [];
    for (let idx = 0; idx < s.STAGE_MAX_X / s.CANVAS_WIDTH; idx++) {
      const enemyLength = randomInt({ max: 3, min: 1 });
      this.enemies = this.enemies.concat([...Array(enemyLength)].map(() => {
        const x = randomInt({
          max: s.CANVAS_WIDTH + idx * s.CANVAS_WIDTH,
          min: idx * s.CANVAS_WIDTH
        });
        return new EnemyModel({
          startPosition: x,
          moveImages: {
            normal: [
              this.enemyStopImages[0],
              this.enemyMoveImages[0]
            ], trans: [
              this.enemyStopImages[1],
              this.enemyMoveImages[1]
            ]
          }
        });
      }));
    }

    this.stages
      .filter(stage => stage.x + stage.width >= 0 && stage.x <= s.CANVAS_WIDTH)
      .forEach(stage => {
        stage.update(this);
        stage.draw(this, this.offscreenCtx);
      });

    this.offscreenCtx.font = "bold 40px serif";
    this.offscreenCtx.fillStyle = "white";
    this.offscreenCtx.textBaseline = 'center';
    this.offscreenCtx.textAlign = 'center';

    const title = "Lost Treasures 2";
    this.offscreenCtx.fillText(title, s.CANVAS_WIDTH / 2, s.CANVAS_HEIGHT / 3);

    const fontSize = 20;
    const lineHeight = 1.2;
    const x = 20;
    const y = s.CANVAS_HEIGHT / 3 + 50;

    let text = "One day... There was a treasures hunter.\n";
    text += "He heard a rumor that there was some treasures in the cave.\n";
    text += "So he went to the cave but... He was lost!\n";
    text += "You need to navigate to the exit for him.\n";
    text += "\n";
    text += "----------------------------------------------------------\n";
    text += "ArrowKeys: move\n";
    text += "SpaceKeys: dig *if you have a shovel\n";
    text += "EnterKeys: attack *if you have a sword\n";
    text += "----------------------------------------------------------\n";

    text += "\n";
    text += "Press any key to start a new game.";

    this.offscreenCtx.beginPath();
    this.offscreenCtx.textBaseline = 'left';
    this.offscreenCtx.textAlign = 'left';
    this.offscreenCtx.font = "bold " + fontSize + "px Arial, meiryo, sans-serif";
    for (var lines = text.split("\n"), i = 0, l = lines.length; l > i; i++) {
      var line = lines[i];
      var addY = fontSize;
      if (i) addY += fontSize * lineHeight * i;

      this.offscreenCtx.fillText(line, x + 0, y + addY);
    }
  }

  _drawGame() {
    const playerPosX = this.player.realX;
    let viewMinX = 0;
    let viewMaxX = s.CANVAS_WIDTH;
    if (playerPosX >= s.STAGE_MAX_X - s.CANVAS_WIDTH / 2) {
      viewMinX = s.STAGE_MAX_X - s.CANVAS_WIDTH;
      viewMaxX = s.STAGE_MAX_X;
    } else if (playerPosX >= s.CANVAS_WIDTH / 2) {
      viewMinX = playerPosX - s.CANVAS_WIDTH / 2;
      viewMaxX = playerPosX + s.CANVAS_WIDTH / 2;
    }

    const enemies = this.enemies
      .filter(enemy =>
        enemy.x + enemy.startPosition + enemy.height > viewMinX &&
        enemy.x + enemy.startPosition - enemy.height < viewMaxX
      );

    const playerMinX = this.player.realX;
    const playerMaxX = this.player.realX + this.player.width;
    const playerMinY = this.player.realY - this.player.height;
    const playerMaxY = this.player.realY;

    const hit = enemies.some(enemy => {
      const enemyMinX = enemy.x + enemy.startPosition + 10;
      const enemyMaxX = enemy.x + enemy.startPosition + enemy.width - 10;
      const enemyMinY = enemy.y - enemy.height;
      const enemyMaxY = enemy.y;

      return (
        (enemyMinX <= playerMinX && playerMinX <= enemyMaxX && enemyMinY <= playerMinY && playerMinY <= enemyMaxY) ||
        (enemyMinX <= playerMaxX && playerMaxX <= enemyMaxX && enemyMinY <= playerMinY && playerMinY <= enemyMaxY) ||
        (enemyMinX <= playerMinX && playerMinX <= enemyMaxX && enemyMinY <= playerMaxY && playerMaxY <= enemyMaxY) ||
        (enemyMinX <= playerMaxX && playerMaxX <= enemyMaxX && enemyMinY <= playerMaxY && playerMaxY <= enemyMaxY)
      )
    });

    if (hit) {
      this.gamemode = "gameover";
    }

    this.stages
      .filter(stage => stage.x + stage.width >= viewMinX && stage.x <= viewMaxX).forEach(stage => {
        stage.update(this);
        stage.draw(this, this.offscreenCtx);
      });

    enemies.forEach(enemy => {
      enemy.update(this);
      enemy.draw(this, this.offscreenCtx);
    });

    this.player.update(this);
    this.player.draw(this, this.offscreenCtx);
  }

  _drawGameover() {
    this.offscreenCtx.font = "bold 40px serif";
    this.offscreenCtx.fillStyle = "white";
    this.offscreenCtx.textBaseline = 'center';
    this.offscreenCtx.textAlign = 'center';
    this.offscreenCtx.fillText("Game Over", s.CANVAS_WIDTH / 2, s.CANVAS_HEIGHT / 3);
  }

  getViewStages(target) {
    const targetPosX = target.x + target.height / 2;
    return this.stages
      .filter(stage => stage.x <= targetPosX && stage.x + stage.width >= targetPosX)
      .sort((a, b) => {
        if (a.y < b.y) {
          return -1;
        }
        return 1;
      });
  }

  run() {
    this._draw();
  }
}