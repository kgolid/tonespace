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

// --------

export {
  findBestMatch,
  expandNeighborhood,
  getNearest,
  getSurroundingColor,
  pick_1d,
  pick_2d,
  getRandoms,
  hexToRgb
};
