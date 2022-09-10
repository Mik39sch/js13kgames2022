import s from "../common/settings";
import EnemyModel from "../model/EnemyModel";
import StageModel from "../model/StageModel";
import { randomInt, getTime } from "../common/util";
import stage from "../model/StageConstant";
import HeaderModel from "../model/HeaderModel";
import ItemModel from "../model/ItemModel";
import { hitSound, hitEnemySound, pickCoinSound, startSound, pickRosarySound } from "../common/sound";

export default class GameController {
  constructor({ player, enemyMoveImages, enemyStopImages, coinImage, rosaryImage }) {
    this.player = player;
    this.header = undefined;
    this.stages = [];
    this.enemies = [];
    this.items = [];
    this.enemyMoveImages = enemyMoveImages;
    this.enemyStopImages = enemyStopImages;
    this.coinImage = coinImage;
    this.rosaryImage = rosaryImage;
    this.timer = 0;
    this.keyboard = [];
    this.level = 1;
    this.clear = false;
    this.clearTIme = 0;
    this.bossTimer = 0;
    this.bossClear = false;

    this.explainedRosary = false;
    this.showExplainRosary = false;
    this.showExplainRosaryTimer = 0;

    this.stageMaxX = s.STAGE_MAX_X;

    this.gamemode = "title"; // title, play, gameover

    const appElement = document.querySelector(s.APP_ELEMENT);
    const [w, h] = [s.CANVAS_WIDTH, s.CANVAS_HEIGHT];
    [appElement.style.width, appElement.style.height] = [`${w}px`, `${h}px`];
    this.offscreenEl = document.createElement("canvas");
    [this.offscreenEl.width, this.offscreenEl.height] = [w, h];

    this.ctx = this.offscreenEl.getContext('2d');

    const canvasEl = document.createElement("canvas");
    [canvasEl.style.width, canvasEl.style.height] = [`${w}px`, `${h}px`];
    [canvasEl.width, canvasEl.height] = [w, h];

    this.displayCtx = canvasEl.getContext('2d');
    appElement.appendChild(canvasEl);

    this.setKeyEvent();
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
        startSound();
        this._draw();
      }
      if ((this.gamemode === "gameover" || this.gamemode === "clear") && e.code === "Enter") {
        this.gamemode = "title";
        startSound();
        this._draw();
      }
      this.keyboard = this.keyboard.filter(a => a !== e.code);
    });
  }

  _draw() {
    this.ctx.save();
    if (this.gamemode !== "gameover") {
      this.ctx.fillStyle = 'maroon';
      this.ctx.fillRect(0, 0, s.CANVAS_WIDTH, s.CANVAS_HEIGHT);

      this.ctx.fillStyle = '#78882d';
      this.ctx.fillRect(0, s.GROUND_START_Y, s.CANVAS_WIDTH, s.GROUND_HEIGHT);
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
    if (this.gamemode === "clear") {
      this._drawClear();
    }

    this.ctx.restore();
    this.displayCtx.drawImage(this.offscreenEl, 0, 0);

    if (this.gamemode === "play" || this.gamemode === "boss") {
      this.timer = requestAnimationFrame(this._draw.bind(this));
    }
  }

  _drawTitle() {
    this.level = 1;
    this.clear = false;
    this.clearTIme = 0;

    this.explainedRosary = false;
    this.showExplainRosary = false;
    this.showExplainRosaryTimer = 0;

    this.header = new HeaderModel({ image: this.player.stopImage["normal"], rosaryImage: this.rosaryImage, coinImage: this.coinImage });
    this.initializeStage();

    this.stages
      .filter(stage => stage.x + stage.width >= 0 && stage.x <= s.CANVAS_WIDTH)
      .forEach(stage => {
        stage.update(this);
        stage.draw(this);
      });

    const title = "Lost Treasures 2";

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

    this._drawText(title, text);
  }

  initializeStage() {
    this.player.initialize();
    this.items = [
      new ItemModel({
        image: this.coinImage, x: 100, y: 0, type: "coin"
      }), new ItemModel({
        image: this.rosaryImage, x: 200, y: 0, type: "rosary"
      }),];
    this.stages = stage["stage"].map(stg => {
      if (stg.item) {
        const img = stg.item === "coin" ? this.coinImage : this.rosaryImage;
        this.items.push(new ItemModel({
          image: img,
          x: stg.x + stg.width / 2 - img.width / 2,
          y: stg.y - s.GROUND_START_Y,
          type: stg.item
        }))
      }
      return new StageModel(stg)
    });

    for (let idx = 0; idx < this.stageMaxX / s.CANVAS_WIDTH; idx++) {
      const itemLength = randomInt({ max: this.level + 2, min: this.level });
      this.items = this.items.concat([...Array(itemLength)].map(() => {
        const x = randomInt({
          max: s.CANVAS_WIDTH + idx * s.CANVAS_WIDTH,
          min: idx * s.CANVAS_WIDTH
        });
        return new ItemModel({
          image: this.coinImage,
          x: x,
          y: 0,
          type: "coin"
        });
      }));
    }

    this.enemies = [];
    for (let idx = 0; idx < this.stageMaxX / s.CANVAS_WIDTH; idx++) {
      const enemyLength = randomInt({ max: this.level * 2, min: this.level });
      this.enemies = this.enemies.concat([...Array(enemyLength)].map(() => {
        const x = randomInt({
          max: s.CANVAS_WIDTH + idx * s.CANVAS_WIDTH,
          min: idx * s.CANVAS_WIDTH + 10
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
      this.clearTIme = 0;
      this.level++;
      startSound();
      if (this.level > 3) {
        this.stages = [];
        this.enemies = [];
        this.items = [];
        this.header.rosary.point = 0;
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

    const enemyIdx = this._hit(this.enemies);
    if (!this.player.hitting && enemyIdx >= 0 && !this.enemies[enemyIdx].hitting) {
      this._hitAction(enemyIdx);
    }
    const itemIdx = this.getItem();
    if (itemIdx >= 0) {
      this.getItemAction(itemIdx);
    }

    this.stages
      .filter(stage => stage.x + stage.width >= viewMinX && stage.x <= viewMaxX).forEach(stage => {
        stage.update(this);
        stage.draw(this);
      });

    this.items.forEach(item => item.draw(this));

    enemies.forEach(enemy => {
      enemy.update(this);
      enemy.draw(this);
    });

    this.player.update(this);
    this.player.draw(this);

    this.header.draw(this);
    if (this.showExplainRosary) {
      this._drawExplainRosary();
    }
  }

  _drawBoss() {
    if (this.stages.length === 0) {
      this.stages = stage["boss_stage"].map(s => new StageModel(s));
    }

    if (this.enemies.length === 0) {
      this.enemies = [new EnemyModel({
        hitPoint: 5,
        size: 128,
        pattern: { speed: 1, jump: 20, walkLength: 800 },
        startPosition: 100,
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

    let itemMax = 5;
    let createItemTime = 101;
    if (this.enemies[0].hitPoint <= 2) {
      itemMax = 3;
      createItemTime = 151;
    }

    if (this.items.length <= itemMax && this.bossTimer % createItemTime === 0) {
      const stageIdx = randomInt({ max: this.stages.length, min: 0 });
      const stg = this.stages[stageIdx];
      const typeArray = ["coin", "rosary", "coin", "none"];
      const typeIdx = randomInt({ max: typeArray.length, min: 0 });
      const type = typeArray[typeIdx];

      if (type === "none") {
        // pass
      } else if (type === "coin") {
        this.items.push(new ItemModel({
          image: this.coinImage,
          x: stg.x + stg.width / 2 - this.coinImage.width / 2,
          y: stg.y - s.GROUND_START_Y,
          type
        }))
      } else if (
        type === "rosary" &&
        !this.items.some(item => item.type === "rosary") &&
        this.header.rosary.point <= 0
      ) {
        this.items.push(new ItemModel({
          image: this.rosaryImage,
          x: stg.x + stg.width / 2 - this.rosaryImage.width / 2,
          y: stg.y - s.GROUND_START_Y,
          type
        }))
      }
    }

    const itemIdx = this.getItem();
    if (itemIdx >= 0) {
      this.getItemAction(itemIdx);
    }

    this.stages.forEach(stage => stage.draw(this));
    this.items.forEach(item => item.draw(this));
    this.enemies.forEach(enemy => {
      enemy.update(this);
      enemy.draw(this);
    });

    const enemyIdx = this._hit(this.enemies);
    if (!this.player.hitting && enemyIdx >= 0 && !this.enemies[enemyIdx].hitting) {
      this._hitAction(enemyIdx);
      if (this.enemies[enemyIdx].hitPoint === 0) {
        this.gamemode = "clear";
      }
    }

    this.stageMaxX = s.CANVAS_WIDTH;
    this.player.update(this);
    this.player.draw(this);

    this.header.draw(this);
    this.bossTimer++;
  }

  _drawGameover() {
    const title = "GAME OVER... YOU ARE DEAD";

    let text = "He could kill zombie king and he could find many treasures.\n";
    text += "His treasure hunt will continue.\n";
    text += "\n";
    text += "\n";
    text += "Press Enter key to go back Title.";

    this._drawText(title, text);
  }

  _drawClear() {
    const title = "Game Clear!!!";

    let text = "He could kill zombie king and he could find many treasures.\n";
    text += "His treasure hunt will continue.\n";
    text += "\n";

    text += "\n";
    text += "Press Enter key to go back Title.";

    this._drawText(title, text);
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

    return enemies.findIndex(enemy => {
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

  _hitAction(enemyIdx) {
    if (this.header.rosary.point > 0) {
      hitEnemySound();
      const enemy = this.enemies[enemyIdx];
      if (enemy.hitPoint && enemy.hitPoint > 0) {
        this.enemies[enemyIdx].hitPoint--;
        this.enemies[enemyIdx].hitting = true;
        this.enemies[enemyIdx].hittingTimer = 100;

        if (enemy.hitPoint <= 2) {
          this.enemies[enemyIdx].pattern.speed = 3;
        }
      } else {
        this.enemies.splice(enemyIdx, 1);
      }

      this.header.rosary.point--;
    } else {
      hitSound();
      this.header.lifePoint.point -= 1;
      if (this.header.lifePoint.point <= 0) {
        this.gamemode = "gameover";
      }
      this.player.hitting = true;
      this.player.hittingTimer = 100;
    }
  }

  getItem() {
    const playerMinX = this.player.realX;
    const playerMaxX = this.player.realX + this.player.width;
    const playerMinY = this.player.realY - this.player.height;
    const playerMaxY = this.player.realY;

    return this.items.findIndex(item => {
      const itemMinX = item.x;
      const itemMaxX = item.x + 32;
      const itemMinY = item.y - 32;
      const itemMaxY = item.y;

      return (
        (itemMinX <= playerMinX && playerMinX <= itemMaxX && itemMinY <= playerMinY && playerMinY <= itemMaxY) ||
        (itemMinX <= playerMaxX && playerMaxX <= itemMaxX && itemMinY <= playerMinY && playerMinY <= itemMaxY) ||
        (itemMinX <= playerMinX && playerMinX <= itemMaxX && itemMinY <= playerMaxY && playerMaxY <= itemMaxY) ||
        (itemMinX <= playerMaxX && playerMaxX <= itemMaxX && itemMinY <= playerMaxY && playerMaxY <= itemMaxY)
      );
    });
  }

  getItemAction(itemIdx) {
    const gItem = this.items[itemIdx];
    if (gItem.type === "coin") {
      pickCoinSound();
    }
    if (gItem.type === "rosary") {
      pickRosarySound();
    }
    if (gItem.type === "rosary" && !this.explainedRosary) {
      this.explainedRosary = true;
      this.showExplainRosary = true;
      this.showExplainRosaryTimer = 0;
    }
    gItem.action(this);
    this.items.splice(itemIdx, 1);
  }

  showCLearText() {
    const title = `Stage${this.level} Clear!!!`;
    this._drawText(title, undefined);

    this.clearTIme++;
    if (this.clearTIme >= 100) {
      this.clear = false;
      this.clearTIme = 0;
    }

  }

  rosaryAction() {
    this.header.rosary.point++;
  }

  _drawExplainRosary() {
    const title = "You got Rosary!";
    let text = "If you have rosaries, you can attack enemies.\n";
    text += "1 rosary can attack 1 enemy.\n";
    this._drawText(title, text);

    this.showExplainRosaryTimer++;
    if (this.showExplainRosaryTimer > 300) {
      this.showExplainRosaryTimer = 0;
      this.showExplainRosary = false;
    }
  }

  _drawText(title, summary) {
    if (title) {
      this.ctx.font = "bold 40px serif";
      this.ctx.fillStyle = "white";
      this.ctx.textBaseline = 'center';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(title, s.CANVAS_WIDTH / 2, s.CANVAS_HEIGHT / 3);
    }

    if (summary) {
      const fontSize = 20;
      const lineHeight = 1.2;
      const x = 20;
      const y = s.CANVAS_HEIGHT / 3 + 50;
      this.ctx.beginPath();
      this.ctx.textBaseline = 'left';
      this.ctx.textAlign = 'left';
      this.ctx.font = "bold " + fontSize + "px Arial, meiryo, sans-serif";
      for (var lines = summary.split("\n"), i = 0, l = lines.length; l > i; i++) {
        var line = lines[i];
        var addY = fontSize;
        if (i) addY += fontSize * lineHeight * i;

        this.ctx.fillText(line, x + 0, y + addY);
      }
    }
  }

  run() {
    this._draw();
  }
}