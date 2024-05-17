const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
const SudokuSolver = require('../controllers/sudoku-solver.js');
let solver = new SudokuSolver();

suite('Unit Tests', () => {
    test('Logic handles a valid puzzle string of 81 characters', () => {
        assert.equal(solver.convertToString(solver.solve('1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.'))
        , '135762984946381257728459613694517832812936745357824196473298561581673429269145378');
    })

    test('Logic handles a puzzle string with invalid characters (not 1-9 or .)', () => {
        assert.deepEqual(solver.validate('1b5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.'), {
            error: 'Invalid characters in puzzle'
        })
    })

    test('Logic handles a puzzle string that is not 81 characters in length' , () => {
        assert.deepEqual(solver.validate('5..91372.3...8.5.9.9.25..8.68.47.23...95..46.7.4.....5.2.......4..8916..85.72.'), {
            error: 'Expected puzzle to be 81 characters long'
        })
    })

    test('Logic handles a valid row placement' ,() => {
        assert.equal(solver.checkRowPlacement('..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..', 'E', '3', '1'), true);
    })

    test('Logic handles an invalid row placement', () => {
        assert.equal(solver.checkRowPlacement('..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..', 'D', '2', '9'), false);
    })

    test('Logic handles a valid column placement', () => {
        assert.equal(solver.checkColPlacement('..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..', 'A', '5', '3'), true);
    })

    test('Logic handles an invalid column placement', () => {
        assert.equal(solver.checkColPlacement('..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..', 'F', '8', '3'), false);
    })

    test('Logic handles a valid region (3x3 grid) placement', () => {
        assert.equal(solver.checkRegionPlacement('..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..', 'D', '2', '3'), true);
    })

    test('Logic handles an invalid region (3x3 grid) placement', () => {
        assert.equal(solver.checkRegionPlacement('..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..', 'D', '2', '6'), false);
    })

    test('Valid puzzle strings pass the solver', () => {
        assert.equal(solver.convertToString(solver.solve('..839.7.575.....964..1.......16.29846.9.312.7..754.....62..5.78.8...3.2...492...1'))
        , '218396745753284196496157832531672984649831257827549613962415378185763429374928561');
    })

    test('Invalid puzzle strings fail the solver', () => {
        assert.deepEqual(solver.convertToString(solver.solve('..839.7.575.....964..1.....2.16.29846.9.312.7..754.....62..5.78.8...3.2...492...1'))
        , ''
        );
    })

    test('Solver returns the expected solution for an incomplete puzzle', () => {
        assert.equal(solver.convertToString(solver.solve('82..4..6...16..89...98315.749.157.............53..4...96.415..81..7632..3...28.51'))
        , '827549163531672894649831527496157382218396475753284916962415738185763249374928651');
    })
});
