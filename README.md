# µce-Dragonbinder

Use Custom Elements defined with [µce](https://github.com/WebReflection/uce) connected to a [Dragonbinder](https://github.com/Masquerade-Circus/dragonbinder) store for state management.

![Travis (.com)](https://img.shields.io/travis/com/Dorilama/uce-dragonbinder) ![Coveralls github](https://img.shields.io/coveralls/github/Dorilama/uce-dragonbinder) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/@dorilama/uce-dragonbinder) ![David](https://img.shields.io/david/Dorilama/uce-dragonbinder)

---

## Disclaimer

This is a demo project for learning purposes.

## Use

Live example [here](https://codepen.io/dorilama/pen/bGVXyqP)

```javascript
/* import the libraries*/
import "https://unpkg.com/uce?module";
import "https://unpkg.com/dragonbinder";
import { getConnectedObj } from "https://unpkg.com/@dorilama/uce-dragonbinder?module";

/* Create a store with dragonbinder. */
const store = new Dragonbinder({
  state: {
    count: 0,
    history: [],
    otherCount: 0,
  },
  mutations: {
    add(state, n) {
      state.count += n;
      state.history = [...state.history, n];
    },
    otherAdd(state) {
      state.otherCount += 1;
    },
  },
  actions: {
    asyncAdd(store, n) {
      return new Promise((resolve) => {
        setTimeout(() => {
          store.commit("add", n);
          resolve();
        }, 500);
      });
    },
  },
  getters: {
    average(state) {
      const { length } = state.history;
      const avg = state.history.reduce((a, c) => a + c / length, 0);
      return Math.round((avg + Number.EPSILON) * 100) / 100;
    },
  },
});

/* Create the Object Literal with properties and methods to extend your Custom Element */
const connectedObj = getConnectedObj(store);

/* Use µce to create your Custom Element and spread connectedObj in it. */
/* It is safe to use the object spread because there are no setters or getters. */
customElements.whenDefined("uce-lib").then(() => {
  const { define, render, html } = customElements.get("uce-lib");
  define("my-counter", {
    /*
     * Spreading connectedObj add the fololowing properties:
     *  - store: the Dragonbinder store.
     *  - state: the store.state
     *  - getters: the store.getters
     *  and the following methods:
     *  -commit: to commit mutations to the store
     *  - dispatch: to dispatch actions to the store
     *  - subscribeToStore: to add a listener to store 'set' events.
     *                      This methods also add an unsubscribeToStore
     *                      method to remove the listener.
     *                      Default will render the component to all 'set' events.
     *                      If you specify a 'data-render-on' attribute,
     *                      as a string of comma-separated values,
     *                      it will render only when the 'set' event is triggered
     *                      by state props matching with values.
     *  - connected: as per µce docs.
     *               the provided connected method calls subscribeToStore
     *  - disconnected: as per µce docs.
     *                  the provided connected method calls unsubscribeToStore
     */
    ...connectedObj,
    init() {
      this.render();
    },
    render() {
      this.html`<p>${this.state.count}</p> <p>${this.getters.average}</p>
              <button onclick=${() => {
                this.commit("add", 1);
              }}>add 1</button>
              <button onclick=${() => {
                this.dispatch("asyncAdd", 19);
              }}>asyncAdd 19</button>`;
    },
  });
  define("my-othercounter", {
    ...connectedObj,
    init() {
      this.render();
    },
    render() {
      this.html`<p>${this.state.count}</p><p>${this.state.otherCount}</p> 
              <button onclick=${() => {
                this.commit("otherAdd");
              }}>otherAdd 1</button>`;
    },
    /* If you overwrite the connected and disconnected method
     *  remember to subscribe and unsubscribe to the store.
     */
    connected() {
      console.log("connected");
      /* subscribe to the store */
      this.subscribeToStore();
    },
    disconnected() {
      console.log("disconnected");
      /* unsubscribe to the store */
      this.unsubscribeToStore();
    },
  });
});
```

```html
<!-- Then in your html -->
<!-- This will render on every 'set' event -->
<my-counter></my-counter>
<!-- This will render only when store.state.otherCount and store.state.somestuff will change -->
<my-othercounter data-render-on="otherCount,somestuff"></my-othercounter>
```
