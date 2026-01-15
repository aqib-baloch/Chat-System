import { createElement } from "../../utils/dom.js";
import { Button } from "./Button.js";
import { Input } from "./Input.js";

export class ChatArea {
  constructor(options = {}) {
    this.element = null;
    this.options = {
      channel: null,
      messages: [],
      onSendMessage: null,
      currentUser: null,
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
      const headerContent = createElement("div", {
        className: "flex items-center justify-between",
      });

      const channelInfo = createElement("div", {
        className: "flex items-center space-x-3",
      });

      const icon = createElement(
        "span",
        {
          className: "text-lg",
        },
        this.options.channel.type === "public" ? "#" : "🔒"
      );

      const name = createElement(
        "h1",
        {
          className: "text-xl font-semibold text-gray-900",
        },
        this.options.channel.name
      );

      const memberCount = createElement(
        "span",
        {
          className: "text-sm text-gray-500",
        },
        `${this.options.channel.memberCount || 0} members`
      );

      channelInfo.appendChild(icon);
      channelInfo.appendChild(name);
      channelInfo.appendChild(memberCount);

      const actions = createElement("div", {
        className: "flex items-center space-x-2",
      });

      headerContent.appendChild(channelInfo);
      headerContent.appendChild(actions);
      header.appendChild(headerContent);
    } else {
      header.innerHTML = `
        <div class="text-center">
          <h1 class="text-xl font-semibold text-gray-900">Select a channel</h1>
        </div>
      `;
    }

    container.appendChild(header);

    const messagesContainer = createElement("div", {
      className: "flex-1 overflow-y-auto p-4 space-y-4",
    });

    if (this.options.messages.length > 0) {
      this.options.messages.forEach((message) => {
        const messageElement = this.createMessageElement(message);
        messagesContainer.appendChild(messageElement);
      });
    } else if (this.options.channel) {
      const emptyState = createElement("div", {
        className: "flex items-center justify-center h-full text-gray-500",
      });
      emptyState.innerHTML = `
        <div class="text-center">
          <p class="text-lg mb-2">👋</p>
          <p>Welcome to #${this.options.channel.name}</p>
          <p class="text-sm">This is the start of the channel.</p>
        </div>
      `;
      messagesContainer.appendChild(emptyState);
    }

    container.appendChild(messagesContainer);

    // Message input area
    const inputArea = createElement("div", {
      className: "p-4 border-t border-gray-200 bg-white",
    });

    const inputContainer = createElement("div", {
      className: "flex items-end space-x-3",
    });

    // Message input
    const messageInput = new Input({
      type: "textarea",
      placeholder: `Message #${this.options.channel?.name || "channel"}`,
      className: "flex-1 resize-none",
      rows: 1,
      onKeyDown: (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage();
        }
      },
    });

    // Send button
    const sendButton = new Button({
      text: "Send",
      variant: "primary",
      size: "sm",
      onClick: () => this.handleSendMessage(),
    });

    inputContainer.appendChild(messageInput.getElement());
    inputContainer.appendChild(sendButton.getElement());
    inputArea.appendChild(inputContainer);
    container.appendChild(inputArea);

    this.element = container;
    this.messageInput = messageInput;
    return container;
  }

  createMessageElement(message) {
    const messageContainer = createElement("div", {
      className: "flex space-x-3",
    });

    // User avatar
    const avatar = createElement("div", {
      className:
        "w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0",
    });
    avatar.textContent = message.user.charAt(0).toUpperCase();

    // Message content
    const contentContainer = createElement("div", {
      className: "flex-1 min-w-0",
    });

    const header = createElement("div", {
      className: "flex items-baseline space-x-2 mb-1",
    });

    const userName = createElement(
      "span",
      {
        className: "font-medium text-gray-900",
      },
      message.user
    );

    const timestamp = createElement(
      "span",
      {
        className: "text-xs text-gray-500",
      },
      message.timestamp
    );

    header.appendChild(userName);
    header.appendChild(timestamp);

    const messageText = createElement(
      "div",
      {
        className: "text-gray-700 break-words",
      },
      message.content
    );

    contentContainer.appendChild(header);
    contentContainer.appendChild(messageText);

    messageContainer.appendChild(avatar);
    messageContainer.appendChild(contentContainer);

    return messageContainer;
  }

  handleSendMessage() {
    const input = this.messageInput.getElement().querySelector("textarea");
    const content = input.value.trim();

    if (content && this.options.onSendMessage) {
      this.options.onSendMessage({
        content,
        channelId: this.options.channel?.id,
        user: this.options.currentUser?.name || "You",
        timestamp: new Date().toLocaleTimeString(),
      });

      // Clear input
      input.value = "";
    }
  }

  addMessage(message) {
    this.options.messages.push(message);
    const newElement = this.render();
    if (this.element.parentElement) {
      this.element.parentElement.replaceChild(newElement, this.element);
    }
    this.element = newElement;

    // Scroll to bottom
    setTimeout(() => {
      const messagesContainer = this.element.querySelector(".overflow-y-auto");
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 0);
  }

  setChannel(channel) {
    this.options.channel = channel;
    this.options.messages = []; // Clear messages when switching channels
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
