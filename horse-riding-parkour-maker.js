let obstacles = [];
let activeObstacle = null; //Track the active obstacle
let route;
let drawRoute = false;
let toggleButton;
let movingCircle;
let playButton;
let animating = false;
let circlePosition = 0;
let speed = 0.01;
let t = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  let newButton = createButton("New obstacle");
  newButton.position(0,0);
  newButton.mousePressed(newObstacle);

  firstObstacle = new DraggableShape(width/2, height/2);
  obstacles.push(firstObstacle);

  toggleButton = createButton("Draw/Reset Route");
  toggleButton.position(100, 0);
  toggleButton.mousePressed(toggleDrawing);
  
  route = new Route();

  movingCircle = new MovingCircle();

  playButton = createButton("Play Animation");
  playButton.position(250, 0);
  playButton.mousePressed(toggleAnimation);

  rectMode(RADIUS);
  strokeWeight(2);
}

function draw() {
  background(237, 34, 93);
  
  noFill();
  rect(width/2, height/2, width/2.2, height/2.2, 20);
  
  for (let obstacle of obstacles) {
    obstacle.mouseOver();
    obstacle.display();
  }
  
  route.display();
  
  if (drawRoute) {
  route.drawCurve();
  }
  
  if (animating) {
   animateCircle();
   movingCircle.display();
  }
  
}

function toggleDrawing() {
 drawRoute = !drawRoute; 
 animating = false;
   // If toggling off and there are points, add the last point to the route
   if (!drawRoute && route.points.length > 0) {
    route.addPoint(route.points[route.points.length - 1].x, route.points[route.points.length - 1].y);
  } else if (drawRoute) {
   route.reset(); 
  }
}

function newObstacle() {
  drawRoute = false;
  if (!drawRoute && route.points.length > 0) {
    route.addPoint(route.points[route.points.length - 1].x, route.points[route.points.length - 1].y);
  } 
  
 obstacle = new DraggableShape(width/2, height/2);
 
 if (obstacle) {
   obstacles.push(obstacle);
 }
}

function mousePressed() {
  
 // Check if any obstacle is currently active
  if (activeObstacle) {
    // If an obstacle is already active, release it before selecting a new one
    activeObstacle.mouseReleased();
    activeObstacle = null;
  }

  // Check if the mouse is over any obstacle and set it as the active obstacle
  for (let obstacle of obstacles) {
    if (obstacle.over || obstacle.cOver) {
      activeObstacle = obstacle;
      obstacle.mousePressed();
      break; // Only select the first obstacle found (in case of overlapping)
    }
  }
  
  // Check if the mouse is NOT inside the button area and drawing is enabled
  if (drawRoute && mouseY>20) {
    route.addPoint(mouseX, mouseY);
  }
}

function mouseDragged() {
  // If an obstacle is active, only it will respond to mouseDragged
  if (activeObstacle) {
    activeObstacle.mouseDragged();
    drawRoute = false;
    route.addPoint(route.points[route.points.length - 1].x, route.points[route.points.length - 1].y);
  }
}

function mouseReleased() {
  // If an obstacle is active, only it will respond to mouseReleased
  if (activeObstacle) {
    activeObstacle.mouseReleased();
    activeObstacle = null;
  }
  
}

function toggleAnimation() {
  
  // End the route before starting animation
  drawRoute = false;
 
  route.addPoint(route.points[route.points.length - 1].x, route.points[route.points.length - 1].y);
  
  if (animating) {
    // If animation is already playing, reset the animation and start again
    circlePosition = 0;
    t = 0;
  } else {
    // If animation is not playing, start from the current circle position
    animating = true;
    t = 0;
    circlePosition = 0;
  }
}

function sampleCurvePoints() {
  // Sample points along the curve using curvePoint()
  sampledPoints = [];
  for (let i = 0; i < route.points.length - 3; i += 1) {
    for (let j = 0; j <= 1; j += 0.05) {
      let x = curvePoint(
        route.points[i].x,
        route.points[i + 1].x,
        route.points[i + 2].x,
        route.points[i + 3].x,
        j
      );
      let y = curvePoint(
        route.points[i].y,
        route.points[i + 1].y,
        route.points[i + 2].y,
        route.points[i + 3].y,
        j
      );
      sampledPoints.push(createVector(x, y));
    }
  }
}


function animateCircle() {
  if (route.points.length >= 4) {
    // Sample points along the curve
    sampleCurvePoints();

    // Get the current position from the sampled points array
    let currentPos = sampledPoints[floor(t)];

    // Set the position of the moving circle
    movingCircle.setPosition(currentPos.x, currentPos.y);

    // Move t along the route at a constant speed
    t += 0.5;
    if (t >= sampledPoints.length - 1) {
      // Stop the animation when the end of the route is reached
      t = sampledPoints.length - 1;
      animating = false;
    }
  }
}


