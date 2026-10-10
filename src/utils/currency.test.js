import test from 'node:test';
import assert from 'node:assert/strict';

import { formatINR } from './currency.js';

test('formats rupee amounts with the INR symbol', () => {
  assert.equal(formatINR(9999.99), '₹9,999.99');
  assert.equal(formatINR(0), '₹0.00');
  assert.equal(formatINR(undefined), '₹0.00');
  assert.equal(formatINR(Number.NaN), '₹0.00');
});
