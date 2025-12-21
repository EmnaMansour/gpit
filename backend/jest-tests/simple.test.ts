import { add, multiply, APP_NAME } from '../src/utils/mathUtils';

describe('Tests Jest basiques pour couverture SonarCloud', () => {
  it('doit additionner correctement', () => {
    expect(add(1, 1)).toBe(2);
    expect(add(5, 7)).toBe(12);
  });

  it('doit multiplier correctement', () => {
    expect(multiply(3, 4)).toBe(12);
    expect(multiply(0, 10)).toBe(0);
  });

  it('doit avoir le bon nom d\'application', () => {
    expect(APP_NAME).toContain('GPIT');
  });
});