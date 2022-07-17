import s from "../common/settings";

export default class GameController {
  constructor() {
    this.drawItems = [];
    this.player = undefined;
    this.timer = 0;
    this.keyboard = [];
    this.setKeyEvent();

    const appElement = document.querySelector(s.APP_ELEMENT);
    const canvasEl = document.createElement("canvas");
    const [w, h] = [s.CANVAS_WIDTH, s.CANVAS_HEIGHT];

    [appElement.style.width, appElement.style.height] = [`${w}px`, `${h}px`];
    [canvasEl.width, canvasEl.height] = [w, h];

    this.ctx = canvasEl.getContext('2d');
    appElement.appendChild(canvasEl);
  }

  setPlayer(player) {
    this.player = player;
  }

  addDrawItems(item) {
    this.drawItems.push(item);
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
    // draw stage
    this.ctx.fillStyle = 'skyblue';
    this.ctx.fillRect(0, 0, s.CANVAS_WIDTH, s.CANVAS_HEIGHT);

    this.ctx.fillStyle = 'green';
    this.ctx.fillRect(0, s.GROUND_START_Y, s.CANVAS_WIDTH, s.GROUND_HEIGHT);

    this.drawItems.forEach(item => {
      item.update(this);
      item.draw(this);
    });

    this.player.update(this);
    this.player.draw(this);

    this.timer = requestAnimationFrame(this._draw.bind(this));
  }

  run() {
    this._draw();
  }
}