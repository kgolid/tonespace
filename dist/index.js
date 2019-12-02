(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

  const palettes = [
    {
      name: 'tundra1',
      colors: ['#40708c', '#8e998c', '#5d3f37', '#ed6954', '#f2e9e2']
    },
    {
      name: 'tundra2',
      colors: ['#5f9e93', '#3d3638', '#733632', '#b66239', '#b0a1a4', '#e3dad2']
    },
    {
      name: 'tundra3',
      colors: [
        '#87c3ca',
        '#7b7377',
        '#b2475d',
        '#7d3e3e',
        '#eb7f64',
        '#d9c67a',
        '#f3f2f2'
      ]
    },
    {
      name: 'tundra4',
      colors: [
        '#d53939',
        '#b6754d',
        '#a88d5f',
        '#524643',
        '#3c5a53',
        '#7d8c7c',
        '#dad6cd'
      ]
    },
    {
      name: 'retro',
      colors: [
        '#69766f',
        '#9ed6cb',
        '#f7e5cc',
        '#9d8f7f',
        '#936454',
        '#bf5c32',
        '#efad57'
      ]
    },
    {
      name: 'retro-washedout',
      colors: [
        '#878a87',
        '#cbdbc8',
        '#e8e0d4',
        '#b29e91',
        '#9f736c',
        '#b76254',
        '#dfa372'
      ]
    },
    {
      name: 'roygbiv-warm',
      colors: [
        '#705f84',
        '#687d99',
        '#6c843e',
        '#fc9a1a',
        '#dc383a',
        '#aa3a33',
        '#9c4257'
      ]
    },
    {
      name: 'roygbiv-toned',
      colors: [
        '#817c77',
        '#396c68',
        '#89e3b7',
        '#f59647',
        '#d63644',
        '#893f49',
        '#4d3240'
      ]
    },
    {
      name: 'present-correct',
      colors: [
        '#fd3741',
        '#fe4f11',
        '#ff6800',
        '#ffa61a',
        '#ffc219',
        '#ffd114',
        '#fcd82e',
        '#f4d730',
        '#ced562',
        '#8ac38f',
        '#79b7a0',
        '#72b5b1',
        '#5b9bae',
        '#6ba1b7',
        '#49619d',
        '#604791',
        '#721e7f',
        '#9b2b77',
        '#ab2562',
        '#ca2847'
      ]
    }
  ];

  var palettes$1 = palettes.map(p => {
    p.size = p.colors.length;
    return p;
  });

  function get(name) {
    return palettes$1.find(pal => pal.name == name);
  }

  function findBestMatch(origin, candidates, palette) {
    let best_idx = -1;
    let best_val = Number.MAX_VALUE;

    for (let i = 0; i < candidates.length; i++) {
      let xx = candidates[i];
      let val = compareColors(origin, palette[xx]);

      if (val < best_val) {
        best_val = val;
        best_idx = xx;
      }
    }
    return best_idx;
  }

  function expandNeighborhood(neighborhood, next, grid, expand_with_diagonals) {
    if (!neighborhood.includes(next)) {
      console.error(
        'Next pixel is not from the neighboorhood',
        next,
        neighborhood
      );
      return neighborhood;
    }

    // Get all adjacent pixels not yet filled.
    let expansion = getAdjacentIndices(
      next,
      grid[0].length,
      grid.length,
      expand_with_diagonals
    ).filter(pos => !grid[pos[1]][pos[0]].filled);

    // Increase their distance from root by one.
    expansion.forEach(pos => {
      grid[pos[1]][pos[0]].dist = grid[next[1]][next[0]].dist + 1;
    });

    // Remove pixels that already are candidates and make the remaining ones candidates.
    expansion = expansion.filter(pos => !grid[pos[1]][pos[0]].candidate);
    expansion.forEach(pos => {
      grid[pos[1]][pos[0]].candidate = true;
    });

    // Remove current pixel from neighboorhood and add its expansion.
    const next_index = neighborhood.indexOf(next);
    neighborhood.splice(next_index, 1);

    return neighborhood.concat(expansion);
  }

  function getNearest(cands, grid, reversed, expansion_candidates) {
    const reverse = Math.random() > 0.97 ? !reversed : reversed;
    const sign = reverse ? -1 : 1;

    let closest = reverse ? 0 : Number.MAX_VALUE;
    let closest_item = null;

    const selection = getRandoms(expansion_candidates, 0, cands.length - 1);
    selection.forEach(r => {
      let dist = grid[cands[r][1]][cands[r][0]].dist;
      if (sign * dist < sign * closest) {
        closest_item = cands[r];
        closest = dist;
      }
    });
    return closest_item;
  }

  function getSurroundingColor(q, array) {
    const adj = getAdjacentIndices(q, array[0].length, array.length, true)
      .map(pos => array[pos[1]][pos[0]].color)
      .filter(col => col !== null);
    return meanColor(adj);
  }

  // q is a tuple [x,y] of coordinates, where 0 <= x < nx and 0 <= y < ny
  const getAdjacentIndices = function(q, nx, ny, include_diagonals) {
    let indices = [];
    if (q[0] < nx - 1) indices.push([q[0] + 1, q[1]]);
    if (q[1] < ny - 1) indices.push([q[0], q[1] + 1]);
    if (q[0] > 0) indices.push([q[0] - 1, q[1]]);
    if (q[1] > 0) indices.push([q[0], q[1] - 1]);

    if (!include_diagonals) return indices;

    if (q[0] < nx - 1) {
      if (q[1] < ny - 1) indices.push([q[0] + 1, q[1] + 1]);
      if (q[1] > 0) indices.push([q[0] + 1, q[1] - 1]);
    }
    if (q[0] > 0) {
      if (q[1] < ny - 1) indices.push([q[0] - 1, q[1] + 1]);
      if (q[1] > 0) indices.push([q[0] - 1, q[1] - 1]);
    }
    return indices;
  };

  function meanColor(arr) {
    let r = arr.map(x => x[0]).reduce((x1, x2) => x1 + x2, 0);
    let g = arr.map(x => x[1]).reduce((x1, x2) => x1 + x2, 0);
    let b = arr.map(x => x[2]).reduce((x1, x2) => x1 + x2, 0);

    return [r / arr.length, g / arr.length, b / arr.length];
  }

  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16)
        ]
      : null;
  }

  function compareColors(a, b) {
    let dx = a[0] - b[0];
    let dy = a[1] - b[1];
    let dz = a[2] - b[2];
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2));
  }

  // ---- Randomness ----

  const pick_1d = array => random_int(array.length);
  const pick_2d = array => [
    random_int(array.length),
    random_int(array[0].length)
  ];

  const random_int = max => Math.floor(Math.random() * max);

  const getRandoms = function(n, from, to) {
    let arr = [];
    while (arr.length < n) {
      let rand = Math.floor(Math.random() * (to - from)) + from;
      arr.push(rand);
    }
    return arr;
  };

  const reversed = true;
  const expand_diagonal = false;
  const selection_size = 3;
  const expansion_candidates = 5;
  const speed = 2;

  const grid_dim = 10;
  const cell_size = 50;
  const cell_padding = 4;
  const palette = get('present-correct').colors.map(hexToRgb);

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

      const startPos = pick_2d(space);
      let start = space[startPos[1]][startPos[0]];
      start.color = palette[pick_1d(palette)];
      start.filled = true;
      start.dist = 0;

      candidates = expandNeighborhood([startPos], startPos, space, expand_diagonal);
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
      else if (tick < grid_dim * grid_dim) placePixels(grid_dim * grid_dim - tick);
      tick += speed;
    };

    p.keyPressed = function() {
      if (p.keyCode === 80) p.saveCanvas('sketch_' + THE_SEED, 'jpeg');
    };

    function placePixels(n) {
      for (let i = 0; i < n; i++) {
        // Find expansion pixel and expand candidates accordingly.
        const currentPos = getNearest(
          candidates,
          space,
          reversed,
          expansion_candidates
        );
        candidates = expandNeighborhood(
          candidates,
          currentPos,
          space,
          expand_diagonal
        );

        // Find best matching pixel among selection.
        let origin = getSurroundingColor(currentPos, space);
        let cands = getRandoms(selection_size, 0, palette.length);
        let best = findBestMatch(origin, cands, palette);

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

})));
