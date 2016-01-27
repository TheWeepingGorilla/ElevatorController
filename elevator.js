var labelYellow = '#B9C71A';
var controlRed = '#DE0747';
var controlGreen = '#1AC793';

function Elevator(args) {
	this.currentFloor = 0;
	this.numberOfFloors = args.floors;
	this.floorArray = new Array(this.numberOfFloors);
	this.direction = 'up';
	this.moving = false;
	this.setDirection = function(direction) {
		this.direction = direction;
	}
	this.doorTimer = 0;
	this.moveTimer = 0;
	this.items = [];
	this.floorCallsUp = [];
	this.floorCallsDown = [];
	this.cabRequests = [];
	this.setFloorCallsUp = function(itemArray) {
		this.floorCallsUp = itemArray;
	}
	this.setFloorCallsDown = function(itemArray) {
		this.floorCallsDown = itemArray;
	}
	this.setCabRequests = function(itemArray) {
		this.cabRequests = itemArray;
	}

	this.input = function() {
		// get x and y value and convert to xDiv & yDiv to find control pressed
		mouseXDiv = Math.floor((mouseX / windowWidth) * 100);
		mouseYDiv = Math.floor((mouseY / windowHeight) * 100);
		// next 4 display xDiv & yDiv - uncomment to find object screen positions
		fill(labelYellow);
		textSize(36);
		text(mouseXDiv, 800, 300);
		text(mouseYDiv, 800, 400);

		// check if current mouse position is in control array & not activated
		// timer debounces switch
		for (var i=0;i<(this.floorCallsUp.length -1);i++) {
			if ( (this.floorCallsUp[i].checkTimer() === 'expired')
			&& (this.floorCallsUp[i].xStart <= mouseXDiv)
			&& (this.floorCallsUp[i].xEnd >= mouseXDiv)
			&& (this.floorCallsUp[i].yStart <= mouseYDiv)
			&& (this.floorCallsUp[i].yEnd >= mouseYDiv)
			&& !(this.floorCallsUp[i].checkActive()) ) {
				this.floorCallsUp[i].setTimer();
				this.floorCallsUp[i].toggleActive();
				console.log(this.floorCallsUp[i].description + i + " " + this.floorCallsUp[i].checkActive());
			}
		}
		for (var i=1;i<this.floorCallsDown.length;i++) {
			if ( (this.floorCallsDown[i].checkTimer() === 'expired')
			&& (this.floorCallsDown[i].xStart <= mouseXDiv)
			&& (this.floorCallsDown[i].xEnd >= mouseXDiv)
			&& (this.floorCallsDown[i].yStart <= mouseYDiv)
			&& (this.floorCallsDown[i].yEnd >= mouseYDiv)
			&& !(this.floorCallsDown[i].checkActive()) ) {
				this.floorCallsDown[i].setTimer();
				this.floorCallsDown[i].toggleActive();
				console.log(this.floorCallsDown[i].description + i + " " + this.floorCallsDown[i].checkActive());
			}
		}
		for (var i=0;i<this.cabRequests.length;i++) {
			if ( (this.cabRequests[i].checkTimer() === 'expired')
			&& (this.cabRequests[i].xStart <= mouseXDiv)
			&& (this.cabRequests[i].xEnd >= mouseXDiv)
			&& (this.cabRequests[i].yStart <= mouseYDiv)
			&& (this.cabRequests[i].yEnd >= mouseYDiv)
			&& !(this.cabRequests[i].checkActive()) ) {
				this.cabRequests[i].setTimer();
				this.cabRequests[i].toggleActive();
				console.log(this.cabRequests[i].description + i + " " + this.cabRequests[i].checkActive());
			}
		}
	}

	this.control = function() {
		// if door is open or elevator is moving, exit the control block
		if (this.checkDoorTimer() === 'active') {
			console.log("Door Timer Active");
			return;
		};
		if (this.checkMoveTimer() === 'active') {
			console.log("Move Timer Active");
			return;
		}

		// Increase or decrease floor by one if moving and not at top or bottom
		if ((this.moving) && (this.direction === 'up') && (this.currentFloor < this.numberOfFloors - 1)) {
			this.currentFloor += 1;
			this.setMoveTimer();
			console.log("Current Floor Now " + this.currentFloor + " , Moving is " + this.moving);
		}
		if ((this.moving) && (this.direction === 'down') && (this.currentFloor > 0)) {
			this.currentFloor -= 1;
			this.setMoveTimer();
			console.log("Current Floor Now " + this.currentFloor + " , Moving is " + this.moving);
		}

		// if cab request or correct direction floor call for current floor,
		// clear floor and / or cab request, set door timer, stop moving, and exit
		if ( (this.direction === 'up') && (this.floorCallsUp[this.currentFloor].checkActive()) ) {
			this.floorCallsUp[this.currentFloor].setActive(false);
			this.cabRequests[this.currentFloor].setActive(false);
			this.setDoorTimer();
			this.moving = false;
			console.log("Door opened for Upward Passengers on " + this.currentFloor + ". Direction: " + this.direction);
			return;
		};
		if ((this.direction === 'down') && (this.floorCallsDown[this.currentFloor].checkActive()) ) {
			this.floorCallsDown[this.currentFloor].setActive(false);
			this.cabRequests[this.currentFloor].setActive(false);
			this.setDoorTimer();
			this.moving = false;
			console.log("Door opened for Downward Passengers on " + this.currentFloor + ". Direction: " + this.direction);
			return;
		};
		if (this.cabRequests[this.currentFloor].checkActive()) {
			this.cabRequests[this.currentFloor].setActive(false);
			this.setDoorTimer();
			this.moving = false;
			console.log("Door Timer Set. Service Request on " + this.currentFloor);
			return;
		};

		// if opposite direction request for current floor
		// and no same direction or cab calls above (if going up) or below (if going down)
		// reverse direction, clear request, set door timer, stop moving and exit
		// (but if there are, set move true, set move timer, and exit)
		if ((this.direction === 'up') && (this.floorCallsDown[this.currentFloor].checkActive()) ) {
			if (this.currentFloor < this.numberOfFloors) {
				for (var i = this.currentFloor + 1; i < this.numberOfFloors -1; i++) {
					if ( (this.floorCallsUp[i].checkActive()) || (this.cabRequests[i].checkActive()) ) {
						this.moving = true;
						this.setMoveTimer();
						console.log("Continuing up for cab and/or floor requests in the upward direction");
						return;
					}
				}
				this.setDirection('down');
				this.floorCallsDown[this.currentFloor].setActive(false);
				this.cabRequests[this.currentFloor].setActive(false);
				this.setDoorTimer();
				this.moving = false;
				console.log("Door opened for Downward Passengers on " + this.currentFloor + ". Direction: " + this.direction);
				return;
			};
		}
		if ((this.direction === 'down') && (this.floorCallsUp[this.currentFloor].checkActive()) ) {
			if (this.currentFloor >= 0) {
				for (var i = this.currentFloor - 1; i >= 0; i--) {
					if ( (this.floorCallsDown[i].checkActive()) || (this.cabRequests[i].checkActive()) ) {
						this.moving = true;
						this.setMoveTimer();
						console.log("Continuing down for cab and/or floor requests in the downward direction");
						return;
					}
				}
				this.setDirection('up');
				this.floorCallsUp[this.currentFloor].setActive(false);
				this.cabRequests[this.currentFloor].setActive(false);
				this.setDoorTimer();
				this.moving = false;
				console.log("Door opened for Downward Passengers on " + this.currentFloor + ". Direction: " + this.direction);
				return;
			};
		}

		// find cab and floor requests above (if going up) or below (if going down)
		// if found, set moving true, set move timer and exit
		if ( (this.direction === 'up') && (this.currentFloor < this.numberOfFloors) ) {
			for (var i = this.currentFloor + 1; i < this.numberOfFloors; i++) {
				if ( (this.floorCallsUp[i].checkActive()) || (this.floorCallsDown[i].checkActive()) || (this.cabRequests[i].checkActive()) ) {
					this.moving = true;
					this.setMoveTimer();
					console.log("Moving to floor " + i + ". Direction: " + this.direction);
					return;
				};
			}
		}
		if ( (this.direction === 'down') && (this.currentFloor > 0) ) {
			for (var i = this.currentFloor - 1; i >= 0; i--) {
				if ( (this.floorCallsDown[i].checkActive()) || (this.floorCallsUp[i].checkActive()) || (this.cabRequests[i].checkActive()) ) {
					this.moving = true;
					this.setMoveTimer();
					console.log("Moving to floor " + i + ". Direction: " + this.direction);
					return;
				};
			}
		}

		// Since no requests in current direction,
		// check for requests in other direction. If found,
		// reverse direction, set moving true, set move timer, and exit
		if ( (this.direction === 'up') && (this.currentFloor > 0) ) {
			for (var i = this.currentFloor; i >= 0; i--) {
				if ( (this.floorCallsDown[i].checkActive()) || (this.floorCallsUp[i].checkActive()) || (this.cabRequests[i].checkActive()) ) {
					this.setDirection('down');
					this.moving = true;
					this.setMoveTimer();
					console.log("Moving to floor " + i + ". Direction: " + this.direction);
					return;
				};
			}
		}
		if ( (this.direction === 'down') && (this.currentFloor < this.numberOfFloors - 1) ) {
			for (var i = this.currentFloor; i < this.numberOfFloors; i++) {
				if ( (this.floorCallsDown[i].checkActive()) || (this.floorCallsUp[i].checkActive()) || (this.cabRequests[i].checkActive()) ) {
					this.setDirection('up');
					this.moving = true;
					this.setMoveTimer();
					console.log("Moving to floor " + i + ". Direction: " + this.direction);
					return;
				};
			}
		}
		// It's quiet in here. Let's tell the console that nothing is going on.
		console.log("No requests.");
		return;
	};

	this.output = function() {
		// This reads state of elevator and sets displays accordingly
		if (this.checkDoorTimer() === 'active') {
			statuses[3].setFillColor(controlGreen);
			statuses[4].setFillColor(controlRed);
		} else {
			statuses[3].setFillColor(controlRed);
			statuses[4].setFillColor(controlGreen);
		}

		if (this.checkMoveTimer() === 'expired') {
			statuses[0].setFillColor(controlRed);
			statuses[1].setFillColor(controlGreen);
			statuses[2].setFillColor(controlRed);
		}
		if ((this.checkMoveTimer() === 'active') && (this.direction === 'up')) {
			statuses[0].setFillColor(controlGreen);
			statuses[1].setFillColor(controlRed);
			statuses[2].setFillColor(controlRed);
		}
		if ((this.checkMoveTimer() === 'active') && (this.direction === 'down')) {
			statuses[0].setFillColor(controlRed);
			statuses[1].setFillColor(controlRed);
			statuses[2].setFillColor(controlGreen);
		}

		for (var i=0;i<this.numberOfFloors;i++) {
			if (i === this.currentFloor) {
				floors[i].setFillColor(controlGreen);
			} else {
				floors[i].setFillColor(controlRed);
			}
		}
	}

	// timer functions ok for demo,
	// but check overflow & limit behavior of millis() before production use
	this.setDoorTimer = function() {
		this.doorTimer = millis() + 3000;
	}

	this.checkDoorTimer = function() {
		if (this.doorTimer <= millis()) {
			return 'expired';
		} else {
			return 'active';
		}
	};

	this.setMoveTimer = function() {
		this.moveTimer = millis() + 1000;
	}

	this.checkMoveTimer = function() {
		if (this.moveTimer <= millis()) {
			return 'expired';
		} else {
			return 'active';
		}
	};
}

