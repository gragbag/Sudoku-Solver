class SudokuSolver {

  constructor() {
    this.solution = [];
    this.root = null;
    this.grid = [];
  }

  validate(puzzleString) {
    if (!puzzleString) {
      return {
        error: 'Required field missing'
      };
    }

    if (/[^1-9.]/.test(puzzleString)) {
      return {
        error: 'Invalid characters in puzzle'
      };
    }

    if (puzzleString.length !== 81) {
      return {
        error: 'Expected puzzle to be 81 characters long'
      };
    }
  }

  checkRowPlacement(puzzleString, row, column, value) {
    let rowNum = row.charCodeAt(0) - 'A'.charCodeAt(0);
    
    let startingRow = rowNum * 9;

    for (let i = startingRow; i < startingRow + 9; i++) {
      if (puzzleString.charAt(i) == value) {
        return false;
      }
    }

    return true;
  }

  checkColPlacement(puzzleString, row, column, value) {
    for (let i = column - 1; i < 81; i += 9) {
      if (puzzleString.charAt(i) == value) {
        return false;
      }
    }

    return true;
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    let rowNum = row.charCodeAt(0) - 'A'.charCodeAt(0);
    let colNum = column - 1;

    let block = Math.floor(colNum / 3) + (Math.floor(rowNum / 3) * 3);

    let startingPos = block * 9;
    let endingPos = startingPos + 20;

    for (let i = startingPos; i < endingPos; i += 9) {
      for (let j = 0; j < 3; j++) {
        let location = i + j;
        if (puzzleString.charAt(location) == value) {
          return false;
        }
      }
    }

    return true;
  }

  solve(puzzleString) {
    let matrix = [];
    let c = 0;

    for (let i = 0; i < 9; i++) {
      matrix[i] = [];
      for (let j = 0; j < 9; j++) {
        matrix[i][j] = puzzleString.charAt(c);
        c++;
      }
    }



    matrix = this.createSparseMatrix(matrix);

    this.root = this.createDoubleLinkedLists(matrix);

    this.search(0);

    const result = this.grid;

    this.solution = [];
    this.root = null;
    this.grid = [];

    return result;

  }

  convertToString(matrix) {
    let stringSolution = "";
    matrix.forEach((row) => {stringSolution += row.join("");});

    return stringSolution;
  }

  createSparseMatrix(initialMatrix) {
    let clues = [];

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (initialMatrix[r][c] !== '.') {
          clues.push([initialMatrix[r][c], r, c]);
        }
      }
    }

    let sparseMatrix = Array.from({ length: 729 }, () => Array(324).fill(0));

    for (let d = 0; d < 9; d++) {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {

          if (!this.filled(d, r, c, clues)) {
            let rowIndex = c + (9 * r) + (81 * d);
            
            let blockIndex = (Math.floor(c / 3) + (Math.floor(r / 3) * 3))

            let colIndexRow = 27 * d + r;
            let colIndexCol = 27 * d + 9 + c;
            let colIndexBlock = 27 * d + 18 + blockIndex;
            let colIndexSimple = 243 + (c + 9 * r);

            sparseMatrix[rowIndex][colIndexRow] = 1;
            sparseMatrix[rowIndex][colIndexCol] = 1;
            sparseMatrix[rowIndex][colIndexBlock] = 1;
            sparseMatrix[rowIndex][colIndexSimple] = 1;

          }

        }
      }
    }

    return sparseMatrix;

  }

  filled(digit, row, col, clues) {
    let filled = false;

    if (clues !== null) {
      for (let i = 0; i < clues.length; i++) {
        let d = clues[i][0] - 1; //Number in the clues, -1 cause of index starting at 0
        let r = clues[i][1];
        let c = clues[i][2];

        let blockStartIndexCol = Math.floor(c / 3) * 3;
        let blockEndIndexCol = blockStartIndexCol + 3;
        let blockStartIndexRow = Math.floor(r / 3) * 3;
        let blockEndIndexRow = blockStartIndexRow + 3;

        if (d != digit && row == r & col == c) {
          filled = true;
        } else if ((d == digit) && (row == r || col == c) && (row != r || col != c)) {
          filled = true;
        } else if ((d == digit) && (row > blockStartIndexRow) && (row < blockEndIndexRow) && (col > blockStartIndexCol) && (col < blockEndIndexCol) && (row != r || col != c)) {
          filled = true;
        }
      }
    }

    return filled;
  }

  createDoubleLinkedLists(matrix) {
    let root = new ColumnNode();

    let currColumn = root;
    for (let col = 0; col < matrix[0].length; col++) {
      let id = new ColumnID();
      if (col < 3 * 9 * 9) {
        let digit = Math.floor(col / 27) + 1;
        id.number = digit;

        let index = col - (digit - 1) * 27;
        if (index < 9) {
          id.constraint = 0;
          id.position = index;
        } else if (index < 18) {
          id.constraint = 1;
          id.position = index - 9;
        } else {
          id.constraint = 2;
          id.position = index - 18;
        }
      } else {
        id.constraint = 3;
        id.position = col - 3 * 9 * 9;
      }

      currColumn.right = new ColumnNode(); //Create the column to the right
      currColumn.right.left = currColumn;
      currColumn = currColumn.right;
      currColumn.info = id;
      currColumn.head = currColumn
    }

    currColumn.right = root; //The list is circular so the last column goes back to the root
    root.left = currColumn;

    //Iterate over the matrix
    for (let row = 0; row < matrix.length; row++) {
      currColumn = root.right;
      let lastCreatedElement = null;
      let firstElement = null;
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col] == 1) { //If the sparse grid has 1, it has a clue
          let colElement = currColumn;
          while (colElement.down != null) {
            colElement = colElement.down; //keep going down until the end is reached
          }

          colElement.down = new Node(); //Create a new node at the bottom of the column

          if (firstElement === null) {
            firstElement = colElement.down; //First element will be this new node
          }

          //Setting the neighbors for the new node
          colElement.down.up = colElement;
          colElement.down.left = lastCreatedElement;
          colElement.down.head = currColumn;

          if (lastCreatedElement !== null) {
            colElement.down.left.right = colElement.down; //Setting the neighbor to point to the new node if there are any
          }

          lastCreatedElement = colElement.down;
          currColumn.size++;
        }
        currColumn = currColumn.right; //Move onto the next column
      }

      if (lastCreatedElement !== null) { //Make the last and first element linked so that it is circular
        lastCreatedElement.right = firstElement;
        firstElement.left = lastCreatedElement;
      }
    }

    currColumn = root.right;
    //Make all the last column nodes link back to the column head
    for (let i = 0; i < matrix[0].length; i++) {
      let colElement = currColumn;
      while (colElement.down != null) {
        colElement = colElement.down;
      }
      colElement.down = currColumn;
      currColumn.up = colElement;
      currColumn = currColumn.right;
    }

    return root;
  }

  search(k) { //k = index
    if (this.root.right === this.root) {
      this.mapSolvedToGrid();
      return;
    }

    let c = this.choose();
    this.cover(c);

    let r = c.down;
    while (r != c) {
      if (k < this.solution.length) {
        this.solution.splice(k, 1);
      }

      this.solution.splice(k, 0, r);

      let j = r.right; //j = next row element
      while (j !== r) {
        this.cover(j.head) //cover the columns associated with the row element
        j = j.right;
      }
      this.search(k + 1);

      let r2 = this.solution[k]; //uncover all the solutions that dont work
      let j2 = r2.left;
      while (j2 !== r2) {
        this.uncover(j2.head);
        j2 = j2.left;
      }
      r = r.down
    }
    this.uncover(c);
  }

  mapSolvedToGrid() {
    let result = [];
    this.solution.forEach((solution) => {
      let number = -1;
      let cellNo = -1;
      let element = solution;
      let next = element;

      do {
        if (next.head.info.constraint == 0) {
          number = next.head.info.number;
        } else if (next.head.info.constraint == 3) {
          cellNo = next.head.info.position;
        }
        next = next.right;
      } while (element != next);
      result[cellNo] = number;
    });

    let resultCounter = 0;
    for (let r = 0; r < 9; r++) {
      this.grid[r] = [];
      for (let c = 0; c < 9; c++) {
        this.grid[r][c] = result[resultCounter];
        resultCounter++;
      }
    }
  }

  choose() {
    let rightOfRoot = this.root.right;
    let smallest = rightOfRoot;
    while (rightOfRoot.right != this.root) {
      rightOfRoot = rightOfRoot.right;
      if (rightOfRoot.size < smallest.size) {
        smallest = rightOfRoot;
      }
    }

    return smallest;
  }

  cover(column) {  //Remove the nodes from the grid given the column AKA cover it, can be restored with uncover

    column.right.left = column.left;
    column.left.right = column.right;

    for (let row = column.down; row != column; row = row.down) {
      for (let curNode = row.right; curNode != row; curNode = curNode.right) {
        curNode.up.down = curNode.down;
        curNode.down.up = curNode.up;
        curNode.head.size--;
      }
    }
  }

  uncover(column) { //Reinsert the column and all the associated rows back into the grid

    for (let row = column.up; row != column; row = row.up) {
      for (let curNode = row.left; curNode != row; curNode = curNode.left) {
        curNode.head.size++;
        curNode.up.down = curNode;
        curNode.down.up = curNode;
      }
    }

    column.right.left = column;
    column.left.right = column;
  }
}

class Node {
  constructor() {
    this.left = null;
    this.right = null;
    this.up = null;
    this.down = null;
    this.head = null;
  }
}

class ColumnNode extends Node {
  constructor() {
    super();
    this.size = 0;
    this.info = new ColumnID();
  }
}

class ColumnID {
  constructor() {
    this.constraint = -1; //0 = row, 1 = col, 2 = block, 3 = cell
    this.number = -1;
    this.position = -1;
  }
  
}



module.exports = SudokuSolver;

