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
          className: `w-full px-3 py-2 rounded-md transition-colors flex items-start gap-3 ${
            isSelected
              ? "bg-primary-50 text-primary-800"
              : "hover:bg-gray-50 text-gray-700"
          }`,
        });

        const selectButton = createElement("button", {
          className: "flex-1 min-w-0 text-left",
          type: "button",
          onclick: () => this.options.onSelect && this.options.onSelect(ws),
        });

        const name = createElement(
          "div",
          { className: "text-sm font-medium truncate" },
          ws.name
        );
        const desc = createElement(
          "div",
          { className: "text-xs text-gray-500 truncate mt-0.5" },
          ws.description || ""
        );

        selectButton.appendChild(name);
        selectButton.appendChild(desc);

        const actions = createElement("div", {
          className: "flex items-center gap-2 flex-shrink-0 pt-0.5",
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
              this.options.onEdit && this.options.onEdit(ws);
            },
            title: "Edit workspace",
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
              this.options.onDelete && this.options.onDelete(ws);
            },
            title: "Delete workspace",
          },
          "Delete"
        );

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        row.appendChild(selectButton);
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
