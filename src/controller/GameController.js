import s from "../common/settings";

export default class GameController {
  constructor({ player, stages, enemies }) {
    this.player = player;
    this.stages = stages;
    this.enemies = enemies;
    this.timer = 0;
    this.keyboard = [];
    this.setKeyEvent();

    const appElement = document.querySelector(s.APP_ELEMENT);
    const [w, h] = [s.CANVAS_WIDTH, s.CANVAS_HEIGHT];
    [appElement.style.width, appElement.style.height] = [`${w}px`, `${h}px`];

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
      this.keyboard = this.keyboard.filter(a => a !== e.code);
    });
  }

  _draw() {
    this.ctx.save();

    this.ctx.fillStyle = 'maroon';
    this.ctx.fillRect(0, 0, s.CANVAS_WIDTH, s.CANVAS_HEIGHT);

    this.ctx.fillStyle = 'darkslategray';
    this.ctx.fillRect(0, s.GROUND_START_Y, s.CANVAS_WIDTH, s.GROUND_HEIGHT);

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


    const stg = this.stages
      .filter(stage => stage.x + stage.width >= viewMinX && stage.x <= viewMaxX);

    stg.forEach(stage => {
      stage.update(this);
      stage.draw(this, this.ctx);
    });

    const enm = this.enemies
      .filter(enemy =>
        enemy.x + enemy.startPosition + enemy.height > viewMinX &&
        enemy.x + enemy.startPosition - enemy.height < viewMaxX
      );

    enm.forEach(enemy => {
      enemy.update(this);
      enemy.draw(this, this.ctx);
    });

    this.player.update(this);
    this.player.draw(this, this.ctx);

    this.ctx.restore();

    this.timer = requestAnimationFrame(this._draw.bind(this));
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