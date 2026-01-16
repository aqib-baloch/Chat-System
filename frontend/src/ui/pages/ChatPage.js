import { createElement } from "../../utils/dom.js";
import { AppShell } from "../layouts/AppShell.js";
import { ChatLayout } from "../layouts/ChatLayout.js";
import { WorkspaceSidebar } from "../components/WorkspaceSidebar.js";
import { ChannelSidebar } from "../components/ChannelSidebar.js";
import { ChatArea } from "../components/ChatArea.js";
import { Modal } from "../components/Modal.js";
import { Input } from "../components/Input.js";
import { Button } from "../components/Button.js";
import { showError, showSuccess, showLoading, hideLoading } from "../../utils/notify.js";
import { workspacesApi } from "../../services/api/workspaces.api.js";
import { channelsApi } from "../../services/api/channels.api.js";
import { state } from "../../app/state.js";

export class ChatPage {
  constructor(options = {}) {
    this.element = null;
    this.options = {
      user: null,
      onLogout: null,
      ...options,
    };

    this.workspaces = [];
    this.channels = [];
    this.selectedWorkspace = state.currentWorkspace;
    this.selectedChannel = state.currentChannel;

    this.render();
    this.loadInitialData();
  }

  render() {
    const appShell = new AppShell({
      user: this.options.user,
      onLogout: this.options.onLogout,
      fluid: true,
      content: this.createChatContent(),
    });

    this.element = appShell.getElement();
    return this.element;
  }

  createChatContent() {
    this.workspaceSidebar = new WorkspaceSidebar({
      workspaces: this.workspaces,
      selectedWorkspaceId: this.selectedWorkspace?.id || null,
      onSelect: (ws) => this.selectWorkspace(ws),
      onCreate: () => this.openCreateWorkspaceModal(),
      onEdit: (ws) => this.openEditWorkspaceModal(ws),
      onDelete: (ws) => this.openDeleteWorkspaceModal(ws),
    });

    this.channelSidebar = new ChannelSidebar({
      channels: this.channels,
      selectedChannelId: this.selectedChannel?.id || null,
      disabled: !this.selectedWorkspace,
      onSelect: (ch) => this.selectChannel(ch),
      onCreate: () => this.openCreateChannelModal(),
      onEdit: (ch) => this.openEditChannelModal(ch),
      onDelete: (ch) => this.openDeleteChannelModal(ch),
    });

    this.chatArea = new ChatArea({
      workspace: this.selectedWorkspace,
      channel: this.selectedChannel,
    });

    const layout = new ChatLayout({
      leftSidebar: this.workspaceSidebar.getElement(),
      rightSidebar: this.channelSidebar.getElement(),
      mainContent: this.chatArea.getElement(),
    });

    return layout.getElement();
  }

  async loadInitialData() {
    showLoading("Loading workspaces...");
    try {
      const result = await workspacesApi.list();
      this.workspaces = result.workspaces || [];
      state.setWorkspaces(this.workspaces);
      this.updateUI();

      if (!this.selectedWorkspace && this.workspaces.length > 0) {
        this.selectWorkspace(this.workspaces[0]);
      } else {
        this.updateUI();
      }
    } catch (e) {
      showError(e.response?.data?.error || "Failed to load workspaces");
      this.updateUI();
    } finally {
      hideLoading();
    }
  }

  async selectWorkspace(workspace) {
    this.selectedWorkspace = workspace;
    this.selectedChannel = null;
    state.setCurrentWorkspace(workspace);
    state.setCurrentChannel(null);
    this.channels = [];
    this.updateUI();

    showLoading("Loading channels...");
    try {
      const result = await channelsApi.list(workspace.id);
      this.channels = result.channels || [];
      state.setChannels(this.channels);
      this.updateUI();
    } catch (e) {
      showError(e.response?.data?.error || "Failed to load channels");
      this.updateUI();
    } finally {
      hideLoading();
    }
  }

  selectChannel(channel) {
    this.selectedChannel = channel;
    state.setCurrentChannel(channel);
    this.updateUI();
  }

