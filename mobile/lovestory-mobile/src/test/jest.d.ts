import { expect as jestExpect } from '@jest/globals';

declare global {
  const expect: typeof jestExpect;
  namespace NodeJS {
    interface Global {
      expect: typeof jestExpect;
    }
  }
} 