function Thing(args) {
	this.description = 'thing';
	this.xStart = args.xStart;
	this.yStart = args.yStart;
	this.xEnd = args.xEnd;
	this.yEnd = args.yEnd;
	this.x = args.x;
	this.y = args.y;
	this.fillColor = args.fillColor;
	this.strokeColor = args.strokeColor;
	this.active = false;
	this.timer = 0;
	this.setFillColor = function(color) {
		this.fillColor = color;
	}
	this.toggleActive = function() {
		this.active = !(this.active);
	}
	this.checkActive = function() {
		return this.active;
	};
	this.setActive = function(value) {
		this.active = value;
	}
	this.setTimer = function() {
		this.timer = millis() + 500;
	}
	this.checkTimer = function() {
		if (this.timer <= millis()) {
			return 'expired';
		} else {
			return 'active';
		}
	};
}

function Label(args) {
	Thing.call(this, args);
	this.textSize = args.textSize;
	this.text = args.text;
	this.draw = function() {
		noStroke();
		fill(this.fillColor);
		if ((args.nofill === true) && (this.active === false)) {
			stroke(this.strokeColor);
			noFill();
		}
		textSize(this.textSize);
		text(this.text, xDiv * this.x, yDiv * this.y);
	}
}

function FloorCallUp(args) {
	Thing.call(this, args);
	this.isPlaceholder = args.isPlaceholder;
	this.description = 'fcU';
	this.draw = function() {
		stroke(this.fillColor);
		if (this.active === false) {
			noFill();
		} else {
			fill(this.fillColor);
		}
		triangle(xDiv * this.x - xDiv, yDiv * this.y + yDiv,
			xDiv * this.x, yDiv * this.y - yDiv,
			xDiv * this.x + xDiv, yDiv * this.y + yDiv);
	}
}

