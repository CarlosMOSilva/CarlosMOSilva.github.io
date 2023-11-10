/**
 * Creating classes:
 *
 * Class declaration: class Name {}
 * Class expression:  const Name = class {}
 */

class Cell {
  constructor(
    // Defines parameters:
    id,
    state,
    row,
    col
  ) {
    // Define properties:
    this.id = id;
    this.state = state;
    this.row = row;
    this.col = col;
  }

  toggleState() {
    const el = document.querySelector(`#cell-${this.id}`);
    const numCellsAlive = document.querySelector("#num-cells-alive");
    el.innerText === "1" ? this.state = 0 : this.state = 1;
    el.innerText = this.state;
    el.classList.toggle("live");
    el.classList.toggle("dead");
    numCellsAlive.innerHTML = (Number(numCellsAlive.innerHTML) + (this.state === 1 ? 1 : -1)).toString().padStart(3, "0")
  }

  getHTMLElement() {
    const div = document.createElement("div");
    div.classList.add(`grid-item`);
    div.setAttribute("id", `cell-${this.id}`)
    div.classList.add(`${this.state === 1 ? "live" : "dead"}`);
    div.innerText = this.state;
    div.addEventListener("click", () => {
      if (document.querySelector(".timer-box").classList.contains("hide")) {
        this.toggleState();
      }
    });
    return div;
  }
}

export default Cell;
