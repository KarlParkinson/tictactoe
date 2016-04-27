// Encapsulation of a square on the tictactoe grid
var Square = function(x, y, width) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.occupied = false;
};

// Draw an 'X' in the square.
// TODO: refactor magic numbers out as much as possible
Square.prototype.drawX = function(ctx) {
    var midpoint = {
	x: this.x + this.width/2,
	y: this.y + this.width/2
    };

    ctx.beginPath();
    ctx.moveTo(midpoint.x - 50, midpoint.y - 50);
    ctx.lineTo(midpoint.x + 50, midpoint.y + 50);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(midpoint.x + 50, midpoint.y - 50);
    ctx.lineTo(midpoint.x - 50, midpoint.y + 50);
    ctx.stroke();
    this.occupied = true;
};

// Draw an 'O' in the square
// TODO: refactor magic numbers out as much as possible
Square.prototype.drawO = function(ctx) {
    var midpoint = {
	x: this.x + this.width/2,
	y: this.y + this.width/2
    };
    
    ctx.beginPath();
    ctx.arc(midpoint.x, midpoint.y, 50, 0, 2 * Math.PI, false);
    ctx.stroke();
    this.occupied = true;
};

// Check if the click event occured in this square
Square.prototype.handleClick = function(click, ctx, symbol) {
    if (this.occupied) {
	return false;
    } else {
	if (this.x < click.x && (this.x + this.width) > click.x
	    && this.y < click.y && (this.y + this.width) > click.y) {
	    if (symbol === "X") {
		this.drawX(ctx);
	    } else {
		this.drawO(ctx);
	    }
	    return true;
	}
    }
};

// Represents the game board. squares is a 2d list of strings, which can be 'X', 'O' or ''.
var Board = function(squares, filledSquares) {
    this.squares = squares;
    this.filledSquares = filledSquares;
};

// Fill the appropriate entry in squares with either 'X' or 'O'
Board.prototype.makeMove = function(move, player) {
    this.squares[move.row][move.column] = player;
    this.filledSquares++;
};

// Print the board
Board.prototype.print = function() {
    putstr("\n");
    for (var i = 0; i < this.squares.length; i++) {
	for (var j = 0; j < this.squares.length; j++) {
	    putstr(this.squares[i][j]);
	    putstr(" | ");
	}
	putstr("\n");
    }
    putstr("\n");
};

// Represent a state of the game. Contains a Board, and strings representing the player
// and enemy in the state respectively.
var GameState = function(board, player, enemy) {
    this.board = board;
    this.player = player;
    this.enemy = enemy;
};

// Make a move. Creates an update board, and returns a new GameState with the updated board and the player and enemy roles switched.
// TODO: Do I need to create new Board and GameState objects, or can I just update existing?
GameState.prototype.makeMove = function(move) {
    var newBoard = new Board(JSON.parse(JSON.stringify(this.board.squares)), this.board.filledSquares);
    newBoard.makeMove(move, this.player);
    return new GameState(newBoard, this.enemy, this.player);
};


// Returns a list of all possible moves in this GameState
GameState.prototype.getPossibleMoves = function () {
    possibleMoves = []
    for (var i = 0; i < this.board.squares.length; i++) {
	for (var j = 0; j < this.board.squares.length; j++) {
	    if (this.board.squares[i][j] === " ") {
		possibleMoves.push(new Move(i,j));
	    }
	}
    }
    return possibleMoves;
};

// Returns the score of the GameState.
GameState.prototype.score = function(player, opponent) {
    if (this.win(player)) {
	return 10;
    } else if (this.win(opponent)) {
	return -10;
    } else {
	return 0;
    }
};

// Checks if player has won this GameState
GameState.prototype.win = function(player) {
    if (this.rowWin(player)) {
	return true;
    } else if (this.columnWin(player)) {
	return true;
    } else if (this.diagonalWin(player)) {
	return true;
    } else {
	return false;
    }
};

// Check for row win
GameState.prototype.rowWin = function(player) {
    for (var i = 0; i < this.board.squares.length; i++) {	
	if (this.board.squares[i][0] === player && this.board.squares[i][1] === player && this.board.squares[i][2] === player) {
	    return true;
	}
    }
    return false;
};

// Check for column win
GameState.prototype.columnWin = function(player) {
    for (var i = 0; i < this.board.squares.length; i++) {
	if (this.board.squares[0][i] === player && this.board.squares[1][i] === player && this.board.squares[2][i] === player) {
	    return true;
	}
    }
    return false;
};

// Check for diagonal win
GameState.prototype.diagonalWin = function(player) {
    if (this.board.squares[0][0] === player && this.board.squares[1][1] === player && this.board.squares[2][2] === player) {
	return true;
    } else if (this.board.squares[2][0] === player && this.board.squares[1][1] === player && this.board.squares[0][2] === player) {
	return true;
    } else {
	return false;
    }
};

// Check if the GameState is an over state
GameState.prototype.over = function() {
    if (this.win("X")) {
	return true;
    } else if (this.win("O")) {
	return true;
    } else if (this.board.filledSquares === Math.pow(this.board.squares.length, 2)) {
	return true;
    } else {
	return false;
    }
};


// Represent a move. Has a row and a column
var Move = function(row, column) {
    this.row = row;
    this.column = column;
};


