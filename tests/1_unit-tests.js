const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
const SudokuSolver = require('../controllers/sudoku-solver.js');
let solver = new SudokuSolver();

suite('Unit Tests', () => {
    test('Logic handles a valid puzzle string of 81 characters', () => {
        assert.equal(solver.solve('1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.'
            ,'135762984946381257728459613694517832812936745357824196473298561581673429269145378'
        ));
    })
});
