//setup and division arrays
let cutOrderList, colors, buffer, bufferCount, colorPalette;

//variables
let origX, origY, origW, origH, copyX, copyY, copyWidth, copyHeight, copyRotate, speedX, speedY;

let numRatios = false; //keeps track if the ratios shoud be labeled or not.
let paused = false; //keeps track if things should be moving or not.
let hidden = false; //hides or unhides the control prompt.

// Ratio-based scaling and timing
let scales = [1.2, 0.9, 0.3]; // Scaling for large, medium, small sections
let rotationDelays = [0.25, 0.75, 1]; // Rotation speeds for large, medium, small sections

let vidCap;

function setup() {
  createCanvas(windowWidth, windowHeight);

  vidCap = createCapture(VIDEO);
  vidCap.size(width, height);
  vidCap.hide();

  imageMode(CENTER);

  // Define an 8-color palette
  colors = [
    color(255, 0, 0, 125),    // Red
    color(0, 255, 0, 125),    // Green
    color(0, 0, 255, 125),    // Blue
    color(255, 255, 0, 125),  // Yellow
    color(255, 0, 255, 125),  // Purple
    color(0, 255, 255, 125),  // Teal
    color(128, 0, 255, 125),  // Indigo
    color(255, 128, 0, 125),  // Orange
		 color(0, 255, 128, 125)   // mint
  ];

  colorPalette = [];

  let shuffledColors = shuffle(colors); //randomizes colors

  initializeCopyAttributes();

  cutOrderList = generateCutOrder();

  bufferCount = createGraphics(width, height);
  bufferCount.background(255);

  buffer = createGraphics(width, height);
  buffer.background(255);
  divideCanvas(bufferCount, buffer, 0, 0, width, height, cutOrderList, "vertical", 12, shuffledColors);
}

function draw() {
  image(vidCap, width/2, height/2);
  //filter(INVERT);
  
  tint(255, 127);

  if (numRatios) {
  // Draw the background ratio.
  image(bufferCount, origX, origY, origW, origH);

  // Draw the non-numbered and moving images
  drawTranslatedBuffers(bufferCount);
  }
  else {
    // Draw the background ratio.
    image(buffer, origX, origY, origW, origH);
  
    // Draw the non-numbered and moving images
    drawTranslatedBuffers(buffer);
    }
	
	if (!hidden) {
			textAlign(RIGHT, TOP);
			textSize(height*0.03);
			fill(255, 255, 255, 125);
			text("Press Spacebar to show some of the math.", width * 0.99, height * 0.01);
			text("Press 'P' to pause movement.", width * 0.99, height * 0.05);
			text("Press 'R' to Reload the Sketch.", width * 0.99, height	* 0.09);
			text("Press 'H' to Hide this.", width * 0.99, height * 0.13);
	}
}

// Initialize attributes for 8 moving pieces
function initializeCopyAttributes() {
  origX = width * 0.5;
  origY = height * 0.5;
  origW = width * 0.99;
  origH = height * 0.99;

  copyX = Array(8).fill(0).map(() => random(width));
  copyY = Array(8).fill(0).map(() => random(height));
  
  copyWidth = [
    origW * 0.5,  // Large piece
    origW * 0.25, origW * 0.25, origW * 0.25, // Medium pieces
    origW * 0.125, origW * 0.125, origW * 0.125, origW * 0.125, // Small pieces
  ];
  
  copyHeight = [
    origH * 0.5, // Large piece
    origH * 0.25, origH * 0.25, origH * 0.25, // Medium pieces
    origH * 0.125, origH * 0.125, origH * 0.125, origH * 0.125, // Small pieces
  ];
  
  speedX = Array(8).fill(0).map(() => random(-4, 4));
  speedY = Array(8).fill(0).map(() => random(-4, 4));
  copyRotate = Array(8).fill(0).map(() => random(0, 360));
}

// Generate cut order for subdivisions
function generateCutOrder() {
  return [
    [1, 3, 4],
    [1, 4, 3],
    [4, 1, 3],
    [4, 3, 1],
    [3, 4, 1],
    [3, 1, 4],
  ];
}

// Recursive canvas division
function divideCanvas(graphicsC, graphics, x, y, w, h, cutOrder, direction, curDepth, shColors) {
  if (curDepth <= 0) return;

  // Refresh the color palette for each divideCanvas call
  if (colorPalette.length <= 0) {
    colorPalette = prepareColorPalette(shColors);
  }

  let ratios = random(cutOrder);
  let total = ratios[0] + ratios[1] + ratios[2];
  let sizes = ratios.map(r => (direction === "vertical" ? (h * r) / total : (w * r) / total));

  for (let i = 0; i < 3; i++) {
    let newX = direction === "vertical" ? x : x + (i > 0 ? sizes.slice(0, i).reduce((a, b) => a + b) : 0);
    let newY = direction === "vertical" ? y + (i > 0 ? sizes.slice(0, i).reduce((a, b) => a + b) : 0) : y;
    let newW = direction === "vertical" ? w : sizes[i];
    let newH = direction === "vertical" ? sizes[i] : h;

    // Assign a color from the shuffled palette
    let randomColor = colorPalette.pop(); // Use a color
    if (!randomColor) {
      //console.error("Palette is empty or invalid at depth", curDepth);
      colorPalette = prepareColorPalette(shColors); // Assign fallback
      randomColor = colorPalette.pop();
    }
    let textColor = getContrastingTextColor(randomColor);

    graphics.fill(randomColor);
    graphics.stroke(0);
    graphics.rect(newX, newY, newW, newH);

    graphicsC.fill(randomColor);
    graphicsC.stroke(0);
    graphicsC.rect(newX, newY, newW, newH);

    // Set text properties
    graphicsC.fill(textColor);
    graphicsC.textSize((sizes[0] + sizes[1] + sizes[2]) * 0.05);
    graphicsC.textAlign(CENTER, CENTER);
    graphicsC.text(ratios[i], newX + newW / 2, newY + newH / 2);

    let nextDirection = direction === "vertical" ? "horizontal" : "vertical";
    divideCanvas(graphicsC, graphics, newX, newY, newW, newH, cutOrder, nextDirection, curDepth -(6/ratios[i]), shColors);
  }
}


