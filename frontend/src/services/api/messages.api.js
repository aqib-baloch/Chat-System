import axiosClient from "../http/axiosClient.js";

export const messagesApi = {
  async list(workspaceId, channelId, { limit = 50 } = {}) {
    const response = await axiosClient.get(
      `/workspaces/${workspaceId}/channels/${channelId}/messages`,
      { params: { limit } }
    );
    return response.data;
  },

  async send(workspaceId, channelId, contentOrPayload) {
    const payload =
      typeof contentOrPayload === "string"
        ? { content: contentOrPayload }
        : contentOrPayload || {};

    const response = await axiosClient.post(
      `/workspaces/${workspaceId}/channels/${channelId}/messages`,
      payload
    );
    return response.data;
  },

  async update(workspaceId, channelId, messageId, content) {
    const response = await axiosClient.put(
      `/workspaces/${workspaceId}/channels/${channelId}/messages/${messageId}`,
      { content }
    );
    return response.data;
  },

  async delete(workspaceId, channelId, messageId) {
    const response = await axiosClient.delete(
      `/workspaces/${workspaceId}/channels/${channelId}/messages/${messageId}`
    );
    return response.data;
  },
};
