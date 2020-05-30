"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connectStore = void 0;

const connectStore = (store, {
  tag = "store-provider",
  compare = (a, b) => a === b
}) => {
  customElements.whenDefined("uce-lib").then(() => {
    const {
      define
    } = customElements.get("uce-lib");
    define(tag, {
      provide(observedProps = Object.keys(store.state)) {
        this.observedProps = observedProps;
        this.unsubscribeFromStore = store.on("set", (store, prop, newVal, oldVal) => {
          if (this.observedProps.includes(prop) && !compare(oldVal, newVal)) {
            this.render();
          }
        });
        observedProps.forEach(prop => {
          Object.defineProperty(this, prop, {
            get() {
              return store.state[prop];
            },

            set(val) {
              throw `You need to commit an action to change the value of ${prop} in the state. E.g. this.commit('mutationName',args)`;
            }

          });
        });
      },

      disconnected() {
        this.unsubscribeFromStore();
      },

      commit(mutationName, ...mutationArgs) {
        store.commit(mutationName, ...mutationArgs);
      },

      dispatch(actionName, ...actionArgs) {
        store.dispatch(actionName, ...actionArgs);
      },

      get getters() {
        return store.getters;
      },

      set getters(val) {
        throw `Getters can't be set. Define them in the store.`;
      }

    });
  });
};

exports.connectStore = connectStore;