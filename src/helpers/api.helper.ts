import { APIRequestContext, APIResponse } from '@playwright/test';

export class ApiHelper {
  private readonly baseUrl: string;

  constructor(
    private readonly request: APIRequestContext,
    baseUrl = process.env['API_BASE_URL'] ?? '',
  ) {
    this.baseUrl = baseUrl;
  }

  private url(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const response = await this.request.get(this.url(path), { params });
    await this.assertOk(response);
    return response.json() as Promise<T>;
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const response = await this.request.post(this.url(path), { data: body });
    await this.assertOk(response);
    return response.json() as Promise<T>;
  }

  async put<T>(path: string, body: unknown): Promise<T> {
    const response = await this.request.put(this.url(path), { data: body });
    await this.assertOk(response);
    return response.json() as Promise<T>;
  }

  async patch<T>(path: string, body: unknown): Promise<T> {
    const response = await this.request.patch(this.url(path), { data: body });
    await this.assertOk(response);
    return response.json() as Promise<T>;
  }

  async delete(path: string): Promise<void> {
    const response = await this.request.delete(this.url(path));
    await this.assertOk(response);
  }

  private async assertOk(response: APIResponse): Promise<void> {
    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`API ${response.status()} ${response.statusText()}: ${response.url()}\n${body}`);
    }
  }
}
