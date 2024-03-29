const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = CANVAS_WIDTH - (CANVAS_WIDTH * 4 / 10);
const GROUND_HEIGHT = CANVAS_HEIGHT / 10 * 1;
const GROUND_START_Y = CANVAS_HEIGHT - GROUND_HEIGHT;
const STAGE_MAX_X = CANVAS_WIDTH + 10 * CANVAS_WIDTH;

export default {
    APP_ELEMENT: "#app",
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    GROUND_HEIGHT,
    GROUND_START_Y,
    GRAVITY: 0.4,
    STAGE_MAX_X,
};