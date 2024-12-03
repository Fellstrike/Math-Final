//setup and division arrays
let cutOrderList, colors, buffer, bufferCount;
//variables
let copyX, copyY, copyWidth, copyHeight, copyRotate, speedX, speedY;

let numRatios = true; //keeps track if the ratios shoud be labeled or not.

// Ratio-based scaling and timing
let depths = [1, 3, 4]; // Recursive depths
let scales = [1, 0.75, 0.5]; // Scaling for large, medium, small sections
let rotationDelays = [30, 15, 5]; // Rotation speeds for large, medium, small sections

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(60);

  // Define an 8-color palette
  colors = [
    color(255, 0, 0, 125),    // Red
    color(0, 255, 0, 125),    // Green
    color(0, 0, 255, 125),    // Blue
    color(255, 255, 0, 125),  // Yellow
    color(255, 0, 255, 125),  // Purple
    color(0, 255, 255, 125),  // Teal
    color(128, 0, 128, 125),  // Indigo
    color(255, 165, 0, 125),  // Orange
  ];

  initializeCopyAttributes();

  cutOrderList = generateCutOrder();

  bufferCount = createGraphics(width, height);
  bufferCount.background(255);

  buffer = createGraphics(width, height);
  buffer.background(255);
  divideCanvas(bufferCount, buffer, 0, 0, width, height, cutOrderList, "vertical", 5);
}

function draw() {
  background(55);
  tint(255, 127);

  if (numRatios) {
  // Draw the background ratio.
  image(bufferCount, width * 0.001, height * 0.001, width * 0.99, height * 0.99);

  // Draw the non-numbered and moving images
  drawTranslatedBuffers(bufferCount);
  }
   {
    // Draw the background ratio.
    image(buffer, width * 0.001, height * 0.001, width * 0.99, height * 0.99);
  
    // Draw the non-numbered and moving images
    drawTranslatedBuffers(buffer);
    }
}

// Initialize attributes for 8 moving pieces
function initializeCopyAttributes() {
  copyX = Array(8).fill(0).map(() => random(width));
  copyY = Array(8).fill(0).map(() => random(height));
  copyWidth = [
    width * 0.5,  // Large piece
    width * 0.25, width * 0.25, width * 0.25, // Medium pieces
    width * 0.125, width * 0.125, width * 0.125, width * 0.125, // Small pieces
  ];
  copyHeight = [
    height * 0.5, // Large piece
    height * 0.25, height * 0.25, height * 0.25, // Medium pieces
    height * 0.125, height * 0.125, height * 0.125, height * 0.125, // Small pieces
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
function divideCanvas(graphicsC, graphics, x, y, w, h, cutOrder, direction, curDepth) {
  if (curDepth <= 0) return;

  let ratios = random(cutOrder);
  let total = ratios[0] + ratios[1] + ratios[2];
  let sizes = ratios.map(r => (direction === "vertical" ? (h * r) / total : (w * r) / total));

  // Assign recursive depths using the ratio
  let sectionDepths = [depths[0], depths[1], depths[2]];

  for (let i = 0; i < 3; i++) {
    let newX = direction === "vertical" ? x : x + (i > 0 ? sizes.slice(0, i).reduce((a, b) => a + b) : 0);
    let newY = direction === "vertical" ? y + (i > 0 ? sizes.slice(0, i).reduce((a, b) => a + b) : 0) : y;
    let newW = direction === "vertical" ? w : sizes[i];
    let newH = direction === "vertical" ? sizes[i] : h;

    let randomColor = random(colors);
    let textColor = getContrastingTextColor(randomColor); // Determine text color

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
    divideCanvas(graphicsC, graphics, newX, newY, newW, newH, cutOrder, nextDirection, curDepth - sectionDepths[i]);
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


// Draw and animate buffer copies
function drawTranslatedBuffers(graphicBuf) {
  for (let i = 0; i < copyX.length; i++) {
    let scaleIndex = i < 1 ? 0 : i < 4 ? 1 : 2;

    push();
    translate(copyX[i], copyY[i]);
    rotate(copyRotate[i]);
    image(graphicBuf, 0, 0, copyWidth[i] * scales[scaleIndex], copyHeight[i] * scales[scaleIndex]);
    pop();

    // Animate positions
    copyX[i] += speedX[i];
    copyY[i] += speedY[i];

    // Wrap positions when leaving canvas
    if (copyX[i] - copyWidth[i] > width) copyX[i] = -copyWidth[i];
    else if (copyX[i] + copyWidth[i] < 0) copyX[i] = width;

    if (copyY[i] - copyHeight[i] > height) copyY[i] = -copyHeight[i];
    else if (copyY[i] + copyHeight[i] < 0) copyY[i] = height;

    // Update rotation at different speeds
    if (frameCount % rotationDelays[scaleIndex] === 0) {
      copyRotate[i] += (i % 2 === 0 ? 0.01 : -0.01);
    }
  }
}

function keyPressed() {
  if (key === 'r') setup();
  else if (key === ' ') numRatios = !numRatios;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}