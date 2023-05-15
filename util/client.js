let clientInstance = null;

module.exports = {
    getClientInstance() {
      return clientInstance;
    },
    setClientInstance(client) {
      clientInstance = client;
    }
  };