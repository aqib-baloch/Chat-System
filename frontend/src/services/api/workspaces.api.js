import axiosClient from "../http/axiosClient.js";

export const workspacesApi = {
  async list() {
    const response = await axiosClient.get("/workspaces");
    return response.data;
  },

  async getById(workspaceId) {
    const response = await axiosClient.get(`/workspaces/${workspaceId}`);
    return response.data;
  },

  async create(data) {
    const response = await axiosClient.post("/workspaces", data);
    return response.data;
  },

  async update(workspaceId, patch) {
    const response = await axiosClient.put(`/workspaces/${workspaceId}`, patch);
    return response.data;
  },

  async delete(workspaceId) {
    const response = await axiosClient.delete(`/workspaces/${workspaceId}`);
    return response.data;
  },
};