  updateUI() {
    if (!this.workspaceSidebar || !this.channelSidebar || !this.chatArea) {
      return;
    }

    this.workspaceSidebar.update({
      workspaces: this.workspaces,
      selectedWorkspaceId: this.selectedWorkspace?.id || null,
    });

    this.channelSidebar.update({
      channels: this.channels,
      selectedChannelId: this.selectedChannel?.id || null,
      disabled: !this.selectedWorkspace,
    });

    this.chatArea.update({
      workspace: this.selectedWorkspace,
      channel: this.selectedChannel,
    });
  }

  openCreateWorkspaceModal() {
    const nameInput = new Input({
      label: "Workspace name",
      placeholder: "e.g. CM IT Interns",
      required: true,
    });

    const description = createElement("textarea", {
      className: "input-field min-h-[96px]",
      placeholder: "What is this workspace for?",
    });

    const form = createElement("form", { className: "space-y-4" });
    form.appendChild(nameInput.getElement());

    const descWrap = createElement("div", {});
    descWrap.appendChild(
      createElement(
        "label",
        { className: "block text-sm font-medium text-gray-700 mb-1" },
        "Description"
      )
    );
    descWrap.appendChild(description);
    form.appendChild(descWrap);

    const modal = new Modal({
      title: "Create workspace",
      content: form,
      footer: this.createModalFooter({
        onCancel: () => modal.close(),
        onSubmit: async () => {
          const name = nameInput.getValue().trim();
          const desc = description.value.trim();
          if (!name || !desc) {
            showError("Name and description are required");
            return;
          }

          const loading = showLoading("Creating workspace...");
          try {
            const result = await workspacesApi.create({
              name,
              description: desc,
            });
            const ws = result.workspace;
            if (ws) {
              showSuccess("Workspace created");
              this.workspaces = [ws, ...this.workspaces];
              state.setWorkspaces(this.workspaces);
              this.updateUI();
              this.selectWorkspace(ws);
            }
            modal.close();
          } catch (e) {
            showError(e.response?.data?.error || "Failed to create workspace");
          } finally {
            hideLoading();
          }
        },
      }),
      onClose: () => {},
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      modal.modal?.querySelector("button[data-submit='1']")?.click();
    });

    modal.show();
  }

  openEditWorkspaceModal(workspace) {
    const nameInput = new Input({
      label: "Workspace name",
      value: workspace.name,
      required: true,
    });

    const description = createElement("textarea", {
      className: "input-field min-h-[96px]",
    });
    description.value = workspace.description || "";

    const form = createElement("form", { className: "space-y-4" });
    form.appendChild(nameInput.getElement());

    const descWrap = createElement("div", {});
    descWrap.appendChild(
      createElement(
        "label",
        { className: "block text-sm font-medium text-gray-700 mb-1" },
        "Description"
      )
    );
    descWrap.appendChild(description);
    form.appendChild(descWrap);

    const modal = new Modal({
      title: "Edit workspace",
      content: form,
      footer: this.createModalFooter({
        submitText: "Save",
        onCancel: () => modal.close(),
        onSubmit: async () => {
          const name = nameInput.getValue().trim();
          const desc = description.value.trim();
          if (!name || !desc) {
            showError("Name and description are required");
            return;
          }

          showLoading("Saving workspace...");
          try {
            const result = await workspacesApi.update(workspace.id, {
              name,
              description: desc,
            });

            const updated = result.workspace;
            if (updated) {
              this.workspaces = this.workspaces.map((w) =>
                w.id === workspace.id ? updated : w
              );
              state.setWorkspaces(this.workspaces);

              if (this.selectedWorkspace?.id === workspace.id) {
                this.selectedWorkspace = updated;
                state.setCurrentWorkspace(updated);
              }

              showSuccess("Workspace updated");
              this.updateUI();
            }

            modal.close();
          } catch (e) {
            showError(e.response?.data?.error || "Failed to update workspace");
          } finally {
            hideLoading();
          }
        },
      }),
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      modal.modal?.querySelector("button[data-submit='1']")?.click();
    });

    modal.show();
  }

