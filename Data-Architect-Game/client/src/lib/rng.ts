/**
 * Seeded RNG using mulberry32 algorithm
 * Ensures deterministic, repeatable game runs
 */

export function createRNG(seed: number) {
  let state = seed;
  
  // mulberry32 algorithm
  function next(): number {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  
  return {
    // Get next random number between 0 and 1
    random: next,
    
    // Get random integer between min (inclusive) and max (exclusive)
    randomInt: (min: number, max: number): number => {
      return Math.floor(next() * (max - min)) + min;
    },
    
    // Get random element from array
    randomChoice: <T>(arr: T[]): T => {
      return arr[Math.floor(next() * arr.length)];
    },
    
    // Shuffle array (Fisher-Yates)
    shuffle: <T>(arr: T[]): T[] => {
      const result = [...arr];
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    },
    
    // Check if event triggers (probability 0-1)
    chance: (probability: number): boolean => {
      return next() < probability;
    },
    
    // Get current seed state (for saving)
    getState: (): number => state,
    
    // Set state (for loading)
    setState: (newState: number) => { state = newState; },
  };
}

export type RNG = ReturnType<typeof createRNG>;