class Route {
  constructor() {
    this.points = [];
  }

  addPoint(x, y) {
    // Add the first point twice at the beginning of the points array
    if (this.points.length === 0) {
      this.points.push(createVector(x, y));
      this.points.push(createVector(x, y));
    } else {
      this.points.push(createVector(x, y));
    }
  }

  reset() {
    // Clear all the points from the route
    this.points = [];
  }

  display() {
    noFill();
    stroke(255);
    strokeWeight(2);

    // Draw the curve using curveVertex()
    beginShape();
    for (let i = 0; i < this.points.length; i++) {
      let x1 = this.points[i].x;
      let y1 = this.points[i].y;

      // Draw a circle at each point
      ellipse(x1, y1, 5);

      curveVertex(x1, y1);
    }

    // Extend the curve to include the mouse position as the next point
    if (drawRoute == true) {
    let currentX = mouseX;
    let currentY = mouseY;
    ellipse(currentX, currentY, 5);
    curveVertex(currentX, currentY);
    }
    endShape();
  }
  
    drawCurve() {
    noFill();
    stroke(255);
    strokeWeight(2);

    // Draw the curve using curve()
    beginShape();
    for (let i = 0; i < this.points.length; i++) {
      let x1 = this.points[i].x;
      let y1 = this.points[i].y;
      curveVertex(x1, y1);
    }
    endShape();
  }
  
}

class MovingCircle {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.diameter = 20;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  display() {
    fill(255);
    ellipse(this.x, this.y, this.diameter);
  }
}

class DraggableShape {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 75;
    this.height = 10;
    this.cx = x + width - 10;
    this.cy = y + height - 10;
    this.csize = 20;
    this.over = false;
    this.cOver = false;
    this.locked = false;
    this.cLocked = false;
    this.xOffset = 0.0;
    this.yOffset = 0.0;
    this.angle = 0.0;
  }

  display() {
    
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    
    if (this.over && this.locked) {
      stroke(255);
      fill(255);
    } else if (this.over) {
      stroke(255);
      fill(244, 122, 158);
    } else {
      stroke(156, 39, 176);
      fill(244, 122, 158);
    }

    rect(0, 0, this.width, this.height);
    
    if (this.cOver && this.cLocked) {
      stroke(255);
      fill(255);
    } else if (this.cOver) {
      stroke(255);
      fill(244, 122, 158);
    } else {
      stroke(156, 39, 176);
      fill(244, 122, 158);
    }
    
    ellipse(this.width - 10, this.height - 10, this.csize)
    
    pop();
  }

  mouseOver() {    
    // Get the mouse position relative to the center of the square
    let mx = mouseX - this.x;
    let my = mouseY - this.y;

    // Apply the inverse rotation to get the mouse position in the original coordinate system
    let cosAngle = cos(-this.angle);
    let sinAngle = sin(-this.angle);
    let rotatedMouseX = mx * cosAngle - my * sinAngle;
    let rotatedMouseY = mx * sinAngle + my * cosAngle;
    
    // Calculate the hitbox boundaries for the square and circle
    let circleHitboxX = this.width - 10 - this.csize / 2;
    let circleHitboxY = this.height - 10 - this.csize / 2;

    // Check if the mouse is inside the square or the circle
    if (this.cLocked == true) {
      this.cOver = true;
      this.over = false;
    } else if (
      rotatedMouseX > circleHitboxX - this.csize/2 &&
      rotatedMouseX < circleHitboxX + this.csize &&
      rotatedMouseY > circleHitboxY - this.csize/2 &&
      rotatedMouseY < circleHitboxY + this.csize
    ) {
     this.cOver = true;
     this.over = false;
    } else if (
      rotatedMouseX > -this.width &&
      rotatedMouseX < this.width &&
      rotatedMouseY > -this.height &&
      rotatedMouseY < this.height
    ) {
     this.over = true;
     this.cOver = false;
    } else {
      this.over = false;
      this.cOver = false;
  }
  }
  
  mousePressed() {
    if (this.over) {
      this.locked = true;
      this.xOffset = mouseX - this.x;
      this.yOffset = mouseY - this.y;
    } else if (this.cOver) {
      this.cLocked = true;
    } else {
      this.locked = false;
    }
  }

  mouseDragged() {
    if (this.locked) {
      this.x = mouseX - this.xOffset;
      this.y = mouseY - this.yOffset;
      this.cx = mouseX - this.xOffset + this.width - 10;
      this.cy = mouseY - this.yOffset + this.height - 10;
    } else if (this.cLocked) {
      this.angle = atan2(mouseY - this.y, mouseX - this.x);
    }
  }

  mouseReleased() {
    this.locked = false;
    this.cLocked = false;
  }
}
