/* jslint browser: true */

function Brain(x_cells, y_cells) {
    this.canvas = document.getElementById('brain');
    this.x_cells = x_cells;
    this.y_cells = y_cells;
    this.scale = {x: this.canvas.width / this.x_cells,
		  y: this.canvas.height / this.y_cells};
    
    this.cells = [];
    for(var x = 0; x < this.x_cells * this.y_cells; x++) {
	var state = Math.random() > 0.5 ? Brain.state.dead : Brain.state.alive;
	this.cells[x] = state;
    }

    //Clone array;
    this.work = this.cells.slice();

    this.ind = [];
}

Brain.colors = {dead: 'black', dying: 'grey', alive: 'white'};
Brain.state = {dead: 0, dying: 1, alive: 2};

Brain.prototype.cellWidth = function() {
    return this.canvas.width / this.x_cells;
};

Brain.prototype.cellHeight = function() {
    return this.canvas.height / this.y_cells;
};

Brain.prototype.setCell = function(x, y, state) {
    this.cells[this.cellIndex(x,y)] = state;
};

Brain.prototype.togglePause = function() {
    this.running = !this.running;
};

Brain.prototype.swap = function() {
    var temp = this.cells;
    this.cells = this.work;
    this.work = temp;
};

Brain.prototype.update = function() {
    for(var x = 0; x < this.x_cells; x++) {
	for(var y = 0; y < this.y_cells; y++) {
	    this.updateCell(x, y);
	}
    }
};

Brain.prototype.updateCell = function(x, y) {
    var cell = this.cellAt(x, y);
    var n = this.mooreNeighborhood(x, y);
    var alive = n.reduce(
	function(prev, cur, index, array) {
	    return prev + (cur == Brain.state.alive ? 1 : 0);
	}, 0);
    var state;
    
    if(cell == Brain.state.alive) {
	state = Brain.state.dying;
    }
    else if(cell == Brain.state.dying) {
	state = Brain.state.dead;
    }
    else if(alive == 2 /* cell == dead implied */) {
	state = Brain.state.alive;
    } else {
	state = cell;
    }
    this.work[this.cellIndex(x, y)] = state;    
};

Brain.prototype.cellAt = function(x, y) {
    return this.cells[this.cellIndex(x, y)];
};

Brain.prototype.cellIndex =  function(x, y) {
    var mod = function(x, m) { return (((x % m) + m) % m); };
    return mod(y, this.y_cells) * this.x_cells + mod(x, this.x_cells);
};

Brain.prototype.mooreNeighborhood = function(x, y) {
    return [this.cellAt(x - 1, y - 1),
	    this.cellAt(x    , y - 1),
	    this.cellAt(x + 1, y - 1),

	    this.cellAt(x - 1, y),
	    this.cellAt(x + 1, y),

	    this.cellAt(x - 1, y + 1),
	    this.cellAt(x   ,  y + 1),
	    this.cellAt(x + 1, y + 1)];
};

Brain.prototype.render = function(context) {
    context.save();
    context.scale(this.scale.x, this.scale.y);
    context.fillStyle = Brain.colors.dead;
    context.fillRect(0, 0, this.x_cells, this.y_cells, Brain.colors.dead);
    for(var x = 0; x < this.x_cells; x++) {
	for(var y = 0; y < this.y_cells; y++) {
	    var state = this.cellAt(x, y);
	    if(state == Brain.state.alive) {
		context.fillStyle = Brain.colors.alive;
		context.fillRect(x, y, 1, 1);
	    }
	    else if(state == Brain.state.dying) {
		context.fillStyle = Brain.colors.dying;
		context.fillRect(x, y, 1, 1);
	    }
	    // else background fill color is the dead color, so do nothing
	}
    }
    context.restore();
};   

Brain.prototype.step = function(context) {
    this.update();
    this.swap();
};

function Simulation(x, y) {
    this.brain = new Brain(x, y);
    this.interval = 10;
    this.handle = null;
    this.running = true;
    this.context = document.getElementById("brain").getContext("2d");

    document.getElementById("xdim").value = this.brain.x_cells;
    document.getElementById("ydim").value = this.brain.y_cells;
    document.getElementById("interval").value = this.interval;
    var restart = document.getElementById("restart");
    var self = this;
    restart.addEventListener("click", function(e) {
	var x = document.getElementById("xdim").valueAsNumber;
	var y = document.getElementById("ydim").valueAsNumber;
	self.interval = document.getElementById("interval").valueAsNumber;
	self.reset(x, y);
    }, false);

    var btn = document.getElementById("pause");
    btn.addEventListener("click", function(e) {
	self.toggleRun();
    }, false);

    var brain = document.getElementById("brain");
    brain.addEventListener("click", function(e) {
	var pt = self.userPointToCell(e.clientX, e.clientY);
	self.brain.setCell(pt.x, pt.y, Brain.state.alive);
	self.brain.render(self.context);
    }, false);

    brain.addEventListener("mousemove", function(e) {
	var pt = self.userPointToCell(e.clientX, e.clientY);
	self.cursor = pt;
	self.render();
    }, false);

    brain.addEventListener("mouseout", function(e) {
	self.cursor = null;
    }, false);
}

Simulation.prototype.userPointToCell = function(x_loc, y_loc) {
    var brain = document.getElementById("brain");
    var bound = brain.getBoundingClientRect();
    var cx = x_loc - bound.left;
    var cy = y_loc - bound.top;    
    return {x: Math.floor(cx / this.brain.cellWidth()),
	    y: Math.floor(cy / this.brain.cellHeight())};
};

Simulation.prototype.render = function() {
    this.brain.render(this.context);

    if(this.cursor) {
	var w = this.brain.cellWidth();
	var h = this.brain.cellHeight();
	var sx = this.brain.scale.x;
	var sy = this.brain.scale.y;
	this.context.strokeStyle = "yellow";
	this.context.strokeRect(this.cursor.x * sx,
				this.cursor.y * sy,
				w, h);
    }

};

Simulation.prototype.step = function() {
    this.brain.step();
    this.render();
};

Simulation.prototype.run = function() {
    var self = this;
    var fn = function(e) { self.step(); };
    this.handle = window.setInterval(fn, this.interval);
    this.running = true;
};

Simulation.prototype.pause = function() {
    window.clearInterval(this.handle);
    if(this.running) {
	this.render();
    }
    this.running = false;
};

Simulation.prototype.toggleRun = function() {
    if(this.running) {
	this.pause();
    }
    else {
	this.run();
    }
};

Simulation.prototype.reset = function(x, y) {
    this.pause();
    this.brain = new Brain(x, y);
    this.run();
};

Simulation.begin = function() { 
    var sim = new Simulation(50, 50);
    sim.run();
};

document.addEventListener("DOMContentLoaded", Simulation.begin, true);