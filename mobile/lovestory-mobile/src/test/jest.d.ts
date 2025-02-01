import { expect as jestExpect } from '@jest/globals';
import type { RenderResult } from '@testing-library/react-native';
import type { Store } from '@reduxjs/toolkit';
import '@testing-library/jest-native/extend-expect';

declare global {
  const expect: typeof jestExpect;
  
  namespace NodeJS {
    interface Global {
      expect: typeof jestExpect;
    }
  }

  // Extend Jest matchers
  namespace jest {
    interface Matchers<R> {
      toHaveTextContent: (text: string | RegExp) => R;
      toBeDisabled: () => R;
      toBeEnabled: () => R;
      toBeEmpty: () => R;
      toHaveStyle: (style: object) => R;
      toBeVisible: () => R;
      toContainElement: (element: any) => R;
      toHaveProp: (prop: string, value?: any) => R;
    }
  }
}

// Extend RenderResult with our custom additions
declare module '@testing-library/react-native' {
  interface RenderResult {
    store: Store;
    rerender: (ui: React.ReactElement) => void;
    unmount: () => void;
    container: Element;
  }
}

// Make TypeScript recognize test files
declare module '*.test.tsx' {
  const content: any;
  export default content;
}

declare module '*.test.ts' {
  const content: any;
  export default content;
}

// Ensure proper typing for async tests
declare function beforeEach(fn: () => void | Promise<void>): void;
declare function afterEach(fn: () => void | Promise<void>): void;
declare function beforeAll(fn: () => void | Promise<void>): void;
declare function afterAll(fn: () => void | Promise<void>): void;

// Extend HTMLElement for React Native testing
export interface TestElement extends HTMLElement {
  props: {
    [key: string]: any;
    testID?: string;
    children?: React.ReactNode;
    style?: object;
    disabled?: boolean;
    editable?: boolean;
    secureTextEntry?: boolean;
  };
}

// Extend the query types
declare module '@testing-library/react-native' {
  interface Queries {
    getByTestId(id: string): TestElement;
    queryByTestId(id: string): TestElement | null;
    findByTestId(id: string): Promise<TestElement>;
    getAllByTestId(id: string): TestElement[];
    queryAllByTestId(id: string): TestElement[];
    findAllByTestId(id: string): Promise<TestElement[]>;
  }
}

export {}; 