function FloorCallDown(args) {
	Thing.call(this, args);
	this.isPlaceholder = args.isPlaceholder;
	this.description = 'fcD';
	this.draw = function() {
		stroke(this.fillColor);
		if (this.active === false) {
			noFill();
		} else {
			fill(this.fillColor);
		}
		triangle(xDiv * this.x - xDiv, yDiv * this.y - yDiv,
			xDiv * this.x, yDiv * this.y + yDiv,
			xDiv * this.x + xDiv, yDiv * this.y - yDiv);
	}
}

// -- Titles --
var titles = [];
currentFloorTitle = new Label({
	x: 8,
	y: 9,
	fillColor: labelYellow,
	strokeColor: labelYellow,
	textSize: 30,
	text: 'Location'
})
titles.push(currentFloorTitle);

floorRequestsTitle = new Label ({
	x: 8,
	y: 17,
	fillColor: labelYellow,
	strokeColor: labelYellow,
	textSize: 30,
	text: 'Floor Requests'
})
titles.push(floorRequestsTitle);

cabRequestsTitle = new Label ({
	x: 8,
	y: 26,
	fillColor: labelYellow,
	strokeColor: labelYellow,
	textSize: 30,
	text: 'In-Cab Requests'
})
titles.push(cabRequestsTitle);

