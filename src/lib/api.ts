export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    });
  } catch (error) {
    if (error instanceof Error) throw new Error('Не удалось связаться с API-сервером.', { cause: error });
    throw error;
  }

  let payload: unknown;
  if (response.status !== 204) {
    const body = await response.text();
    if (body) {
      try {
        payload = JSON.parse(body);
      } catch {
        if (response.ok) throw new Error('API-сервер вернул некорректный ответ.');
      }
    }
  }
  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : 'Не удалось связаться с API-сервером.';
    throw new Error(message);
  }
  return payload as T;
}

export async function uploadBinary<T>(path: string, file: Blob): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': file.type },
      body: file,
    });
  } catch (error) {
    if (error instanceof Error) throw new Error('Не удалось связаться с API-сервером.', { cause: error });
    throw error;
  }

  const body = await response.text();
  let payload: unknown;
  if (body) {
    try {
      payload = JSON.parse(body);
    } catch {
      if (response.ok) throw new Error('API-сервер вернул некорректный ответ.');
    }
  }
  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : 'Не удалось связаться с API-сервером.';
    throw new Error(message);
  }
  return payload as T;
}
