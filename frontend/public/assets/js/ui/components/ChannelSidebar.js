import { createElement } from "../../utils/dom.js";
import { Button } from "../components/Button.js";

/**
 * ChannelSidebar component - Shows list of channels
 */
export class ChannelSidebar {
  constructor(options = {}) {
    this.element = null;
    this.options = {
      channels: [],
      onChannelSelect: null,
      onCreateChannel: null,
      selectedChannelId: null,
      ...options,
    };

    this.render();
  }

  render() {
    const container = createElement("div", {
      className: "h-full flex flex-col bg-gray-50",
    });

    // Header
    const header = createElement("div", {
      className: "p-4 border-b border-gray-200",
    });

    const headerContent = createElement("div", {
      className: "flex items-center justify-between",
    });

    const title = createElement("h2", {
      className: "text-lg font-semibold text-gray-900",
    }, "Channels");

    const createButton = new Button({
      text: "+",
      variant: "secondary",
      size: "sm",
      onClick: () => this.options.onCreateChannel && this.options.onCreateChannel(),
    });

    headerContent.appendChild(title);
    headerContent.appendChild(createButton.getElement());
    header.appendChild(headerContent);
    container.appendChild(header);

    // Channels list
    const channelsContainer = createElement("div", {
      className: "flex-1 overflow-y-auto",
    });

    // Group channels by type
    const publicChannels = this.options.channels.filter(c => c.type === 'public');
    const privateChannels = this.options.channels.filter(c => c.type === 'private');

    // Public channels section
    if (publicChannels.length > 0) {
      const publicSection = this.createChannelSection("Public Channels", publicChannels, "#");
      channelsContainer.appendChild(publicSection);
    }

    // Private channels section
    if (privateChannels.length > 0) {
      const privateSection = this.createChannelSection("Private Channels", privateChannels, "🔒");
      channelsContainer.appendChild(privateSection);
    }

    // Empty state
    if (this.options.channels.length === 0) {
      const emptyState = createElement("div", {
        className: "p-4 text-center text-gray-500",
      }, "No channels yet. Create your first channel!");
      channelsContainer.appendChild(emptyState);
    }

    container.appendChild(channelsContainer);

    this.element = container;
    return container;
  }

  createChannelSection(title, channels, icon) {
    const section = createElement("div", {
      className: "mb-4",
    });

    // Section header
    const sectionHeader = createElement("div", {
      className: "px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide",
    }, title);
    section.appendChild(sectionHeader);

    // Channel list
    const channelList = createElement("div", {
      className: "space-y-1",
    });

    channels.forEach(channel => {
      const channelItem = this.createChannelItem(channel, icon);
      channelList.appendChild(channelItem);
    });

    section.appendChild(channelList);
    return section;
  }

  createChannelItem(channel, icon) {
    const isSelected = this.options.selectedChannelId === channel.id;

    const item = createElement("div", {
      className: `px-4 py-2 mx-2 rounded-md cursor-pointer transition-colors ${
        isSelected
          ? 'bg-blue-100 text-blue-900'
          : 'text-gray-700 hover:bg-gray-100'
      }`,
      onclick: () => this.options.onChannelSelect && this.options.onChannelSelect(channel),
    });

    const content = createElement("div", {
      className: "flex items-center space-x-2",
    });

    // Channel icon
    const channelIcon = createElement("span", {
      className: "text-sm",
    }, icon);

    // Channel name
    const channelName = createElement("span", {
      className: "text-sm font-medium truncate",
    }, channel.name);

    // Member count (if available)
    let memberCount = null;
    if (channel.memberCount) {
      memberCount = createElement("span", {
        className: "text-xs text-gray-500 ml-auto",
      }, `${channel.memberCount}`);
    }

    content.appendChild(channelIcon);
    content.appendChild(channelName);
    if (memberCount) {
      content.appendChild(memberCount);
    }

    item.appendChild(content);
    return item;
  }

  updateChannels(channels) {
    this.options.channels = channels;
    const newElement = this.render();
    if (this.element.parentElement) {
      this.element.parentElement.replaceChild(newElement, this.element);
    }
    this.element = newElement;
  }

  setSelectedChannel(channelId) {
    this.options.selectedChannelId = channelId;
    const newElement = this.render();
    if (this.element.parentElement) {
      this.element.parentElement.replaceChild(newElement, this.element);
    }
    this.element = newElement;
  }

  getElement() {
    return this.element;
  }
}