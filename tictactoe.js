var Square = function(x, y, width) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.occupied = false;
};

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

Square.prototype.handleClick = function(click, ctx, symbol) {
    if (this.occupied) {
	return false;
    } else {
	if (this.x < click.x && (this.x + this.width) > click.x
	    && this.y < click.y && (this.y + this.width) > click.y) {
//	    this.occupied = true;
//	    var rand = Math.floor((Math.random() * 10) + 1)
//	    if (rand%2 === 0) {
//		this.drawX(ctx);
//	    } else {
//		this.drawO(ctx);
//	    }
	    if (symbol === "X") {
		this.drawX(ctx);
	    } else {
		this.drawO(ctx);
	    }
	    return true;
	}
    }
};

var initSquares = function(gridWidth, gridHeight, x, y, squares) {
    for (var i = y; i < gridHeight; i = i + gridHeight/3) {
	for (var j = x; j < gridWidth; j = j + gridWidth/3) {
	    var square = new Square(j, i, gridWidth/3);
	    squares.push(square);
	}
    }
};

var drawGrid = function(ctx) {
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

var Board = function(squares, filledSquares) {
    this.squares = squares;
    this.filledSquares = filledSquares;
};

Board.prototype.makeMove = function(move, player) {
    this.squares[move.row][move.column] = player;
    this.filledSquares++;
};

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

var GameState = function(board, player, enemy) {
    this.board = board;
    this.player = player;
    this.enemy = enemy;
};

GameState.prototype.makeMove = function(move) {
    var newBoard = new Board(JSON.parse(JSON.stringify(this.board.squares)), this.board.filledSquares);
    newBoard.makeMove(move, this.player);
    return new GameState(newBoard, this.enemy, this.player);
};


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

GameState.prototype.score = function(player, opponent) {
    if (this.win(player)) {
	return 10;
    } else if (this.win(opponent)) {
	return -10;
    } else {
	return 0;
    }
};

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

GameState.prototype.rowWin = function(player) {
    for (var i = 0; i < this.board.squares.length; i++) {	
	if (this.board.squares[i][0] === player && this.board.squares[i][1] === player && this.board.squares[i][2] === player) {
	    return true;
	}
    }
    return false;
};

GameState.prototype.columnWin = function(player) {
    for (var i = 0; i < this.board.squares.length; i++) {
	if (this.board.squares[0][i] === player && this.board.squares[1][i] === player && this.board.squares[2][i] === player) {
	    return true;
	}
    }
    return false;
};

GameState.prototype.diagonalWin = function(player) {
    if (this.board.squares[0][0] === player && this.board.squares[1][1] === player && this.board.squares[2][2] === player) {
	return true;
    } else if (this.board.squares[2][0] === player && this.board.squares[1][1] === player && this.board.squares[0][2] === player) {
	return true;
    } else {
	return false;
    }
};

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

var Move = function(row, column) {
    this.row = row;
    this.column = column;
};


var AIPlayer = function(player, opponent) {
    this.player = player; // "X" or "O"
    this.opponent = opponent; // "X" or "O"
}

AIPlayer.prototype.minimax = function(game, alpha, beta) {
    if (game.over()) {
	return game.score(this.player, this.opponent);
    }

    var scores = [];
    var moves = [];
    var possibleMoves = game.getPossibleMoves();

    if (game.player === this.player) {
	var v = -Number.MAX_VALUE;
	for (var i = 0; i < possibleMoves.length; i++) {
	    var possible_game = game.makeMove(possibleMoves[i]);
	    v = Math.max(v, this.minimax(possible_game, alpha, beta))
	    scores.push(v);
	    moves.push(possibleMoves[i]);
	    alpha = Math.max(alpha, v);
	    if (beta <= alpha) {
		break;
	    }
	}
	
	// Max Calculation
	var maxScoreIndex = scores.indexOf(Math.max.apply(null, scores));
	this.choiceMove = moves[maxScoreIndex];
	return scores[maxScoreIndex];
	
    } else {
	var v = Number.MAX_VALUE;
	for (var i = 0; i < possibleMoves.length; i++) {
	    var possible_game = game.makeMove(possibleMoves[i]);
	    v = Math.min(v, this.minimax(possible_game, alpha, beta))
	    scores.push(v);
	    moves.push(possibleMoves[i]);
	    beta = Math.min(beta, v);
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

AIPlayer.prototype.takeTurn = function(game, squares, ctx) {
    this.minimax(game, -Number.MAX_VALUE, Number.MAX_VALUE);
    this.drawMove(squares, ctx);
    return game.makeMove(this.choiceMove);
}

AIPlayer.prototype.drawMove = function(squares, ctx) {
    var square = squares[this.choiceMove.row*3 + this.choiceMove.column]
    if (this.player === 'X') {
	square.drawX(ctx);
    } else {
	square.drawO(ctx);
    }
};

function play() {
    var canvas = document.getElementById('cvs');
    var ctx = canvas.getContext('2d');
    var squares = [];
    drawGrid(ctx);
    initSquares(600, 600, 100, 100, squares);

    var turn = "player";
    var board = [[" ", " ", " "],[" ", " ", " "],[" ", " ", " "]];
    var game = new GameState(new Board(board, 0), "X", "O");
    var compPlayer = new AIPlayer("O", "X");

    canvas.addEventListener('click', function(e) {
	if (turn === "AI") {
	    return;
	}
	
	var mouse = {
	    x: e.pageX - canvas.offsetLeft,
	    y: e.pageY - canvas.offsetTop
	};

	for (var i = 0; i < squares.length; i++) {
	    var handled = squares[i].handleClick(mouse, ctx, "X");
	    if (handled) {
		var row = Math.floor(i/3);
		var column = i%3; 
		console.log(i + ": " + row + "," +  column);
		game = game.makeMove(new Move(row, column));
		break;
	    }
	}
	if (game.over()) {
	    return;
	}
	turn = "AI";
	game = compPlayer.takeTurn(game, squares, ctx);
	if (game.over()) {
	    return;
	}
	turn = "player";
    });

};
