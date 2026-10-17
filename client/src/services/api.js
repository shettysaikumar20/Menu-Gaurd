const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function handleResponse(response) {
  if (!response.ok) {
    let errMsg = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const data = await response.json();
      errMsg = data.error || errMsg;
      if (data.errors && Array.isArray(data.errors)) {
        errMsg += ` (${data.errors.map(e => e.message).join('; ')})`;
      }
    } catch (_) {
      // not JSON
    }
    throw new Error(errMsg);
  }
  return response.json();
}

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  async getRestaurant() {
    const res = await fetch(`${API_BASE}/menu/restaurant`);
    return handleResponse(res);
  },

  async updateRestaurant(data) {
    const res = await fetch(`${API_BASE}/menu/restaurant`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getMenuItems() {
    const res = await fetch(`${API_BASE}/menu`);
    return handleResponse(res);
  },

  async createMenuItem(item) {
    const res = await fetch(`${API_BASE}/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return handleResponse(res);
  },

  async updateMenuItem(id, item) {
    const res = await fetch(`${API_BASE}/menu/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return handleResponse(res);
  },

  async deleteMenuItem(id) {
    const res = await fetch(`${API_BASE}/menu/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  async importCSV(csvContent, mode = 'append') {
    const res = await fetch(`${API_BASE}/menu/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvContent, mode })
    });
    return handleResponse(res);
  },

  async resetDemoMenu() {
    const res = await fetch(`${API_BASE}/menu/reset-demo`, {
      method: 'POST'
    });
    return handleResponse(res);
  },

  async runAudit() {
    const res = await fetch(`${API_BASE}/audits`, {
      method: 'POST'
    });
    return handleResponse(res);
  },

  async getAudits() {
    const res = await fetch(`${API_BASE}/audits`);
    return handleResponse(res);
  },

  async getAuditById(id) {
    const res = await fetch(`${API_BASE}/audits/${id}`);
    return handleResponse(res);
  },

  async updateFinding(findingId, payload) {
    const res = await fetch(`${API_BASE}/findings/${findingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async applyApprovedCorrections(auditId) {
    const res = await fetch(`${API_BASE}/audits/${auditId}/apply`, {
      method: 'POST'
    });
    return handleResponse(res);
  }
};
