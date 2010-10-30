function Brain() {
    this.state = {dead: 0, dying: 1, alive: 2};
    this.cell_width = 25;
    this.cell_height = 25;
    this.canvas = undefined;
    this.context = undefined;
    this.cells = [];
    this.work = [];
    
    this.colors = {dead: 'black', dying: 'grey', alive: 'white'};
}

Brain.begin = function() { 
    var brain = new Brain();
    brain.init();
    brain.step();
    window.setInterval(brain.step, 1000);
}

Brain.prototype.init = function() {
	this.canvas = document.getElementById('brain');
	this.context = this.canvas.getContext('2d')
	this.x_cells = this.canvas.getAttribute('width') / this.cell_width;
	this.y_cells = this.canvas.getAttribute('height') / this.cell_height;
	
	this.context.scale(this.canvas.width / this.x_cells,
			   this.canvas.height / this.y_cells);
	this.context.fillStyle = this.colors.dead;
	
	var x;
	for(x = 0; x < this.x_cells * this.y_cells; x++) {
	    this.cells[x] = this.state.dead;
	}
	//Clone array;
	this.work = this.cells.slice();
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
    var alive = n.reduce(function(c) { c == that.state.alive; });
    var state = undefined;
    
    if(cell.state == this.state.alive) {
	state = this.state.dying;
    }
    else if(cell.state == this.state.dying) {
	state = this.state.dead;
    }
    else if(alive == 2) {
	state = this.state.alive;
    }
    this.work[this.cellIndex(x, y)] = state;    
}

Brain.prototype.cellAt = function(x, y) {
    return this.cells[this.cellIndex(x, y)];
}

Brain.prototype.cellIndex =  function(x, y) {
    var x = Math.abs(x) % this.x_cells;
    var y = Math.abs(y) % this.y_cells;
    return y * this.x_cells + x;
}

Brain.prototype.mooreNeighborhood = function(x, y) {
    return [this.cellAt(x - 1, y + 1),
	    this.cellAt(x    , y + 1),
	    this.cellAt(x + 1, y + 1),
	    this.cellAt(x - 1, y),
	    this.cellAt(x + 1, y),
	    this.cellAt(x - 1, y - 1),
	    this.cellAt(x - 1, y),
	    this.cellAt(x - 1, y + 1)];
}

Brain.prototype.render = function() {
    this.context.fillRect(0, 0,
			  this.x_cells, this.y_cells,
			  this.colors.dead);
    for(var x = 0; x < this.x_cells; x++) {
	for(var y = 0; y < this.y_cells; y++) {
	    var state = this.cellAt(x, y);
	    if(state == this.state.alive) {
		this.context.fillRect(x, y, 1, 1, this.colors.alive);
	    }
	    else if(state == this.state.dying) {
		this.context.fillRect(x, y, 1, 1, this.colors.dying);
	    }
	    else {
		// Background fill color is the dead color, so do nothing
	    }
	}
    }
}    

Brain.prototype.step = function() {
	this.update();
	this.swap();
	this.render();
}

document.addEventListener("DOMContentLoaded", Brain.begin, true);