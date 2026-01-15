export const state = {
  user: null,

  isLoading: false,
  notifications: [],

  workspaces: [],
  currentWorkspace: null,
  channels: [],
  currentChannel: null,
  messages: [],
  onlineUsers: [],

  get isAuthenticated() {
    return this.user !== null;
  },

  get userInitials() {
    return this.user
      ? this.user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "";
  },

  setUser(user) {
    this.user = user;
    this.persistState();
  },

  clearUser() {
    this.user = null;
    this.persistState();
  },

  setLoading(loading) {
    this.isLoading = loading;
  },

  addNotification(notification) {
    this.notifications.push({
      id: Date.now(),
      ...notification,
    });
  },

  removeNotification(id) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
  },

  setWorkspaces(workspaces) {
    this.workspaces = workspaces;
  },

  setCurrentWorkspace(workspace) {
    this.currentWorkspace = workspace;
  },

  setChannels(channels) {
    this.channels = channels;
  },

  setCurrentChannel(channel) {
    this.currentChannel = channel;
  },

  addMessage(message) {
    this.messages.push(message);
  },

  setMessages(messages) {
    this.messages = messages;
  },

  setOnlineUsers(users) {
    this.onlineUsers = users;
  },

  persistState() {
    try {
      const persistableState = {
        user: this.user,
      };
      localStorage.setItem("chat_app_state", JSON.stringify(persistableState));
    } catch (error) {
      console.warn("Failed to persist state:", error);
    }
  },

  restoreState() {
    try {
      const savedState = localStorage.getItem("chat_app_state");
      if (savedState) {
        const parsed = JSON.parse(savedState);
        Object.assign(this, parsed);
      }
    } catch (error) {
      console.warn("Failed to restore state:", error);
    }
  },
};

state.restoreState();
