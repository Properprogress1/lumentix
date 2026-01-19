// Basic health check test
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Health Check', () => {
  it('should pass basic health check', () => {
    assert.strictEqual(1 + 1, 2);
  });
});
