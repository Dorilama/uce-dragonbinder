"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getConnectedObj = void 0;

const getConnectedObj = store => {
  const {
    state,
    getters
  } = store;
  return {
    store,
    state,
    getters,

    commit(mutationName, ...mutationArgs) {
      store.commit(mutationName, ...mutationArgs);
    },

    dispatch(actionName, ...actionArgs) {
      return new Promise(resolve => {
        store.dispatch(actionName, ...actionArgs).then(() => resolve());
      });
    },

    subscribeToStore() {
      const {
        renderOn
      } = this.dataset;

      if (renderOn) {
        const props = renderOn.split(",");
        this.unsubscribeToStore = store.on("set", (currentStore, prop) => {
          if (props.includes(prop)) {
            this.render();
          }
        });
      } else {
        this.unsubscribeToStore = store.on("set", () => this.render());
      }
    },

    connected() {
      this.subscribeToStore();
    },

    disconnected() {
      this.unsubscribeToStore();
    }

  };
};

exports.getConnectedObj = getConnectedObj;