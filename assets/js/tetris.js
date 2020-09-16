var canvas = document.getElementById("tetris");
var score = document.getElementById("score");
var newGame = document.getElementById("newGame");
var message = document.getElementById("message");
var context = canvas.getContext("2d");
var end = false;
context.scale(30, 30);




var arena = createMatrix(12, 20);

var player = {
	pos: {x:5, y:5},
	matrix: createPiece('T'),
	score: 0
};


function collide(arena, player) {
	var[m,o] = [player.matrix, player.pos];
	for (var y=0; y<m.length;y++) {
		for (var x = 0; x <m[y].length; x++) {
			if ((m[y][x] !== 0) &&
				(arena[y+o.y] &&
				arena[y+o.y][x+o.x]) !== 0) {
				return true;
			}
		}
	}
	return false
}

function createMatrix(w, h) {
	var matrix = [];
	while (h--) {
		matrix.push(new Array(w).fill(0));
	}
	return matrix;
}

function createPiece(type) {
	if (type === 'T') {
		return [
			[1,1,1],
			[0,1,0],
			[0,0,0]
		];
	} else if (type === 'O') {
		return [
			[2, 2],
			[2, 2]
		];
	} else if (type === 'L') {
		return [
			[0,3,0],
			[0,3,0],
			[0,3,3]
		];
	} else if (type === 'J') {
		return [
			[0,4,0],
			[0,4,0],
			[4,4,0]
		];
	} else if (type === 'I') {
		return [
			[0,5,0,0],
			[0,5,0,0],
			[0,5,0,0],
			[0,5,0,0]
		];
	} else if (type === 'S') {
		return [
			[0,6,6],
			[6,6,0],
			[0,0,0],
		];
	} else if (type === 'Z') {
		return [
			[7,7,0],
			[0,7,7],
			[0,0,0],
		];
	}
}

const colors = [
	null,
	'#FF0D72',
	'#0DC2FF',
	'#0DFF72',
	'#F538FF',
	'#FF8E0D',
	'#FFE138',
	'#3877FF'
];


function playerDrop() {
	player.pos.y++;
	if (collide(arena, player)) {
		player.pos.y--;
		merge(arena, player);
		playerReset();
		arenaSweep();
		updateScore();
	}

}

function draw() {
	context.fillStyle = '#000';
	context.fillRect(0 ,0, canvas.width, canvas.height);
	drawMatrix(arena, {x:0,y:0});
	drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset) {
	matrix.forEach(function(row, y){
		row.forEach(function(value, x){
			if (value !== 0) {
				context.fillStyle = colors[value];
				context.fillRect(x+offset.x,y+offset.y,1,1);
			}
		});
	});
}

function arenaSweep() {
	var rowCount = 1;
	outer: for (var y = arena.length -1; y > 0; --y) {
		for (var x = 0; x < arena[y].length; ++x) {
			if (arena[y][x] === 0) {
				continue outer;
			}
		} 
		const row = arena.splice(y,1)[0].fill(0);
		arena.unshift(row);
		++y;
		player.score += rowCount * 10;
		rowCount *= 2;
	}
}

function merge(arena, player) {
	player.matrix.forEach(function(row, y) {
		row.forEach(function(value, x) {
			if (value !== 0) {
				arena[y+player.pos.y][x+player.pos.x] = value;
			}
		});
	});
}




var dropCounter = 0;
var dropInterval = 1000;
var lastTime = 0;

function update(time = 0) {
	var deltaTime = time - lastTime;
	lastTime = time;
	dropCounter += deltaTime;
	if (dropCounter > dropInterval) {
		playerDrop();
		dropCounter = 0;
	}
	if (!end) {
		requestAnimationFrame(update);
		draw();
	}
}

function updateScore() {
	score.textContent = player.score;
}


function playerReset() {
	var pieces = "ILJOTSZ";
	player.matrix = createPiece(pieces[Math.floor(pieces.length*Math.random())]);
	player.pos.y = 0;
	player.pos.x =( Math.floor(arena[0].length / 2) - Math.floor(player.matrix[0].length / 2));
	if (collide(arena, player)) {
		message.textContent = "You Lose!";
		end = true;
		cancelAnimationFrame(update);
	}

}

function playerMove(dir) {
	player.pos.x += dir;
	if (collide(arena, player)) {
		player.pos.x -= dir;
	}

}


function playerRotate(dir) {
	var pos = player.pos.x;
	var offset = 1;
	rotate(player.matrix, dir);
	while (collide(arena, player)) {
		player.pos.x += offset;
		offset = -(offset+ (offset > 0? 1:-1));
		if (offset > player.matrix[0].length) {
			rotate(player.matrix, -dir);
			player.pos.x = pos;
			return;
		}
	}
}

function rotate(matrix, dir) {
	for(var y = 0; y < matrix.length; y++) {
		for (var x = 0; x < y; x++) {
			[
				matrix[x][y],
				matrix[y][x],
			] = 
			[
				matrix[y][x],
				matrix[x][y],
			];

		}
	}
	if (dir > 0) {
		matrix.forEach(function(row, y) {
			row.reverse();
		});
	} else {
		matrix.reverse();
	}
}


document.addEventListener("keydown", function(){
	if(event.which === 37) {
		playerMove(-1);
	} else if (event.which === 39) {
		playerMove(1);
	} else if (event.which === 40) {
		playerDrop();
	} else if (event.which === 81) {
		playerRotate(-1);
	} else if (event.which === 87) {
		playerRotate(1);
	}
});

newGame.addEventListener("click", function() {
	end = false;
	message.textContent="";
	arena = createMatrix(12, 20);
	playerReset();
	update();
	updateScore();
});

updateScore();
update();
