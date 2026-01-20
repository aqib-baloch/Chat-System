import { createElement } from "../../utils/dom.js";
import { attachmentsApi } from "../../services/api/attachments.api.js";
import { showError, showLoading, hideLoading } from "../../utils/notify.js";

export class ChatArea {
  constructor(options = {}) {
    this.element = null;
    this.options = {
      workspace: null,
      channel: null,
      messages: [],
      currentUserId: null,
      onSend: null, // ({ content, attachment_ids }) => void
      onUpdate: null, // (messageId, { content }) => void
      onDelete: null, // (messageId) => void
      onManageMembers: null, // () => void
      ...options,
    };

    this.pendingAttachmentIds = [];
    this.pendingAttachmentFiles = [];
    this.editingMessageId = null;
    this.editDraft = "";

    this.render();
  }

  render() {
    const container = createElement("div", {
      className: "h-full flex flex-col",
    });

    const header = createElement("div", {
      className: "px-6 py-4 border-b border-gray-200 bg-white",
    });

    if (this.options.channel) {
      const row = createElement("div", {
        className: "flex items-center justify-between",
      });

      const left = createElement("div", { className: "min-w-0" });
      const titleRow = createElement("div", {
        className: "flex items-center gap-2 min-w-0",
      });
      titleRow.appendChild(
        createElement(
          "span",
          { className: "text-lg" },
          this.options.channel.visibility === "public" ? "#" : "🔒"
        )
      );
      titleRow.appendChild(
        createElement(
          "h1",
          { className: "text-lg font-semibold text-gray-900 truncate" },
          this.options.channel.name
        )
      );
      left.appendChild(titleRow);

      left.appendChild(
        createElement(
          "p",
          { className: "text-sm text-gray-500 truncate mt-0.5" },
          this.options.channel.description || ""
        )
      );

      row.appendChild(left);

      if (
        this.options.channel.visibility === "private" &&
        this.options.currentUserId &&
        this.options.channel.created_by === this.options.currentUserId
      ) {
        const manageBtn = createElement(
          "button",
          { type: "button", className: "btn btn-secondary text-sm", onclick: () => this.options.onManageMembers && this.options.onManageMembers() },
          "Members"
        );
        row.appendChild(manageBtn);
      }
      header.appendChild(row);
    } else {
      header.appendChild(
        createElement(
          "div",
          { className: "text-sm text-gray-600" },
          this.options.workspace
            ? "Select a channel to start chatting."
            : "Select a workspace to get started."
        )
      );
    }

    container.appendChild(header);

    const body = createElement("div", {
      className: "flex-1 overflow-y-auto p-6 bg-white space-y-3",
    });

    if (!this.options.workspace) {
      body.appendChild(
        createElement(
          "div",
          { className: "h-full flex items-center justify-center text-gray-500" },
          "Choose or create a workspace."
        )
      );
    } else if (!this.options.channel) {
      body.appendChild(
        createElement(
          "div",
          { className: "h-full flex items-center justify-center text-gray-500" },
          "Choose or create a channel."
        )
      );
    } else {
      if (!this.options.messages || this.options.messages.length === 0) {
        body.appendChild(
          createElement(
            "div",
            { className: "h-full flex items-center justify-center text-gray-500" },
            "No messages yet. Say hi 👋"
          )
        );
      } else {
        this.options.messages.forEach((m) => body.appendChild(this.renderMessage(m)));
      }
    }

    container.appendChild(body);

    const composer = createElement("form", {
      className: "p-4 border-t border-gray-200 bg-gray-50",
    });

    const row = createElement("div", { className: "flex items-center gap-3" });

    const fileInput = createElement("input", {
      type: "file",
      className: "hidden",
      multiple: false,
      disabled: !this.options.channel,
    });

    const attachBtn = createElement(
      "button",
      {
        type: "button",
        className:
          "btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed",
        disabled: !this.options.channel,
        onclick: () => fileInput.click(),
        title: "Attach file",
      },
      "📎"
    );

    const input = createElement("input", {
      className:
        "input-field bg-white disabled:bg-gray-100 disabled:cursor-not-allowed flex-1",
      placeholder: this.options.channel
        ? `Message ${this.options.channel.name}...`
        : "Select a channel to start typing...",
      disabled: !this.options.channel,
    });

    const sendBtn = createElement(
      "button",
      {
        type: "submit",
        className:
          "btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed",
        disabled: !this.options.channel,
      },
      "Send"
    );

    row.appendChild(fileInput);
    row.appendChild(attachBtn);
    row.appendChild(input);
    row.appendChild(sendBtn);
    composer.appendChild(row);

    const attachmentsRow = createElement("div", { className: "mt-3 flex flex-wrap gap-2" });
    composer.appendChild(attachmentsRow);

    fileInput.addEventListener("change", async () => {
      const file = fileInput.files?.[0];
      fileInput.value = "";
      if (!file || !this.options.channel) return;

      const loading = showLoading("Uploading attachment...");
      try {
        const result = await attachmentsApi.upload(file);
        const attachmentId = result?.attachment?.id;
        if (attachmentId) {
          this.pendingAttachmentIds = [...this.pendingAttachmentIds, attachmentId];
          this.pendingAttachmentFiles = [
            ...this.pendingAttachmentFiles,
            { id: attachmentId, filename: file.name },
          ];
          this.renderPendingAttachments(attachmentsRow);
        }
      } catch (e) {
        showError(e.response?.data?.error || "Failed to upload attachment");
      } finally {
        hideLoading(loading);
      }
    });

    composer.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!this.options.channel) return;
      if (!text && this.pendingAttachmentIds.length === 0) return;

