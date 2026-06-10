const T = {
  NORMAL: 0, PATH: 1, BUILDABLE: 2, START: 3, END: 4,
  SWAMP: 5, HIGHLAND: 6, BLOCKED: 7, GRASS: 8
};

const MAPS = {
  classic: {
    id: 'classic',
    nameKey: 'map.classic.name',
    descKey: 'map.classic.desc',
    diff: 1,
    path: [
      { col: 0, row: 5 }, { col: 3, row: 5 }, { col: 3, row: 2 }, { col: 8, row: 2 },
      { col: 8, row: 8 }, { col: 5, row: 8 }, { col: 5, row: 12 }, { col: 10, row: 12 },
      { col: 10, row: 6 }, { col: 14, row: 6 }, { col: 14, row: 14 }, { col: 18, row: 14 },
      { col: 18, row: 4 }, { col: 22, row: 4 }, { col: 22, row: 9 }, { col: 23, row: 9 }
    ],
    buildableChance: 0.65
  },
  canyon: {
    id: 'canyon',
    nameKey: 'map.canyon.name',
    descKey: 'map.canyon.desc',
    diff: 3,
    path: [
      { col: 0, row: 1 }, { col: 22, row: 1 }, { col: 22, row: 5 }, { col: 2, row: 5 },
      { col: 2, row: 9 }, { col: 22, row: 9 }, { col: 22, row: 13 }, { col: 2, row: 13 },
      { col: 2, row: 16 }, { col: 23, row: 16 }
    ],
    buildableChance: 0.35
  },
  ring: {
    id: 'ring',
    nameKey: 'map.ring.name',
    descKey: 'map.ring.desc',
    diff: 2,
    path: [
      { col: 0, row: 9 }, { col: 5, row: 2 }, { col: 19, row: 2 }, { col: 22, row: 9 },
      { col: 19, row: 16 }, { col: 5, row: 16 }, { col: 5, row: 9 }, { col: 23, row: 9 }
    ],
    buildableChance: 0.65
  },
  frozen: {
    id: 'frozen',
    nameKey: 'map.frozen.name',
    descKey: 'map.frozen.desc',
    diff: 2,
    path: [
      { col: 0, row: 9 }, { col: 23, row: 9 }
    ],
    buildableChance: 0.65,
    terrainOverrides: [
      { col: 0, row: 0, w: 24, h: 7, terrain: T.SWAMP },
      { col: 0, row: 12, w: 24, h: 6, terrain: T.SWAMP }
    ]
  }
};

export function getMapList() {
  return Object.values(MAPS);
}

export function getMapData(id) {
  return MAPS[id] || MAPS.classic;
}
