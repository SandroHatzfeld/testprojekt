async function handleResponse(res) {
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `Request fehlgeschlagen (${res.status})`);
  }
  return data;
}

export function getJSON(path) {
  return fetch(`/api${path}`).then(handleResponse);
}

export function postJSON(path, body) {
  return fetch(`/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(handleResponse);
}

export function putJSON(path, body) {
  return fetch(`/api${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(handleResponse);
}

export function del(path) {
  return fetch(`/api${path}`, { method: 'DELETE' }).then(handleResponse);
}
