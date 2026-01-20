import { createElement } from "../../utils/dom.js";
import { Button } from "./Button.js";

export class WorkspaceSidebar {
  constructor(options = {}) {
    this.element = null;
    this.options = {
      workspaces: [],
      selectedWorkspaceId: null,
      onSelect: null,
      onCreate: null,
      onEdit: null,
      onDelete: null,
      ...options,
    };

    this.render();
  }

  getInitials(name) {
    const cleaned = String(name || "").trim();
    if (!cleaned) return "WS";

    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    const word = parts[0] || "";
    return word.slice(0, 2).toUpperCase();
  }

  render() {
    const container = createElement("div", {
      className: "h-full flex flex-col",
    });

    const header = createElement("div", {
      className: "p-3 border-b border-gray-200 flex items-center justify-between",
    });

    const title = createElement(
      "h2",
      { className: "text-sm font-semibold text-gray-900" },
      "Workspaces"
    );

    const createButton = new Button({
      text: "New",
      variant: "secondary",
      size: "sm",
      onClick: () => this.options.onCreate && this.options.onCreate(),
    });

    header.appendChild(title);
    header.appendChild(createButton.getElement());
    container.appendChild(header);

    const list = createElement("div", {
      className: "flex-1 overflow-y-auto p-2",
    });

    if (this.options.workspaces.length === 0) {
      list.appendChild(
        createElement(
          "div",
          { className: "p-4 text-sm text-gray-500" },
          "No workspaces yet. Create your first workspace."
        )
      );
    } else {
      this.options.workspaces.forEach((ws) => {
        const isSelected = this.options.selectedWorkspaceId === ws.id;

        const row = createElement("div", {
          className: `w-full p-2 rounded-md transition-colors flex items-center justify-between ${
            isSelected
              ? "bg-primary-50 text-primary-800"
              : "hover:bg-gray-50 text-gray-700"
          }`,
        });

        const avatarButton = createElement("button", {
          className: `w-10 h-10 rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
            isSelected ? "bg-primary-600 text-white" : "bg-primary-600 text-white"
          }`,
          type: "button",
          onclick: () => this.options.onSelect && this.options.onSelect(ws),
          title: ws.name,
          ariaLabel: ws.name,
        });
        avatarButton.textContent = this.getInitials(ws.name);

        const actions = createElement("div", {
          className: "flex items-center gap-1 flex-shrink-0",
        });

        const editBtn = createElement(
          "button",
          {
            type: "button",
            className:
              "p-2 rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-700",
            onclick: (e) => {
              e.preventDefault();
              e.stopPropagation();
              this.options.onEdit && this.options.onEdit(ws);
            },
            title: "Edit workspace",
            ariaLabel: "Edit workspace",
          },
          ""
        );
        editBtn.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path d="M13.586 3.586a2 2 0 0 1 2.828 2.828l-8.5 8.5a1 1 0 0 1-.39.242l-3.5 1.167a.75.75 0 0 1-.948-.948l1.167-3.5a1 1 0 0 1 .242-.39l8.5-8.5Z"/><path d="M11.379 5.793 14.207 8.62"/></svg>';

        const deleteBtn = createElement(
          "button",
          {
            type: "button",
            className:
              "p-2 rounded border border-red-200 text-red-700 bg-white hover:bg-red-50",
            onclick: (e) => {
              e.preventDefault();
              e.stopPropagation();
              this.options.onDelete && this.options.onDelete(ws);
            },
            title: "Delete workspace",
            ariaLabel: "Delete workspace",
          },
          ""
        );
        deleteBtn.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M7 2.75A.75.75 0 0 1 7.75 2h4.5a.75.75 0 0 1 .75.75V4h3a.75.75 0 0 1 0 1.5h-.72l-.66 10.02A2.25 2.25 0 0 1 12.38 17.5H7.62a2.25 2.25 0 0 1-2.24-1.98L4.72 5.5H4a.75.75 0 0 1 0-1.5h3V2.75ZM8.5 4h3V3.5h-3V4Zm.75 4.25a.75.75 0 0 0-1.5 0v6a.75.75 0 0 0 1.5 0v-6Zm3 0a.75.75 0 0 0-1.5 0v6a.75.75 0 0 0 1.5 0v-6Z" clip-rule="evenodd"/></svg>';

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        row.appendChild(avatarButton);
        row.appendChild(actions);
        list.appendChild(row);
      });
    }

    container.appendChild(list);
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
