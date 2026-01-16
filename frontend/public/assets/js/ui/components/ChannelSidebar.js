import { createElement } from "../../utils/dom.js";
import { Button } from "./Button.js";

export class ChannelSidebar {
  constructor(options = {}) {
    this.element = null;
    this.options = {
      channels: [],
      selectedChannelId: null,
      onSelect: null,
      onCreate: null,
      onEdit: null,
      onDelete: null,
      disabled: false,
      ...options,
    };

    this.render();
  }

  render() {
    const container = createElement("div", {
      className: "h-full flex flex-col",
    });

    const header = createElement("div", {
      className: "p-4 border-b border-gray-200 flex items-center justify-between",
    });

    const title = createElement(
      "h2",
      { className: "text-sm font-semibold text-gray-900" },
      "Channels"
    );

    const createButton = new Button({
      text: "New",
      variant: "secondary",
      size: "sm",
      disabled: this.options.disabled,
      onClick: () => this.options.onCreate && this.options.onCreate(),
    });

    header.appendChild(title);
    header.appendChild(createButton.getElement());
    container.appendChild(header);

    const list = createElement("div", {
      className: "flex-1 overflow-y-auto p-2",
    });

    if (this.options.disabled) {
      list.appendChild(
        createElement(
          "div",
          { className: "p-4 text-sm text-gray-500" },
          "Select a workspace to view channels."
        )
      );
      container.appendChild(list);
      this.element = container;
      return container;
    }

    const publicChannels = this.options.channels.filter(
      (c) => c.visibility === "public"
    );
    const privateChannels = this.options.channels.filter(
      (c) => c.visibility === "private"
    );

    if (this.options.channels.length === 0) {
      list.appendChild(
        createElement(
          "div",
          { className: "p-4 text-sm text-gray-500" },
          "No channels yet. Create your first channel."
        )
      );
    } else {
      if (publicChannels.length) {
        list.appendChild(this.renderSection("Public", publicChannels, "#"));
      }
      if (privateChannels.length) {
        list.appendChild(this.renderSection("Private", privateChannels, "🔒"));
      }
    }

    container.appendChild(list);
    this.element = container;
    return container;
  }

  renderSection(title, channels, icon) {
    const section = createElement("div", { className: "mb-3" });
    section.appendChild(
      createElement(
        "div",
        {
          className:
            "px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide",
        },
        title
      )
    );

    const list = createElement("div", { className: "space-y-1" });
    channels.forEach((channel) => list.appendChild(this.renderItem(channel, icon)));
    section.appendChild(list);
    return section;
  }

  renderItem(channel, icon) {
    const isSelected = this.options.selectedChannelId === channel.id;
    const isLocked = channel.locked === true;

    const row = createElement("div", {
      className: `w-full px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
        isSelected
          ? "bg-blue-100 text-blue-900"
          : "text-gray-700 hover:bg-gray-100"
      }`,
    });

    const selectButton = createElement("button", {
      className: `flex-1 min-w-0 text-left flex items-center gap-2 ${
        isLocked ? "opacity-60 cursor-not-allowed" : ""
      }`,
      type: "button",
      disabled: isLocked,
      onclick: () => {
        if (isLocked) return;
        this.options.onSelect && this.options.onSelect(channel);
      },
      title: isLocked ? "You don’t have access to this private channel yet." : "",
    });

    selectButton.appendChild(createElement("span", { className: "text-sm" }, icon));
    selectButton.appendChild(
      createElement(
        "span",
        { className: "text-sm font-medium truncate" },
        channel.name
      )
    );

    const actions = createElement("div", {
      className: "flex items-center gap-2 flex-shrink-0",
    });

    const editBtn = createElement(
      "button",
      {
        type: "button",
        className:
          "text-xs px-2 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50",
        onclick: (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.options.onEdit && this.options.onEdit(channel);
        },
        title: "Edit channel",
      },
      "Edit"
    );

    const deleteBtn = createElement(
      "button",
      {
        type: "button",
        className:
          "text-xs px-2 py-1 rounded border border-red-200 text-red-700 bg-white hover:bg-red-50",
        onclick: (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.options.onDelete && this.options.onDelete(channel);
        },
        title: "Delete channel",
      },
      "Delete"
    );

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    row.appendChild(selectButton);
    row.appendChild(actions);
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
