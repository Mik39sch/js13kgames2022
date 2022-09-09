import s from "../common/settings";
import EnemyModel from "../model/EnemyModel";
import StageModel from "../model/StageModel";
import { randomInt, getTime } from "../common/util";
import stage from "../model/StageConstant";
import HeaderModel from "../model/HeaderModel";

export default class GameController {
  constructor({ player, enemyMoveImages, enemyStopImages }) {
    this.player = player;
    this.header = undefined;
    this.stages = [];
    this.enemies = [];
    this.enemyMoveImages = enemyMoveImages;
    this.enemyStopImages = enemyStopImages;
    this.timer = 0;
    this.keyboard = [];
    this.level = 1;
    this.clear = false;
    this.setKeyEvent();
    this.clearTIme = 0;

    this.stageMaxX = s.STAGE_MAX_X;

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
        this.header.time.startTime = getTime();
        this._draw();
      }
      if (this.gamemode === "gameover" && e.code === "Enter") {
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
    if (this.gamemode === "boss") {
      this._drawBoss();
    }
    if (this.gamemode === "gameover") {
      this._drawGameover();
    }

    this.offscreenCtx.restore();
    this.ctx.drawImage(this.offscreenEl, 0, 0);

    if (this.gamemode === "play" || this.gamemode === "boss") {
      this.timer = requestAnimationFrame(this._draw.bind(this));
    }
  }

  _drawTitle() {
    this.level = 1;
    this.clear = false;
    this.header = new HeaderModel({ image: this.player.stopImage["normal"] });
    this.initializeStage();

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
    text += "ArrowKeys(Left/Right): move\n";
    text += "ArrowKeys(Up): jump\n";
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

  initializeStage() {
    this.player.initialize();
    this.stages = stage["stage"].map(s => new StageModel(s));

    this.enemies = [];
    for (let idx = 0; idx < this.stageMaxX / s.CANVAS_WIDTH; idx++) {
      const enemyLength = randomInt({ max: this.level + 2, min: this.level });
      this.enemies = this.enemies.concat([...Array(enemyLength)].map(() => {
        const x = randomInt({
          max: s.CANVAS_WIDTH + idx * s.CANVAS_WIDTH,
          min: idx * s.CANVAS_WIDTH
        });
        return new EnemyModel({
          level: this.level,
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
    this.enemies = [];
  }

  _drawGame() {
    const playerPosX = this.player.realX;
    let viewMinX = 0;
    let viewMaxX = s.CANVAS_WIDTH;
    if (playerPosX >= this.stageMaxX - s.CANVAS_WIDTH / 2) {
      viewMinX = this.stageMaxX - s.CANVAS_WIDTH;
      viewMaxX = this.stageMaxX;
    } else if (playerPosX >= s.CANVAS_WIDTH / 2) {
      viewMinX = playerPosX - s.CANVAS_WIDTH / 2;
      viewMaxX = playerPosX + s.CANVAS_WIDTH / 2;
    }

    if (playerPosX >= s.STAGE_MAX_X) {
      this.clear = true;
      this.clearTIme = getTime();
      this.level++;
      if (this.level > 3) {
        this.stages = [];
        this.gamemode = "boss";
        this.player.initialize();
      } else {
        this.initializeStage();
      }
    }

    if (this.clear) {
      this.showCLearText();
    }

    const enemies = this.enemies
      .filter(enemy =>
        enemy.x + enemy.startPosition + enemy.height > viewMinX &&
        enemy.x + enemy.startPosition - enemy.height < viewMaxX
      );

    if (!this.player.hitting && this._hit(this.enemies)) {
      this._hitAction();
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
    this.header.draw(this, this.offscreenCtx);
  }

  _drawBoss() {
    if (this.stages.length === 0) {
      this.stages = stage["boss_stage"].map(s => new StageModel(s));
    }

    if (this.enemies.length === 0) {
      this.enemies = [new EnemyModel({
        size: 128,
        pattern: { speed: 1, jump: 20, walkLength: 600 },
        startPosition: 300,
        moveImages: {
          normal: [
            this.enemyStopImages[0],
            this.enemyMoveImages[0]
          ], trans: [
            this.enemyStopImages[1],
            this.enemyMoveImages[1]
          ]
        }
      })];
    }

    this.stages.forEach(stage => stage.draw(this, this.offscreenCtx));
    this.enemies.forEach(enemy => {
      enemy.update(this);
      enemy.draw(this, this.offscreenCtx);
    });

    if (!this.player.hitting && this._hit(this.enemies)) {
      this._hitAction();
    }

    this.stageMaxX = s.CANVAS_WIDTH;
    this.player.update(this);
    this.player.draw(this, this.offscreenCtx);

    this.header.draw(this, this.offscreenCtx);
  }

  _drawGameover() {
    this.offscreenCtx.font = "bold 40px serif";
    this.offscreenCtx.fillStyle = "white";
    this.offscreenCtx.textBaseline = 'center';
    this.offscreenCtx.textAlign = 'center';
    this.offscreenCtx.fillText("GAME OVER... YOU ARE DEAD", s.CANVAS_WIDTH / 2, s.CANVAS_HEIGHT / 3);
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

  _hit(enemies) {
    const playerMinX = this.player.realX;
    const playerMaxX = this.player.realX + this.player.width;
    const playerMinY = this.player.realY - this.player.height;
    const playerMaxY = this.player.realY;

    return enemies.some(enemy => {
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
  }

  _hitAction() {
    this.header.lifePoint.point -= 1;
    if (this.header.lifePoint.point < 0) {
      this.gamemode = "gameover";
    }
    this.player.hitting = true;
    this.player.hittingTimer = 100;
  }

  getStageKey() {
    return `stage${this.level}`;
  }

  showCLearText() {
    this.offscreenCtx.font = "bold 40px serif";
    this.offscreenCtx.fillStyle = "white";
    this.offscreenCtx.textBaseline = 'center';
    this.offscreenCtx.textAlign = 'center';

    const title = `Stage${this.level} Clear!!!`;
    this.offscreenCtx.fillText(title, s.CANVAS_WIDTH / 2, s.CANVAS_HEIGHT / 3);
    const time = Math.floor(getTime() - this.clearTIme / 1000) / 1000;
    if (time >= 30) {
      this.clear = false;
    }
  }

  run() {
    this._draw();
  }
}