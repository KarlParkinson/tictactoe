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

GameState.prototype.print = function() {
    this.board.print();
};
	    

var Move = function(row, column) {
    this.row = row;
    this.column = column;
};


var AIPlayer = function(player, opponent) {
    this.player = player; // "X" or "O"
    this.opponent = opponent; // "X" or "O"
}

AIPlayer.prototype.minimax = function(game) {
//    game.print();
//var minimax = function(game, compPlayer) {
    if (game.over()) {
//	putstr("game over\n");
//	putstr(game.score(this.player, this.opponent).toString() + "\n");
	return game.score(this.player, this.opponent);
	//return game.score(compPlayer.player, compPlayer.opponent);
    }

    var scores = [];
    var moves = [];

    var possibleMoves = game.getPossibleMoves();
    for (var i = 0; i < possibleMoves.length; i++) {
	var possible_game = game.makeMove(possibleMoves[i]);
	scores.push(this.minimax(possible_game));
	//scores.push(minimax(possible_game, compPlayer));
	moves.push(possibleMoves[i]);
    }

//    printScoresArr(scores);
//    printMovesArr(moves);
    

    if (game.player === this.player) {
    //if (game.player === compPlayer.player) {
	// Max Calculation
	var maxScoreIndex = scores.indexOf(Math.max.apply(null, scores));
	//putstr(moves[maxScoreIndex].row.toString() + "--" + moves[maxScoreIndex].row.toString() + "\n");
	this.choiceMove = moves[maxScoreIndex];
	//compPlayer.choiceMove = moves[maxScoreIndex];
	return scores[maxScoreIndex];
	
    } else {
	// Min Calculation
	var minScoreIndex = scores.indexOf(Math.min.apply(null, scores));
	//putstr(moves[minScoreIndex].row.toString() + "--" + moves[minScoreIndex].row.toString() + "\n");
	this.choiceMove = moves[minScoreIndex]
	//compPlayer.choiceMove = moves[minScoreIndex];
	return scores[minScoreIndex];
    }
};

AIPlayer.prototype.takeTurn = function(game) {
    this.minimax(game);
    //minimax(game, this);
    return game.makeMove(this.choiceMove);
}

var printScoresArr = function(arr) {
    putstr("array is: ");
    for (var i = 0; i < arr.length; i++) {
	putstr(arr[i]);
	putstr(",   ");
    }
    putstr("\n");
};

var printMovesArr = function(arr) {
    putstr("array is: ");
    for (var i = 0; i < arr.length; i++) {
	putstr(arr[i].row.toString() + "--" + arr[i].column.toString() + ",");
    }
    putstr("\n");
}



var play = function() {
    var squares = [[" ", " ", " "],[" ", " ", " "],[" ", " ", " "]];
    var game = new GameState(new Board(squares, 0), "X", "O");
    var compPlayer = new AIPlayer("O", "X");
    game.print();
    while (true) {
	putstr("Human enter a move in x,y format: \n");
	var move = readline().split(",");
	game = game.makeMove(new Move(parseInt(move[0]), parseInt(move[1])));
	game.print();
	//game.player = "X";
	//game.enemy = "O";

	if (game.over()) {
	    putstr("game over\n");
	    break;
	}

	putstr("Computer making move\n");
	game = compPlayer.takeTurn(game);
	game.print();
	//game.player = "X";
	//game.enemy = "O";

	if (game.over()) {
	    putstr("game over\n");
	    break;
	}
//	var move = readline().split(",");
//	game.makeMove(new Move(parseInt(move[0]), parseInt(move[1])), "O");
//	game.print();

//	if (game.over()) {
//	    break;
//	}
    };
};


play();