// The AI player which the user competes against
var AIPlayer = function(player, opponent) {
    this.player = player; // "X" or "O"
    this.opponent = opponent; // "X" or "O"
}

// Simple minimax algorithm using alpha-beta pruning. Good explanation of alpha-beta
// at https://www.youtube.com/watch?v=xBXHtz4Gbdo
// Good explanation of the minimax algorithm in the context of games like tictactoe
// at https://en.wikipedia.org/wiki/Minimax#Combinatorial_game_theory
AIPlayer.prototype.minimax = function(game, alpha, beta) {
    if (game.over()) {
	return game.score(this.player, this.opponent);
    }

    var scores = [];
    var moves = [];
    var possibleMoves = game.getPossibleMoves();

    // The AI wants to maximize its score, so is the maximizing player.
    if (game.player === this.player) {
	var v = -Number.MAX_VALUE;
	for (var i = 0; i < possibleMoves.length; i++) {
	    var possible_game = game.makeMove(possibleMoves[i]);
	    v = Math.max(v, this.minimax(possible_game, alpha, beta))
	    scores.push(v);
	    moves.push(possibleMoves[i]);
	    alpha = Math.max(alpha, v);
	    // can prune this branch
	    if (beta <= alpha) {
		break;
	    }
	}
	
	// Max Calculation
	var maxScoreIndex = scores.indexOf(Math.max.apply(null, scores));
	this.choiceMove = moves[maxScoreIndex];
	return scores[maxScoreIndex];
	
    } else {
	// AI wants to minimize opponent score, so is the minimum calculation
	var v = Number.MAX_VALUE;
	for (var i = 0; i < possibleMoves.length; i++) {
	    var possible_game = game.makeMove(possibleMoves[i]);
	    v = Math.min(v, this.minimax(possible_game, alpha, beta))
	    scores.push(v);
	    moves.push(possibleMoves[i]);
	    beta = Math.min(beta, v);
	    // can prune this branch
	    if (beta <= alpha) {
		break;
	    }
	}	

	// Min Calculation
	var minScoreIndex = scores.indexOf(Math.min.apply(null, scores));
	this.choiceMove = moves[minScoreIndex]
	return scores[minScoreIndex];
    }

};

// Take your turn, AI player.
AIPlayer.prototype.takeTurn = function(game, squares, ctx) {
    this.minimax(game, -Number.MAX_VALUE, Number.MAX_VALUE);
    this.drawMove(squares, ctx);
    return game.makeMove(this.choiceMove);
}

// Draw the move made by the AI player
AIPlayer.prototype.drawMove = function(squares, ctx) {
    var square = squares[this.choiceMove.row*3 + this.choiceMove.column]
    if (this.player === 'X') {
	square.drawX(ctx);
    } else {
	square.drawO(ctx);
    }
};

// Displays who won the game, or if it was a draw.
function handleEndGame(game) {
    var winner = document.getElementById('winner');
    if (game.win("X")) {
	winner.innerHTML = "You win. Click to play again.";
    } else if (game.win("O")) {
	winner.innerHTML = "I win. Click to play again.";
    } else {
	winner.innerHTML = "Draw. Click to play again.";
    }
};

// Draws the tictactoe grid. 
// TODO: Should refactor magic numbers, and instead pass in canvas
// width and height and use those to calculate where to draw lines.
function drawGrid(ctx) {
    ctx.beginPath();
    ctx.moveTo(300, 100);
    ctx.lineTo(300, 700);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(500, 100);
    ctx.lineTo(500, 700);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(100, 300);
    ctx.lineTo(700, 300);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(100, 500);
    ctx.lineTo(700, 500);
    ctx.stroke();
};

// Initialize the squares in the tictactoe grid and push them
// into the squares array.
function initSquares(gridWidth, gridHeight, x, y, squares) {
    for (var i = y; i < gridHeight; i = i + gridHeight/3) {
	for (var j = x; j < gridWidth; j = j + gridWidth/3) {
	    var square = new Square(j, i, gridWidth/3);
	    squares.push(square);
	}
    }
};

function play() {
    var canvas = document.getElementById('cvs');
    var ctx = canvas.getContext('2d');
    var squares = [];
    drawGrid(ctx);
    initSquares(600, 600, 100, 100, squares);

    var board = [[" ", " ", " "],[" ", " ", " "],[" ", " ", " "]];
    var game = new GameState(new Board(board, 0), "X", "O");
    var compPlayer = new AIPlayer("O", "X");
    
    var reset = false;

    canvas.addEventListener('click', function(e) {
	if (reset) {
	    window.location.reload(false);
	}

	var mouse = {
	    x: e.pageX - canvas.offsetLeft,
	    y: e.pageY - canvas.offsetTop
	};

	var handled = false;

	for (var i = 0; i < squares.length; i++) {
	    handled = squares[i].handleClick(mouse, ctx, "X");
	    if (handled) {
		var row = Math.floor(i/3);
		var column = i%3; 
		console.log(i + ": " + row + "," +  column);
		game = game.makeMove(new Move(row, column));
		break;
	    }
	}

	if (!handled) {
	    return false;
	}

	if (game.over()) {
	    handleEndGame(game);
	    reset = true;
	    return false;
	}
	game = compPlayer.takeTurn(game, squares, ctx);
	if (game.over()) {
	    handleEndGame(game);
	    reset = true;
	    return false;
	}
    });

};
