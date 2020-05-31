# µce-Dragonbinder

Use Custom Elements defined with [µce](https://github.com/WebReflection/uce) connected to a [Dragonbinder](https://github.com/Masquerade-Circus/dragonbinder) store for state management.

---

## Use

```javascript
// Import the libraries.
import "https://unpkg.com/uce?module";
import "https://unpkg.com/dragonbinder";
import { connectStore } from "https://unpkg.com/@dorilama/uce-dragonbinder?module";

// Create a store with dragonbinder.
const store = new Dragonbinder({
  state: {
    count: 0,
    history: [],
  },
  mutations: {
    add(state, n) {
      state.count += n;
      state.history = [...state.history, n];
    },
    reset(state) {
      state.count = 0;
      state.history = [];
    },
  },
  actions: {
    asyncAdd(store, n) {
      return new Promise((resolve) => {
        setTimeout(() => {
          store.commit("add", n);
          resolve();
        }, 1000);
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

// Define a Custom Element connected to the store.
connectStore(store);

customElements.whenDefined("uce-lib").then(() => {
  const { define } = customElements.get("uce-lib");
  define("my-counter", {
    // Extend the connected Custom Element.
    extends: "store-provider",
    init() {
      /*
       * On init call the method provide to subscribe to the store,
       * optionally passing an array of state props to watch.
       * Default is to watch every state prop.
       */
      this.provide();
      /*
       * Now on every Dragonbinder 'set' event
       * your component will render if and observed prop changed.
       * Keep in mind that because it's subscribed to 'set' event
       * you may have more than one render per 'commit'.
       */
      this.render();
    },
    render() {
      // you can now access the state props, the getters, the commit and dispatch methods.
      this.html`
      <p>Count is: ${this.count}</p>
      <p>The average operation is: ${this.getters.average}</p>
      <button onclick=${() => this.commit("add", 1)}>add 1</button>
      <button onclick=${() => this.commit("add", 10)}>add 10</button>
      <button onclick=${() => this.commit("add", -12)}>subtract 12</button>
      <button onclick=${() => this.dispatch("asyncAdd", 1)}>async add 1</button>
      <button onclick=${() => this.commit("reset")}>reset</button>`;
    },
  });
});
```

---

## Api

After you create the store

```javascript
connectStore(store, {
  tag: "store-provider", // the connected Custom Element tag name
  compare: (a, b) => a === b, // the function used to compare the previous state with the current one
});
```
