function Brain(x_cells, y_cells) {
    this.canvas = document.getElementById('brain');
    this.context = this.canvas.getContext('2d')
    this.x_cells = x_cells;
    this.y_cells = y_cells;
    this.scale = {x: this.canvas.width / this.x_cells,
		  y: this.canvas.height / this.y_cells};
    
    this.cells = [];
    for(var x = 0; x < this.x_cells * this.y_cells; x++) {
	var state = Math.random() > 0.5 ? this.state.dead : this.state.alive;
	this.cells[x] = state;
    }

    //Clone array;
    this.work = this.cells.slice();

    this.ind = [];
}

Brain.prototype.colors = {dead: 'black', dying: 'grey', alive: 'white'};
Brain.prototype.state = {dead: 0, dying: 1, alive: 2};

Brain.begin = function() { 
    var running = true;
    var brain = new Brain(50, 50);
    var handle = window.setInterval(function() {brain.step(); }, 0);
    var btn = document.getElementById("stop/start");

    btn.addEventListener("click", function(e) {
	running = !running;
	if(running) {
	    handle = window.setInterval(function() {brain.step(); }, 0);
	}
	else {
	    window.clearInterval(handle);
	}
    });
}

Brain.prototype.togglePause = function() {
    this.running = !this.running;
}

Brain.prototype.swap = function() {
    var temp = this.cells;
    this.cells = this.work;
    this.work = temp;
}

Brain.prototype.update = function() {
    for(var x = 0; x < this.x_cells; x++) {
	for(var y = 0; y < this.y_cells; y++) {
	    this.updateCell(x, y);
	}
    }
}

Brain.prototype.updateCell = function(x, y) {
    var cell = this.cellAt(x, y);
    var n = this.mooreNeighborhood(x, y);
    var that = this;
    var alive = n.reduce(
	function(prev, cur, index, array) {
	    return prev + (cur == that.state.alive ? 1 : 0);
	}, 0);
    var state = undefined;
    
    if(cell == this.state.alive) {
	state = this.state.dying;
    }
    else if(cell == this.state.dying) {
	state = this.state.dead;
    }
    else if(alive == 2 /* cell == dead implied */) {
	state = this.state.alive;
    } else {
	state = cell;
    }
    this.work[this.cellIndex(x, y)] = state;    
}

Brain.prototype.cellAt = function(x, y) {
    return this.cells[this.cellIndex(x, y)];
}

Brain.prototype.cellIndex =  function(x, y) {
    var mod = function(x, m) { return (((x % m) + m) % m); }
    return mod(y, this.y_cells) * this.x_cells + mod(x, this.x_cells);
}

Brain.prototype.mooreNeighborhood = function(x, y) {
    return [this.cellAt(x - 1, y - 1),
	    this.cellAt(x    , y - 1),
	    this.cellAt(x + 1, y - 1),

	    this.cellAt(x - 1, y),
	    this.cellAt(x + 1, y),

	    this.cellAt(x - 1, y + 1),
	    this.cellAt(x   ,  y + 1),
	    this.cellAt(x + 1, y + 1)];
}

Brain.prototype.render = function() {
    this.context.save();
    this.context.scale(this.scale.x, this.scale.y);
    this.context.fillStyle = this.colors.dead;
    this.context.fillRect(0, 0,
			  this.x_cells, this.y_cells,
			  this.colors.dead);
    for(var x = 0; x < this.x_cells; x++) {
	for(var y = 0; y < this.y_cells; y++) {
	    var state = this.cellAt(x, y);
	    if(state == this.state.alive) {
		this.context.fillStyle = this.colors.alive;
		this.context.fillRect(x, y, 1, 1);
	    }
	    else if(state == this.state.dying) {
		this.context.fillStyle = this.colors.dying;
		this.context.fillRect(x, y, 1, 1);
	    }
	    else {
		// Background fill color is the dead color, so do nothing
	    }
	}
    }
    this.context.restore();
}    

Brain.prototype.step = function() {
    this.render();
    this.update();
    this.swap();
}

document.addEventListener("DOMContentLoaded", Brain.begin, true);