// Function to calculate contrasting text color
function getContrastingTextColor(bgColor) {
  // Convert p5.js color to RGB
  let r = red(bgColor);
  let g = green(bgColor);
  let b = blue(bgColor);

  // Calculate luminance
  let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black or white based on luminance
  return luminance > 0.5 ? color(0) : color(255);
}

function prepareColorPalette(shuffledColors) {
  let colorRatios = [4, 3, 1]; // The 4:3:1 ratio
  let expandedColors = [];

  //console.log(shuffledColors);

  // Repeat colors according to the ratio
  for (let i = 0; i < shuffledColors.length; i++) {
    for (let j = 0; j < colorRatios[i % colorRatios.length]; j++) {
      expandedColors.push(shuffledColors[i]);
    }
  }

  // Shuffle the colors to create a randomized palette
  return shuffle(expandedColors);
}

// Draw and animate buffer copies
function drawTranslatedBuffers(graphicBuf) {
  for (let i = 0; i < copyX.length; i++) {
    let scaleIndex = i < 1 ? 0 : i < 4 ? 1 : 2;

    let textY;

    push();
    translate(copyX[i], copyY[i]);
    fill(20);
    if (numRatios) {
      switch(i) {
        case 0:
          textY = copyHeight[i] * 0.7;
          break;
        case 1:
        case 2:
        case 3:
          textY = copyHeight[i] * 0.75;
          break;
        case 4:
        case 5:
        case 6:
        case 7:
          textY = copyHeight[i] * 0.7;
          break;
      }
      let deltaX = copyX[i] - origX;
      let deltaY = copyY[i] - origY;
      
      // Avoid division by zero when calculating slope
      let slope = deltaX !== 0 ? deltaY / deltaX : Infinity;
      let yIntercept = deltaX !== 0 ? origY - slope * origX : "undefined";
      
      // Format slope and intercept for clarity
      let slopeText = deltaX !== 0 ? `${round(slope, 2)}` : "undefined";
      let interceptText = deltaX !== 0 ? `${round(yIntercept, 2)}` : "undefined";
      
      // Print the equation
      let lineEquation = `y = ${slopeText}x + ${interceptText}`;
      text(`Line Equation: ${lineEquation}`, 0, -textY);
      text("Scale: " + copyWidth[i]/origW + " Translation:: (" + round(copyX[i] - origX, 2) + ", " + round(copyY[i] - origY, 2) +')', 0, -textY * 0.88);
      text("Rotation: " + round(copyRotate[i], 1), 0, -textY * 0.77);
    }

    rotate(copyRotate[i]);
    image(graphicBuf, 0, 0, copyWidth[i] * scales[scaleIndex], copyHeight[i] * scales[scaleIndex]);
    pop();

    // Animate positions
    if (!paused) {
      copyX[i] += speedX[i];
      copyY[i] += speedY[i];

      // Wrap positions when leaving canvas
      if (copyX[i] - copyWidth[i] > width) copyX[i] = -copyWidth[i] + (copyX[i] - width);
      else if (copyX[i] + copyWidth[i] < 0) copyX[i] = width - (copyWidth[i] + copyX[i]);

      if (copyY[i] - copyHeight[i] > height) copyY[i] = -copyHeight[i] + (copyY[i] - height);
      else if (copyY[i] + copyHeight[i] < 0) copyY[i] = height - (copyHeight[i] + copyY[i]);

      // Update rotation at different speeds
      let rotationSpeed = 0.01 * rotationDelays[scaleIndex];
      copyRotate[i] += (i % 2 === 0 ? rotationSpeed : -rotationSpeed);
    }
  }
}

function mousePressed() {
  if (mousePressed === LEFT) numRatios = !numRatios;
  else if (mousePressed === RIGHT) paused = !paused;
  else if (mousePressed === CENTER) {
    colorPalette = null;
    setup();
  }
}

function touchStarted() {
  switch (touches.length) {
    case 1:
      numRatios = !numRatios;
      break;
    case 2:
      paused = !paused;
      break;
  }
}

function keyPressed() {
  if (key === 'r') {
    colorPalette = null;
    setup();
  }
  else if (key === ' ') numRatios = !numRatios;
  else if (key === 'p') paused = !paused;
	else if (key === 'h') hidden = !hidden;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  colorPalette = null;
  initializeCopyAttributes();
}