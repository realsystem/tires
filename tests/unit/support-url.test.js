import { test } from 'node:test';
import assert from 'node:assert';
import { safeSupportUrl } from '../../src/utils/supportUrl.js';

test('support link accepts only plain https URLs', () => {
  assert.equal(safeSupportUrl('https://buymeacoffee.com/someone'), 'https://buymeacoffee.com/someone');
  assert.equal(safeSupportUrl('buymeacoffee.com/example'), 'https://buymeacoffee.com/example');
  assert.equal(safeSupportUrl('  https://buymeacoffee.com/example  '), 'https://buymeacoffee.com/example');
  for (const bad of ['', undefined, null, 'javascript:alert(1)', 'http://example.com', 'data:text/html,x', 'https://localhost', 'not a url']) {
    assert.equal(safeSupportUrl(bad), null, String(bad));
  }
});
