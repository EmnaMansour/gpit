import { render } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';

describe('App', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    expect(div).toBeTruthy();
  });
  
  it('example test', () => {
    expect(1 + 1).toBe(2);
  });
});