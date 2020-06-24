require("basichtml").init();
require("uce");
const Dragonbinder = require("dragonbinder");

const { getConnectedObj } = require("../cjs");

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

const connectedObj = getConnectedObj(store);

customElements.whenDefined("uce-lib").then(() => {
  const { define, render, html } = customElements.get("uce-lib");
  let add = {};
  let asyncAdd = {};
  let count = {};
  let count2 = {};
  let avg = {};
  let otherCount = {};
  let otherAdd = {};
  define("my-counter", {
    ...connectedObj,
    init() {
      this.render();
    },
    render() {
      this.html`<p ref=${count}>${this.state.count}</p> <p ref=${avg}>${
        this.getters.average
      }</p>
              <button ref=${add} onclick=${() => {
        this.commit("add", 1);
      }}>add 1</button>
              <button ref=${asyncAdd} onclick=${() => {
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
      this.html`<p ref=${count2}>${this.state.count}</p><p ref=${otherCount}>${
        this.state.otherCount
      }</p> 
              <button ref=${otherAdd} onclick=${() => {
        this.commit("otherAdd");
      }}>otherAdd 1</button>`;
    },
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
  render(
    document.body,
    html`<my-counter></my-counter>
      <my-othercounter data-render-on="otherCount,somestuff"></my-othercounter>`
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
  console.assert(
    count2.current.textContent === "0",
    `other counter rendered after count set:${count2.current.textContent}`
  );
  otherAdd.current.click();
  console.assert(
    count2.current.textContent === "1",
    `other counter did not update count after otherAdd:${count2.current.textContent}`
  );
  console.assert(
    otherCount.current.textContent === "1",
    `wrong otherCount after otherAdd 1:${otherCount.current.textContent}`
  );
  asyncAdd.current.click();
  setTimeout(() => {
    console.assert(
      count.current.textContent === "20",
      `wrong count after asyncAdd:${count.current.textContent}`
    );
  }, 1000);
  render(document.body, html`<p>done</p>`);
});
