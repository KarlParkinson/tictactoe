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
};

Square.prototype.drawO = function(ctx) {
    var midpoint = {
	x: this.x + this.width/2,
	y: this.y + this.width/2
    };
    
    ctx.beginPath();
    ctx.arc(midpoint.x, midpoint.y, 50, 0, 2 * Math.PI, false);
    ctx.stroke();
};

Square.prototype.handleClick = function(click, ctx) {
    if (this.occupied) {
	return false;
    } else {
	if (this.x < click.x && (this.x + this.width) > click.x
	    && this.y < click.y && (this.y + this.width) > click.y) {
	    this.occupied = true;
	    var rand = Math.floor((Math.random() * 10) + 1)
	    if (rand%2 === 0) {
		this.drawX(ctx);
	    } else {
		this.drawO(ctx);
	    }
	}
    }
};

var initSquares = function(gridWidth, gridHeight, x, y, ctx, squares) {
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

function draw() {
    var canvas = document.getElementById('cvs');
    var ctx = canvas.getContext('2d');
    var squares = [];
    drawGrid(ctx);
    canvas.addEventListener('click', function(e) {
	var mouse = {
	    x: e.pageX - canvas.offsetLeft,
	    y: e.pageY - canvas.offsetTop
	};

	for (var i = 0; i < squares.length; i++) {
	    squares[i].handleClick(mouse, ctx);
	}
    });
    initSquares(600, 600, 100, 100, ctx, squares);
};
