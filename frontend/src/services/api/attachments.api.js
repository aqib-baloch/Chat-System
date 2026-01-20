import axiosClient from "../http/axiosClient.js";

function parseFilenameFromContentDisposition(headerValue) {
  if (!headerValue || typeof headerValue !== "string") return null;
  const match = headerValue.match(/filename="([^"]+)"/i);
  return match ? match[1] : null;
}

export const attachmentsApi = {
  async upload(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosClient.post("/attachments", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async download(fileId) {
    const response = await axiosClient.get(`/attachments/${fileId}`, {
      responseType: "blob",
    });

    const filename =
      parseFilenameFromContentDisposition(
        response.headers?.["content-disposition"]
      ) || `attachment-${fileId}`;

    return { blob: response.data, filename, contentType: response.headers?.["content-type"] };
  },
};
