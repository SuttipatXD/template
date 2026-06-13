import { test, expect } from '../../src/fixtures';
import { ApiHelper } from '../../src/helpers/api.helper';
import { random } from '../../src/helpers/random.helper';
import type { ApiResponse, User } from '../../src/types';

/**
 * API-layer tests — use Playwright's built-in APIRequestContext.
 * These run headlessly without a browser page, making them very fast.
 */
test.describe('Users API', () => {
  let api: ApiHelper;

  test.beforeEach(async ({ request }) => {
    api = new ApiHelper(request);
  });

  test('GET /users returns a list', async () => {
    const response = await api.get<ApiResponse<User[]>>('/users');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  test('POST /users creates a new user', async () => {
    const newUser = {
      email: random.email('api_test'),
      name: random.name(),
      role: 'viewer' as const,
    };

    const response = await api.post<ApiResponse<User>>('/users', newUser);

    expect(response.status).toBe(201);
    expect(response.data.email).toBe(newUser.email);
  });

  test('GET /users/:id returns 404 for unknown id', async ({ request }) => {
    const response = await request.get(
      `${process.env['API_BASE_URL'] ?? ''}/users/nonexistent-id-99999`,
    );

    expect(response.status()).toBe(404);
  });
});
