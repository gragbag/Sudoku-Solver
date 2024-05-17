'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');
const bodyParser = require('body-parser');

module.exports = function (app) {
  app.use(bodyParser.urlencoded({extended: false}))
  
  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {
      const puzzle = req.body.puzzle;
      const coordinate = req.body.coordinate;
      const value = req.body.value;

      if (!puzzle || !coordinate || !value) {
        return res.status(400).send({error: 'Required field(s) missing'})
      }

      const notValidPuzzle = solver.validate(puzzle);

      if (notValidPuzzle) {
        return res.status(400).send(notValidPuzzle);
      }

      if (!/^[A-I][1-9]$/.test(coordinate)) {
        return res.status(400).send({error: 'Invalid coordinate'})
      }

      if (!/^[1-9]$/.test(value)) {
        return res.status(400).send({error: 'Invalid value'});
      }

      const row = coordinate.charAt(0);
      const col = coordinate.charAt(1);

      const conflicts = [];

      if (!solver.checkRowPlacement(puzzle, row, col, value)) {
        conflicts.push('row');
      }

      if (!solver.checkColPlacement(puzzle, row, col, value)) {
        conflicts.push('column')
      }

      if (!solver.checkRegionPlacement(puzzle, row, col, value)) {
        conflicts.push('region')
      }

      if (conflicts.length > 0) {
        return res.send({
          valid: false,
          conflict: conflicts
        })
      } else {
        res.send({
          valid: true
        })
      }

      


    });
    
  app.route('/api/solve')
    .post((req, res) => {

      const puzzle = req.body.puzzle;

      const notValidPuzzle = solver.validate(puzzle);
      if (notValidPuzzle) {
        return res.status(400).send(notValidPuzzle);
      }

      const solution = solver.solve(puzzle);
      
      if (solution.length === 0) {
        return res.status(400).send({error: 'Puzzle cannot be solved'});
      }

      let stringSolution = solver.convertToString(solution);

      res.send({solution: stringSolution});

    });
};
