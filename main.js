import * as tome from 'chromotome';
import * as utils from './utils';

const reversed = true;
const expand_diagonal = false;
const selection_size = 3;
const expansion_candidates = 5;
const speed = 2;

const grid_dim = 10;
const cell_size = 50;
const cell_padding = 4;
const palette = tome.get('present-correct').colors.map(utils.hexToRgb);

const space = [];
let candidates = [];
let tick = 0;

let sketch = function(p) {
  let THE_SEED;

  p.setup = function() {
    p.createCanvas(800, 800);
    THE_SEED = p.floor(p.random(9999999));
    p.randomSeed(THE_SEED);
    p.background('#f5ebca');
    //p.frameRate(10);

    for (let i = 0; i < grid_dim; i++) {
      const row = [];
      for (let j = 0; j < grid_dim; j++) {
        row.push({ color: null, filled: false, candidate: false, dist: -1 });
      }
      space.push(row);
    }
    draw_grid();

    const startPos = utils.pick_2d(space);
    let start = space[startPos[1]][startPos[0]];
    start.color = palette[utils.pick_1d(palette)];
    start.filled = true;
    start.dist = 0;

    candidates = utils.expandNeighborhood(
      [startPos],
      startPos,
      space,
      expand_diagonal
    );
    tick++;
  };

  p.draw = function() {
    const grid_size = grid_dim * cell_size;
    p.translate((p.width - grid_size) / 2, (p.height - grid_size) / 2);

    for (let i = 0; i < grid_dim; i++) {
      for (let j = 0; j < grid_dim; j++) {
        if (space[i][j].filled) {
          draw_pixel(j, i, space[i][j].color);
        }
      }
    }
    if (tick + speed < grid_dim * grid_dim) placePixels(speed);
    else if (tick < grid_dim * grid_dim)
      placePixels(grid_dim * grid_dim - tick);
    tick += speed;
  };

  p.keyPressed = function() {
    if (p.keyCode === 80) p.saveCanvas('sketch_' + THE_SEED, 'jpeg');
  };

  function placePixels(n) {
    for (let i = 0; i < n; i++) {
      // Find expansion pixel and expand candidates accordingly.
      const currentPos = utils.getNearest(
        candidates,
        space,
        reversed,
        expansion_candidates
      );
      candidates = utils.expandNeighborhood(
        candidates,
        currentPos,
        space,
        expand_diagonal
      );

      // Find best matching pixel among selection.
      let origin = utils.getSurroundingColor(currentPos, space);
      let cands = utils.getRandoms(selection_size, 0, palette.length);
      let best = utils.findBestMatch(origin, cands, palette);

      space[currentPos[1]][currentPos[0]].filled = true;
      space[currentPos[1]][currentPos[0]].color = palette[best];
    }
  }

  function draw_grid() {
    let modified_dim = grid_dim + 2;
    const grid_size = modified_dim * cell_size;
    p.translate((p.width - grid_size) / 2, (p.height - grid_size) / 2);

    p.fill('#ebddbd');
    p.noStroke();
    p.rect(-50, -50, grid_size + 100, grid_size + 100);

    p.fill('#f5ebca');
    p.stroke('#332c19');
    p.strokeWeight(1);

    for (let i = 0; i < modified_dim; i++) {
      for (let j = 0; j < modified_dim; j++) {
        p.rect(cell_size * i, cell_size * j, cell_size, cell_size);
      }
    }
    p.noStroke();
  }

  function draw_pixel(x, y, color) {
    p.fill(color);
    p.rect(
      y * cell_size + cell_padding,
      x * cell_size + cell_padding,
      cell_size - 2 * cell_padding + 1,
      cell_size - 2 * cell_padding + 1
    );
  }
};
new p5(sketch);
