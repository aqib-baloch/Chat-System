import axiosClient from "../http/axiosClient.js";

export const channelsApi = {
  async list(workspaceId) {
    const response = await axiosClient.get(`/workspaces/${workspaceId}/channels`);
    return response.data;
  },

  async listPublic(workspaceId) {
    const response = await axiosClient.get(
      `/workspaces/${workspaceId}/channels/public`
    );
    return response.data;
  },

  async getById(workspaceId, channelId) {
    const response = await axiosClient.get(
      `/workspaces/${workspaceId}/channels/${channelId}`
    );
    return response.data;
  },

  async create(workspaceId, data) {
    const response = await axiosClient.post(
      `/workspaces/${workspaceId}/channels`,
      data
    );
    return response.data;
  },

  async update(workspaceId, channelId, patch) {
    const response = await axiosClient.put(
      `/workspaces/${workspaceId}/channels/${channelId}`,
      patch
    );
    return response.data;
  },

  async delete(workspaceId, channelId) {
    const response = await axiosClient.delete(
      `/workspaces/${workspaceId}/channels/${channelId}`
    );
    return response.data;
  },
};
