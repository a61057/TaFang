export const ACHIEVEMENTS = [
  {
    id: 'first_wave',
    name: 'First Wave',
    description: 'Survive your first wave',
    icon: '🌊',
    check: (stats) => stats.wavesCompleted >= 1
  },
  {
    id: 'wave_10',
    name: 'Wave Warrior',
    description: 'Reach wave 10',
    icon: '⚔️',
    check: (stats) => stats.wavesCompleted >= 10
  },
  {
    id: 'wave_25',
    name: 'Veteran Defender',
    description: 'Reach wave 25',
    icon: '🛡️',
    check: (stats) => stats.wavesCompleted >= 25
  },
  {
    id: 'wave_50',
    name: 'Legendary Guardian',
    description: 'Reach wave 50',
    icon: '🏆',
    check: (stats) => stats.wavesCompleted >= 50
  },
  {
    id: 'kill_100',
    name: 'Bug Squasher',
    description: 'Kill 100 enemies',
    icon: '💀',
    check: (stats) => stats.totalKills >= 100
  },
  {
    id: 'kill_1000',
    name: 'Mass Murderer',
    description: 'Kill 1000 enemies',
    icon: '☠️',
    check: (stats) => stats.totalKills >= 1000
  },
  {
    id: 'tower_50',
    name: 'Builder',
    description: 'Build 50 towers',
    icon: '🔨',
    check: (stats) => stats.towersBuilt >= 50
  },
  {
    id: 'max_tower',
    name: 'Master Craftsman',
    description: 'Upgrade a tower to max level',
    icon: '⭐',
    check: (stats) => stats.maxLevelTowers >= 1
  },
  {
    id: 'no_leak_10',
    name: 'Perfect Defense',
    description: 'Complete 10 waves without leaking',
    icon: '✨',
    check: (stats) => stats.perfectWaves >= 10
  },
  {
    id: 'gold_10000',
    name: 'Rich',
    description: 'Earn 10,000 gold total',
    icon: '💰',
    check: (stats) => stats.totalGoldEarned >= 10000
  },
  {
    id: 'boss_kill',
    name: 'Boss Slayer',
    description: 'Defeat your first boss',
    icon: '👹',
    check: (stats) => stats.bossesKilled >= 1
  },
  {
    id: 'endless_10',
    name: 'Endless Endurance',
    description: 'Survive 10 waves in endless mode',
    icon: '♾️',
    check: (stats) => stats.endlessWaves >= 10
  }
];