statusTitle = new Label ({
	x: 8,
	y: 34,
	fillColor: labelYellow,
	strokeColor: labelYellow,
	textSize: 30,
	text: 'Status'
})
titles.push(statusTitle);

doorTitle = new Label ({
	x: 8,
	y: 42,
	fillColor: labelYellow,
	strokeColor: labelYellow,
	textSize: 30,
	text: 'Door'
})
titles.push(doorTitle);

clickTitle1 = new Label ({
	x: 66,
	y: 17,
	fillColor: labelYellow,
	strokeColor: labelYellow,
	textSize: 20,
	text: '(Click to select)'
})
titles.push(clickTitle1);

clickTitle2 = new Label ({
	x: 66,
	y: 26,
	fillColor: labelYellow,
	strokeColor: labelYellow,
	textSize: 20,
	text: '(Click to select)'
})
titles.push(clickTitle2);

// -- Statuses --
var statuses = [];
statusUp = new Label ({
	x: 35,
	y: 34,
	fillColor: controlRed,
	strokeColor: controlRed,
	textSize: 30,
	text: 'Up'
})
statuses.push(statusUp);

statusResting = new Label ({
	x: 42,
	y: 34,
	fillColor: controlRed,
	strokeColor: controlRed,
	textSize: 30,
	text: 'Resting'
})
statuses.push(statusResting);

statusDown = new Label ({
	x: 56,
	y: 34,
	fillColor: controlRed,
	strokeColor: labelYellow,
	textSize: 30,
	text: 'Down'
})
statuses.push(statusDown);