  openDeleteWorkspaceModal(workspace) {
    const content = createElement("div", { className: "space-y-2" });
    content.appendChild(
      createElement(
        "p",
        { className: "text-sm text-gray-700" },
        "This will permanently delete the workspace and its channels."
      )
    );
    content.appendChild(
      createElement(
        "p",
        { className: "text-sm font-medium text-gray-900" },
        workspace.name
      )
    );

    const footer = createElement("div", {
      className: "flex items-center justify-end gap-3",
    });

    const modal = new Modal({
      title: "Delete workspace?",
      content,
      footer,
    });

    const cancel = new Button({
      text: "Cancel",
      variant: "secondary",
      onClick: () => modal.close(),
    });

    const confirm = new Button({
      text: "Delete",
      variant: "danger",
      onClick: async () => {
        showLoading("Deleting workspace...");
        try {
          await workspacesApi.delete(workspace.id);
          showSuccess("Workspace deleted");

          this.workspaces = this.workspaces.filter((w) => w.id !== workspace.id);
          state.setWorkspaces(this.workspaces);

          const wasSelected = this.selectedWorkspace?.id === workspace.id;
          if (wasSelected) {
            this.selectedWorkspace = null;
            this.selectedChannel = null;
            this.channels = [];
            state.setCurrentWorkspace(null);
            state.setCurrentChannel(null);
            state.setChannels([]);

            if (this.workspaces.length > 0) {
              this.selectWorkspace(this.workspaces[0]);
            }
          }

          this.updateUI();
          modal.close();
        } catch (e) {
          showError(e.response?.data?.error || "Failed to delete workspace");
        } finally {
          hideLoading();
        }
      },
    });

    footer.appendChild(cancel.getElement());
    footer.appendChild(confirm.getElement());
    modal.show();
  }

  openCreateChannelModal() {
    if (!this.selectedWorkspace) {
      showError("Select a workspace first");
      return;
    }

    const nameInput = new Input({
      label: "Channel name",
      placeholder: "e.g. Notify Tasks",
      required: true,
    });

    const description = createElement("textarea", {
      className: "input-field min-h-[96px]",
      placeholder: "What is this channel for?",
    });

    const visibility = createElement("select", {
      className: "input-field",
    });
    visibility.appendChild(createElement("option", { value: "public" }, "Public"));
    visibility.appendChild(createElement("option", { value: "private" }, "Private"));

    const form = createElement("form", { className: "space-y-4" });
    form.appendChild(nameInput.getElement());

    const descWrap = createElement("div", {});
    descWrap.appendChild(
      createElement(
        "label",
        { className: "block text-sm font-medium text-gray-700 mb-1" },
        "Description"
      )
    );
    descWrap.appendChild(description);
    form.appendChild(descWrap);

    const visWrap = createElement("div", {});
    visWrap.appendChild(
      createElement(
        "label",
        { className: "block text-sm font-medium text-gray-700 mb-1" },
        "Visibility"
      )
    );
    visWrap.appendChild(visibility);
    form.appendChild(visWrap);

    const modal = new Modal({
      title: "Create channel",
      content: form,
      footer: this.createModalFooter({
        onCancel: () => modal.close(),
        onSubmit: async () => {
          const name = nameInput.getValue().trim();
          const desc = description.value.trim();
          const vis = visibility.value;
          if (!name || !desc) {
            showError("Name and description are required");
            return;
          }

          const loading = showLoading("Creating channel...");
          try {
            const result = await channelsApi.create(this.selectedWorkspace.id, {
              name,
              description: desc,
              visibility: vis,
            });
            const ch = result.channel;
            if (ch) {
              showSuccess("Channel created");
              this.channels = [ch, ...this.channels];
              state.setChannels(this.channels);
              this.updateUI();
              this.selectChannel(ch);
            }
            modal.close();
          } catch (e) {
            showError(e.response?.data?.error || "Failed to create channel");
          } finally {
            hideLoading();
          }
        },
      }),
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      modal.modal?.querySelector("button[data-submit='1']")?.click();
    });

    modal.show();
  }

