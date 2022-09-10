import { zzfx } from 'zzfx';

const hitSound = () => zzfx(...[, , 311, .03, .05, .2, 4, 1.86, -7.3, 7.5, , , , 2, , .2, , .97, .01]); // Hit 98
const hitEnemySound = () => zzfx(...[1.85, , 224, .01, .1, .19, 4, 2.26, , , , , , .9, -338, .4, .16, .9, .04]); // Hit 268
// zzfx(...[1.78,,467,.01,.06,0,3,.61,6.1,,,,,1.9,,,.12,.62,.07]); // Shoot 362
const pickCoinSound = () => zzfx(...[1.02, , 258, .01, .09, .19, 2, 1.71, , 2.6, 635, .08, .08, , , , , .6, .03]); // Pickup 276
const pickRosarySound = () => zzfx(...[, , 499, .04, .27, .41, , .59, , 9.5, , , .13, , , , , .54, .14, .03]); // Powerup 307
const jumpSound = () => zzfx(...[, , 443, .04, .05, .07, , .22, 6, 3.5, , , , .5, , , , .72, .05]); // Jump 269
const startSound = () => zzfx(...[, , 105, , .22, .09, 1, .06, 19, , , , .15, .1, 31, .2, , , .16, .48]); // Random 227

export { hitSound, hitEnemySound, pickCoinSound, pickRosarySound, startSound, jumpSound };