import { createElement } from "../../utils/dom.js";

export class ChatArea {
  constructor(options = {}) {
    this.element = null;
    this.options = {
      workspace: null,
      channel: null,
      messages: [],
      currentUserId: null,
      onSend: null,
      ...options,
    };

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

    row.appendChild(input);
    row.appendChild(sendBtn);
    composer.appendChild(row);

    composer.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text || !this.options.channel) return;
      this.options.onSend && this.options.onSend(text);
      input.value = "";
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

    const content = createElement("div", { className: "text-sm whitespace-pre-wrap break-words" });
    content.textContent = message.content;

    const meta = createElement(
      "div",
      { className: `text-[11px] mt-1 ${isMine ? "text-white/80" : "text-gray-500"}` },
      message.created_at ? new Date(message.created_at).toLocaleTimeString() : ""
    );

    bubble.appendChild(content);
    bubble.appendChild(meta);
    row.appendChild(bubble);
    return row;
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