      this.options.onSend &&
        this.options.onSend({
          content: text,
          attachment_ids: this.pendingAttachmentIds,
        });

      input.value = "";
      this.pendingAttachmentIds = [];
      this.pendingAttachmentFiles = [];
      this.renderPendingAttachments(attachmentsRow);
    });

    container.appendChild(composer);

    this.element = container;
    return container;
  }

  renderMessage(message) {
    const isMine = this.options.currentUserId && message.sender_id === this.options.currentUserId;

    const row = createElement("div", {
      className: `flex ${isMine ? "justify-end" : "justify-start"}`,
    });

    const bubble = createElement("div", {
      className: `max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
        isMine ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-900"
      }`,
    });

    const headerRow = createElement("div", { className: "flex items-start justify-between gap-2" });

    const contentWrap = createElement("div", { className: "min-w-0 flex-1" });
    const content = createElement("div", { className: "text-sm whitespace-pre-wrap break-words" });

    if (this.editingMessageId === message.id) {
      const editBox = createElement("textarea", {
        className: "w-full rounded-md p-2 text-sm text-gray-900",
        rows: 3,
      });
      editBox.value = this.editDraft;
      editBox.addEventListener("input", () => {
        this.editDraft = editBox.value;
      });

      const editActions = createElement("div", { className: "mt-2 flex gap-2" });
      const saveBtn = createElement(
        "button",
        {
          type: "button",
          className: "btn btn-secondary text-xs",
          onclick: () => {
            const next = this.editDraft.trim();
            if (!next) return;
            this.options.onUpdate && this.options.onUpdate(message.id, { content: next });
            this.editingMessageId = null;
            this.editDraft = "";
          },
        },
        "Save"
      );
      const cancelBtn = createElement(
        "button",
        {
          type: "button",
          className: "btn btn-secondary text-xs",
          onclick: () => {
            this.editingMessageId = null;
            this.editDraft = "";
            this.update({});
          },
        },
        "Cancel"
      );
      editActions.appendChild(saveBtn);
      editActions.appendChild(cancelBtn);

      contentWrap.appendChild(editBox);
      contentWrap.appendChild(editActions);
    } else {
      content.textContent = message.content;
      contentWrap.appendChild(content);

      const attachmentIds = message.attachment_ids || [];
      if (Array.isArray(attachmentIds) && attachmentIds.length > 0) {
        const attachmentList = createElement("div", {
          className: `mt-2 flex flex-col gap-1 ${isMine ? "text-white/90" : "text-gray-700"}`,
        });
        attachmentIds.forEach((id) => {
          const btn = createElement(
            "button",
            {
              type: "button",
              className: `text-xs underline text-left ${isMine ? "text-white/90" : "text-primary-700"}`,
              onclick: async () => {
                try {
                  const { blob, filename } = await attachmentsApi.download(id);
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = filename || "attachment";
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  setTimeout(() => URL.revokeObjectURL(url), 2000);
                } catch (e) {
                  showError(e.response?.data?.error || "Failed to download attachment");
                }
              },
            },
            `Download attachment`
          );
          attachmentList.appendChild(btn);
        });
        contentWrap.appendChild(attachmentList);
      }
    }

    headerRow.appendChild(contentWrap);

    if (isMine && this.editingMessageId !== message.id) {
      const actions = createElement("div", { className: "flex gap-1 flex-shrink-0" });

      const editBtn = createElement(
        "button",
        {
          type: "button",
          className: "text-xs px-2 py-1 rounded bg-white/15 hover:bg-white/25",
          onclick: () => {
            this.editingMessageId = message.id;
            this.editDraft = message.content || "";
            this.update({});
          },
          title: "Edit",
        },
        "✎"
      );

      const deleteBtn = createElement(
        "button",
        {
          type: "button",
          className: "text-xs px-2 py-1 rounded bg-white/15 hover:bg-white/25",
          onclick: () => {
            const ok = window.confirm("Delete this message?");
            if (!ok) return;
            this.options.onDelete && this.options.onDelete(message.id);
          },
          title: "Delete",
        },
        "🗑"
      );

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);
      headerRow.appendChild(actions);
    }

    const meta = createElement(
      "div",
      { className: `text-[11px] mt-1 ${isMine ? "text-white/80" : "text-gray-500"}` },
      message.created_at ? new Date(message.created_at).toLocaleTimeString() : ""
    );

    bubble.appendChild(headerRow);
    bubble.appendChild(meta);
    row.appendChild(bubble);
    return row;
  }

  renderPendingAttachments(container) {
    container.innerHTML = "";
    this.pendingAttachmentFiles.forEach((f) => {
      const chip = createElement("div", {
        className: "inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 px-3 py-1 text-xs text-gray-700",
      });
      chip.appendChild(createElement("span", { className: "truncate max-w-[220px]" }, f.filename));
      const removeBtn = createElement(
        "button",
        {
          type: "button",
          className: "text-gray-500 hover:text-gray-900",
          onclick: () => {
            this.pendingAttachmentIds = this.pendingAttachmentIds.filter((id) => id !== f.id);
            this.pendingAttachmentFiles = this.pendingAttachmentFiles.filter((x) => x.id !== f.id);
            this.renderPendingAttachments(container);
          },
          title: "Remove attachment",
        },
        "×"
      );
      chip.appendChild(removeBtn);
      container.appendChild(chip);
    });
  }

  update(options) {
    const oldElement = this.element;
    this.options = { ...this.options, ...options };
    const newElement = this.render();
    if (oldElement?.parentElement) {
      oldElement.parentElement.replaceChild(newElement, oldElement);
    }
    this.element = newElement;
  }

  getElement() {
    return this.element;
  }
}
