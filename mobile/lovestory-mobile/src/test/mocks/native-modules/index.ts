// Platform mock
export const mockPlatform = {
  OS: 'ios',
  select: jest.fn((obj: { ios: unknown; android: unknown }) => obj.ios),
};

// Dimensions mock
export const mockDimensions = {
  get: jest.fn(() => ({
    width: 390,
    height: 844,
    scale: 2,
    fontScale: 1,
  })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

// Animated mock
export const mockAnimated = {
  Value: jest.fn((value: number) => ({
    setValue: jest.fn(),
    setOffset: jest.fn(),
    flattenOffset: jest.fn(),
    extractOffset: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    stopAnimation: jest.fn(),
    resetAnimation: jest.fn(),
    interpolate: jest.fn(() => ({
      __getValue: jest.fn(),
      interpolate: jest.fn(),
    })),
    __getValue: jest.fn(() => value),
    __attach: jest.fn(),
    __detach: jest.fn(),
    __makeNative: jest.fn(),
    __getNativeTag: jest.fn(),
    __getNativeConfig: jest.fn(),
  })),
  timing: jest.fn(() => ({
    start: jest.fn((callback?: () => void) => callback?.()),
    stop: jest.fn(),
    reset: jest.fn(),
  })),
  spring: jest.fn(() => ({
    start: jest.fn((callback?: () => void) => callback?.()),
    stop: jest.fn(),
    reset: jest.fn(),
  })),
  createAnimatedComponent: jest.fn((component: any) => component),
};

// PixelRatio mock
export const mockPixelRatio = {
  get: jest.fn(() => 2),
  getFontScale: jest.fn(() => 1),
  getPixelSizeForLayoutSize: jest.fn((size: number) => size * 2),
  roundToNearestPixel: jest.fn((size: number) => size),
};

// StyleSheet mock
export const mockStyleSheet = {
  create: jest.fn((styles: Record<string, any>) => styles),
  flatten: jest.fn((styles: any) => styles),
  compose: jest.fn((style1: any, style2: any) => ({ ...style1, ...style2 })),
  absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  hairlineWidth: 1,
}; 