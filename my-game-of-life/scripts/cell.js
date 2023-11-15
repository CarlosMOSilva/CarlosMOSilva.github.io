/**
 * Creating classes:
 *
 * Class declaration: class Name {}
 * Class expression:  const Name = class {}
 */

const Cell = ({
  id, state, row, col,
}) => {
  // Define properties:
  const _id = id;
  let _state = state;
  const _row = row;
  const _col = col;

  return {
    toggleState: () => {
      const el = document.querySelector(`#cell-${_id}`);
      const numCellsAlive = document.querySelector('#num-cells-alive');
      el.innerText === '1' ? _state = 0 : _state = 1;
      el.innerText = _state;
      el.classList.toggle('live');
      el.classList.toggle('dead');
      numCellsAlive.innerHTML = (Number(numCellsAlive.innerHTML) + (_state === 1 ? 1 : -1)).toString().padStart(3, '0');
    },
    getHTMLElement: () => {
      const div = document.createElement('div');
      div.classList.add('grid-item');
      div.setAttribute('id', `cell-${_id}`);
      div.classList.add(`${_state === 1 ? 'live' : 'dead'}`);
      div.innerText = _state;
      return div;
    },
    getId: () => _id,
    getState: () => _state,
    getRow: () => _row,
    getCol: () => _col,
  };
};

export default Cell;