statusOpen = new Label ({
	x: 35,
	y: 42,
	fillColor: controlRed,
	strokeColor: labelYellow,
	textSize: 30,
	text: 'Open'
})
statuses.push(statusOpen);

statusClosed = new Label ({
	x: 45,
	y: 42,
	fillColor: controlRed,
	strokeColor: labelYellow,
	textSize: 30,
	text: 'Closed'
})
statuses.push(statusClosed);

// -- Floor Calls --
var floorCallsUp = [];
for (var i=0; i<9; i++) {
	floorCallsUp[i] = new FloorCallUp ({
		xStart: 3 * i + 35,
		yStart: 14,
		xEnd: 3 * i + 37,
		yEnd: 16,
		x: 3 * i + 36,
		y: 15,
		fillColor: controlGreen,
		strokeColor: controlGreen
	})
}
floorCallsUp[9] = new FloorCallUp ({
	fillColor: controlGreen,
	strokeColor: controlGreen,
	isPlaceholder: true
})

var floorCallsDown = [];
floorCallsDown[0] = new FloorCallDown ({
	fillColor: controlGreen,
	strokeColor: controlGreen,
	isPlaceholder: true
})
for (var i=1; i<=9; i++) {
	floorCallsDown[i] = new FloorCallDown ({
		xStart: 3 * i + 35,
		yStart: 17,
		xEnd: 3 * i + 37,
		yEnd: 19,
		x: 3 * i + 36,
		y: 18,
		fillColor: controlGreen,
		strokeColor: controlGreen
	})
}

// -- Floors --
var floors = [];
floors[0] = new Label ({
	x: 34.8,
	y: 9,
	fillColor: controlRed,
	strokeColor: controlRed,
	textSize: 32,
	text: 'G'
})

for (var i=1; i<10; i++) {
	floors[i] = new Label({
		x: 3 * i + 35.2,
		y: 9,
		fillColor: controlRed,
		strokeColor: controlRed,
		textSize: 32,
		text: i
	})
}

// -- Cab Requests --
var cabRequests = [];
cabRequests[0] = new Label ({
	xStart: 34,
	yStart: 23,
	xEnd: 36,
	yEnd: 25,
	x: 35,
	y: 26,
	nofill: true,
	strokeColor: controlGreen,
	fillColor: controlGreen,
	textSize: 32,
	text: 'G'
})

for (var i=1; i<10; i++) {
	cabRequests[i] = new Label({
		xStart: 3 * i + 34,
		yStart: 23,
		xEnd: 3 * i + 36,
		yEnd: 25,
		x: 3 * i + 35.2,
		y: 26,
		nofill: true,
		strokeColor: controlGreen,
		fillColor: controlGreen,
		textSize: 32,
		text: i
	})
}

elevator0 = new Elevator({floors:10});
elevator0.setFloorCallsUp(floorCallsUp);
elevator0.setFloorCallsDown(floorCallsDown);
elevator0.setCabRequests(cabRequests);

var xDiv;
var yDiv;

function setup() {
	createCanvas(windowWidth, windowHeight);
	xDiv = windowWidth * .01;
	yDiv = windowHeight * .01;
}

function draw() {
	background(0);

	for (var i=0; i<titles.length;i++) {
		titles[i].draw();
	}
	for (var i=0; i<statuses.length;i++) {
		statuses[i].draw();
	}
	for (var i=0; i<floors.length;i++) {
		floors[i].draw();
	}
	for (var i=0; i<(floorCallsUp.length - 1); i++) {
		floorCallsUp[i].draw();
	}
	for (var i=0; i<floorCallsDown.length; i++) {
		floorCallsDown[i].draw();
	}
	for (var i=0; i<cabRequests.length;i++) {
		cabRequests[i].draw();
	}

	if (mouseIsPressed) {
		elevator0.input();
	}
	elevator0.control();
	elevator0.output();
}

// auto-resize canvas to window size & recalculate divs
windowResized = function() {
	resizeCanvas(windowWidth, windowHeight);
	xDiv = windowWidth * .01;
	yDiv = windowHeight * .01;
}