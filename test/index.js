require("basichtml").init();
require("uce");
const Dragonbinder = require("dragonbinder");

const { connectStore } = require("../cjs");

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
  },
  actions: {
    asyncAdd(store, n) {
      return new Promise((resolve) => {
        setTimeout(() => {
          store.commit("add", n);
          resolve();
        }, 10);
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

connectStore(store, {});
customElements.whenDefined("uce-lib").then(() => {
  const { define, render, html } = customElements.get("uce-lib");
  let add = {};
  let asyncAdd = {};
  let count = {};
  let avg = {};
  let badSetState = {};
  let badSetGetters = {};

  define("my-counter", {
    extends: "store-provider",
    init() {
      this.provide();
      this.render();
    },
    render() {
      this.html`<p ref=${count}>${this.count}</p> <p ref=${avg}>${
        this.getters.average
      }</p>
      <button ref=${add} onclick=${() => this.commit("add", 1)}>add 1</button>
      <button ref=${asyncAdd} onclick=${() =>
        this.dispatch("asyncAdd", 19)}>asyncAdd 19</button>
        <button ref=${badSetState} onclick=${() => {
        let hasThrown = false;
        try {
          this.count = 34;
        } catch (e) {
          hasThrown = true;
        }
        console.assert(hasThrown, "directly setting the state hasn't thrown");
      }}>wrong set state</button>
      <button ref=${badSetGetters} onclick=${() => {
        let hasThrown = false;
        try {
          this.getters = 34;
        } catch (e) {
          hasThrown = true;
        }
        console.assert(hasThrown, "directly setting the getters hasn't thrown");
      }}>wrong set getters</button>`;
    },
  });
  define("only-count", {
    extends: "store-provider",
    init() {
      this.provide(["count"]);
      this.render();
    },
    render() {},
  });
  render(
    document.body,
    html`<my-counter></my-counter> <only-count></only-count>`
  );
  console.assert(
    count.current.textContent === "0",
    `wrong initial value count:${count.current.textContent}`
  );
  add.current.click();
  console.assert(
    count.current.textContent === "1",
    `wrong count after add 1:${count.current.textContent}`
  );
  badSetState.current.click();
  badSetGetters.current.click();
  asyncAdd.current.click();
  setTimeout(() => {
    console.assert(
      count.current.textContent === "20",
      `wrong count after asyncAdd 19:${count.current.textContent}`
    );
    console.assert(
      avg.current.textContent === "10",
      `wrong average after asyncAdd 19:${avg.current.textContent}`
    );
    render(document.body, html`<p>done</p>`);
  }, 50);
});
