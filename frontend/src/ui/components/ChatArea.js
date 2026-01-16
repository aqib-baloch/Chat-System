import { createElement } from "../../utils/dom.js";

export class ChatArea {
  constructor(options = {}) {
    this.element = null;
    this.options = {
      workspace: null,
      channel: null,
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
      className: "flex-1 overflow-y-auto p-6 bg-white",
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
      body.appendChild(
        createElement(
          "div",
          { className: "h-full flex items-center justify-center text-gray-500" },
          "Messages UI is next. Workspace + channel navigation is ready."
        )
      );
    }

    container.appendChild(body);

    const composer = createElement("div", {
      className: "p-4 border-t border-gray-200 bg-gray-50",
    });

    const input = createElement("input", {
      className:
        "input-field bg-white disabled:bg-gray-100 disabled:cursor-not-allowed",
      placeholder: this.options.channel
        ? `Message ${this.options.channel.name}...`
        : "Select a channel to start typing...",
      disabled: !this.options.channel,
    });

    composer.appendChild(input);
    container.appendChild(composer);

    this.element = container;
    return container;
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
