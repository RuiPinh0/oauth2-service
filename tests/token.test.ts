import { issueToken } from '../src/utils/token.js';

test('issues a valid token', async () => {
  const token = await issueToken('demo-client');
  expect(token).toHaveProperty('access_token');
  expect(token).toHaveProperty('token_type', 'Bearer');
  expect(token).toHaveProperty('expires_in', 3600);
});