const CHALLENGES = [
  {
    id: 'no_upgrade',
    waves: 15,
    modifiers: {
      blockUpgrade: true,
    },
  },
  {
    id: 'no_build',
    waves: 15,
    modifiers: {
      blockBuild: true,
    },
  },
  {
    id: 'double_speed',
    waves: 20,
    modifiers: {
      enemySpeedMult: 2,
    },
  },
  {
    id: 'armored',
    waves: 20,
    modifiers: {
      bonusArmor: 5,
    },
  },
  {
    id: 'gold_drought',
    waves: 20,
    modifiers: {
      goldMult: 0.5,
    },
  },
  {
    id: 'boss_rush',
    waves: 15,
    modifiers: {
      bossInterval: 3,
    },
  },
  {
    id: 'fog_war',
    waves: 20,
    modifiers: {
      rangeMult: 0.7,
    },
  },
  {
    id: 'swarm',
    waves: 15,
    modifiers: {
      swarmMult: 3,
      swarmSizeMult: 0.6,
    },
  },
  {
    id: 'one_hero',
    waves: 15,
    modifiers: {
      blockBuild: true,
      heroOnly: true,
    },
  },
];

const CHALLENGE_STORAGE = 'td_challenges';

export function getChallenges() {
  return CHALLENGES;
}

export function getChallenge(id) {
  return CHALLENGES.find(c => c.id === id) || null;
}

export function loadChallengeProgress() {
  try {
    return JSON.parse(localStorage.getItem(CHALLENGE_STORAGE) || '{}');
  } catch (e) {
    return {};
  }
}

export function markChallengeCompleted(id) {
  const prog = loadChallengeProgress();
  prog[id] = true;
  try {
    localStorage.setItem(CHALLENGE_STORAGE, JSON.stringify(prog));
  } catch (e) { /* ignore */ }
}

export function isChallengeCompleted(id) {
  const prog = loadChallengeProgress();
  return !!prog[id];
}
