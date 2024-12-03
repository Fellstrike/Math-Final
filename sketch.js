let cutOrderList;
let colors;
let buffer;

let copyX, copyY, copyWidth, copyHeight, copyRotate, speedX, speedY;

// Ratio-based scaling and timing
let depths = [2, 6, 8]; // Recursive depths
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

  buffer = createGraphics(width, height);
  buffer.background(255);
  divideCanvas(buffer, 0, 0, width, height, cutOrderList, "vertical", 8);
}

function draw() {
  background(55);
  tint(255, 127);

  // Draw the original buffer
  image(buffer, width * 0.25, height * 0.25, width * 0.5, height * 0.5);

  // Draw shifted and scaled copies
  drawTranslatedBuffers();
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
function divideCanvas(graphics, x, y, w, h, cutOrder, direction, curDepth) {
  if (curDepth <= 0) return;

  let ratios = random(cutOrder);
  let total = ratios[0] + ratios[1] + ratios[2];
  let sizes = ratios.map(r => (direction === "vertical" ? (h * r) / total : (w * r) / total));

  // Assign recursive depths using the ratio
  let sectionDepths = [depths[0], depths[1], depths[2]];

  // Distribute colors proportionally
  let colorSegments = [
    colors.slice(0, 1),     // 1 color for the smallest section
    colors.slice(1, 4),     // 3 colors for the medium section
    colors.slice(4, 8),     // 4 colors for the largest section
  ];

  for (let i = 0; i < 3; i++) {
    let newX = direction === "vertical" ? x : x + (i > 0 ? sizes.slice(0, i).reduce((a, b) => a + b) : 0);
    let newY = direction === "vertical" ? y + (i > 0 ? sizes.slice(0, i).reduce((a, b) => a + b) : 0) : y;
    let newW = direction === "vertical" ? w : sizes[i];
    let newH = direction === "vertical" ? sizes[i] : h;

    let randomColor = random(colorSegments[i]);

    graphics.fill(randomColor);
    graphics.stroke(0);
    graphics.rect(newX, newY, newW, newH);

    let nextDirection = direction === "vertical" ? "horizontal" : "vertical";
    divideCanvas(graphics, newX, newY, newW, newH, cutOrder, nextDirection, curDepth - sectionDepths[i]);
  }
}

// Draw and animate buffer copies
function drawTranslatedBuffers() {
  for (let i = 0; i < copyX.length; i++) {
    let scaleIndex = i < 1 ? 0 : i < 4 ? 1 : 2;

    push();
    translate(copyX[i], copyY[i]);
    rotate(copyRotate[i]);
    image(buffer, 0, 0, copyWidth[i] * scales[scaleIndex], copyHeight[i] * scales[scaleIndex]);
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