  openEditChannelModal(channel) {
    if (!this.selectedWorkspace) {
      showError("Select a workspace first");
      return;
    }

    const nameInput = new Input({
      label: "Channel name",
      value: channel.name,
      required: true,
    });

    const description = createElement("textarea", {
      className: "input-field min-h-[96px]",
    });
    description.value = channel.description || "";

    const form = createElement("form", { className: "space-y-4" });
    form.appendChild(nameInput.getElement());

    const descWrap = createElement("div", {});
    descWrap.appendChild(
      createElement(
        "label",
        { className: "block text-sm font-medium text-gray-700 mb-1" },
        "Description"
      )
    );
    descWrap.appendChild(description);
    form.appendChild(descWrap);

    const modal = new Modal({
      title: "Edit channel",
      content: form,
      footer: this.createModalFooter({
        submitText: "Save",
        onCancel: () => modal.close(),
        onSubmit: async () => {
          const name = nameInput.getValue().trim();
          const desc = description.value.trim();
          if (!name || !desc) {
            showError("Name and description are required");
            return;
          }

          showLoading("Saving channel...");
          try {
            const result = await channelsApi.update(
              this.selectedWorkspace.id,
              channel.id,
              { name, description: desc }
            );

            const updated = result.channel;
            if (updated) {
              this.channels = this.channels.map((c) =>
                c.id === channel.id ? updated : c
              );
              state.setChannels(this.channels);

              if (this.selectedChannel?.id === channel.id) {
                this.selectedChannel = updated;
                state.setCurrentChannel(updated);
              }

              showSuccess("Channel updated");
              this.updateUI();
            }

            modal.close();
          } catch (e) {
            showError(e.response?.data?.error || "Failed to update channel");
          } finally {
            hideLoading();
          }
        },
      }),
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      modal.modal?.querySelector("button[data-submit='1']")?.click();
    });

    modal.show();
  }

  openDeleteChannelModal(channel) {
    if (!this.selectedWorkspace) {
      showError("Select a workspace first");
      return;
    }

    const content = createElement("div", { className: "space-y-2" });
    content.appendChild(
      createElement(
        "p",
        { className: "text-sm text-gray-700" },
        "This will permanently delete the channel."
      )
    );
    content.appendChild(
      createElement(
        "p",
        { className: "text-sm font-medium text-gray-900" },
        channel.name
      )
    );

    const footer = createElement("div", {
      className: "flex items-center justify-end gap-3",
    });

    const modal = new Modal({
      title: "Delete channel?",
      content,
      footer,
    });

    const cancel = new Button({
      text: "Cancel",
      variant: "secondary",
      onClick: () => modal.close(),
    });

    const confirm = new Button({
      text: "Delete",
      variant: "danger",
      onClick: async () => {
        showLoading("Deleting channel...");
        try {
          await channelsApi.delete(this.selectedWorkspace.id, channel.id);
          showSuccess("Channel deleted");

          this.channels = this.channels.filter((c) => c.id !== channel.id);
          state.setChannels(this.channels);

          if (this.selectedChannel?.id === channel.id) {
            this.selectedChannel = null;
            state.setCurrentChannel(null);
          }

          this.updateUI();
          modal.close();
        } catch (e) {
          showError(e.response?.data?.error || "Failed to delete channel");
        } finally {
          hideLoading();
        }
      },
    });

    footer.appendChild(cancel.getElement());
    footer.appendChild(confirm.getElement());
    modal.show();
  }

  createModalFooter({ onCancel, onSubmit, submitText = "Create" }) {
    const footer = createElement("div", {
      className: "flex items-center justify-end gap-3",
    });

    const cancel = new Button({
      text: "Cancel",
      variant: "secondary",
      onClick: onCancel,
    });
    const submit = new Button({
      text: submitText,
      variant: "primary",
      onClick: onSubmit,
    });

    submit.getElement().setAttribute("data-submit", "1");

    footer.appendChild(cancel.getElement());
    footer.appendChild(submit.getElement());
    return footer;
  }

  setUser(user) {
    const oldElement = this.element;
    this.options.user = user;
    const newElement = this.render();
    if (oldElement?.parentElement) {
      oldElement.parentElement.replaceChild(newElement, oldElement);
    }
    this.element = newElement;
  }

  getElement() {
    return this.element;
  }

  destroy() {}
}
