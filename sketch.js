let stripes = [];           // Array to store all line stripe objects
let currentStripe = 0;      // Index of the current stripe being animated

let mode = 1;               // Drawing mode: 0 = cross pattern, 1 = parallel lines

let sevenSegmentDisplay = []; // Array to store the seven-segment display objects
let number;                 // Array to store the seven-segment display objects

let colon = []; // Array to store the colon position
let colonStripes; // fixed LineStripe object for the colon


let clockIsRunning = false; // Flag to control clock running state
let startTime=0; // Variable to store the start time
let pausedTime=0; // Variable to store the paused time
let resetTime = 0; // Variable to store the reset time



function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  // The function of millis is from -- https://p5js.org/zh-Hans/reference/p5/millis/
  startTime = millis(); // Initialize start time
  resetTime = millis(); // Initialize reset time

  let baseSize = min(width, height) ;//Which is smaller, width or height of the window?
  
  let numberWidth = baseSize*0.12;  // Width of each number segment
  let numberHeight = baseSize*0.18;// Height of each number segment
  let numberSpacing = numberWidth*1.25; // Spacing between the numbers
  
  let totalWidth = numberSpacing * 4 + numberWidth * 0.5; // Total width for four digits and three spacings
  let startX =(width - totalWidth)/2; //Starting X position for the number of minutes (ten digit)
  let startY = height / 2 - numberHeight / 2; // Starting Y position for the number of minutes

  

  for (let i = 0; i < 4; i++) { //There are 4 digits in the seven-segment display

    let x = startX + i * numberSpacing; // Calculate x position for each digit
    if (i >= 2) {x = x + numberWidth*0.5}; // Add extra spacing for the colon between minutes and seconds

    sevenSegmentDisplay.push(new SevenSegmentDisplay(x,startY,numberWidth,numberHeight)); 
    //sevenSegmentDisplay[0] = new SevenSegmentDisplay(x, height / 2 - 50, 80, 100);
    //sevenSegmentDisplay[1] = new SevenSegmentDisplay(x + spacing, height / 2 - 50, 80, 100);
    //sevenSegmentDisplay[2] = new SevenSegmentDisplay(x + spacing * 2, height / 2 - 50, 80, 100);
    //sevenSegmentDisplay[3] = new SevenSegmentDisplay(x + spacing * 3, height / 2 - 50, 80, 100);
  };

  colon[0] = startX + 2 * numberSpacing + numberWidth*0.01; // Position for the colon between minutes and seconds
  //in case need to use colon between mins and hours in the future

  colonStripes = {
    upper: new LineStripe(
      colon[0], height / 2 - numberHeight*0.2,    // x, y position
      width * 0.005,                // length - using window width proportion
      width * 0.002,                // spacing - using window width proportion
      3,                            // count - fixed number of lines
      0,                            // angle
      width * 0.003                 // baseWeight - using window width proportion
    ),
    lower: new LineStripe(
      colon[0], height / 2 + numberHeight*0.2,    // x, y position
      width * 0.005,                // length - using window width proportion
      width * 0.002,                // spacing - using window width proportion
      3,                            // count - fixed number of lines
      0,                            // angle
      width * 0.003                 // baseWeight - using window width proportion
    )
  };
  number = new Array(10); //Create an array to store the numbers 0-9
  initializeArray(); //fill the lights of the seven-segment display. The Function will be defines later.
  //These two lines reference this site-- https://www.geeksforgeeks.org/how-to-create-seven-segment-clock-using-p5-js-library/.
  //The following code will also be used subsequently for tips on this website.

}

function draw() {
  frameRate(60); // Set frame rate to 60 FPS
  background(240, 240, 225); // Clear the canvas
  
  let totalTime  
  if (clockIsRunning == true){
    totalTime = millis()- resetTime - pausedTime; // Calculate total time since start, minus any paused time
  }else {
    totalTime = startTime - resetTime - pausedTime; // If clock is not running, calculate time since reset
  }  
    
  let totalSeconds = floor(totalTime / 1000); // Convert milliseconds to seconds
  let minutes = floor(totalSeconds / 60); // Calculate minutes
  let seconds = totalSeconds % 60; // Calculate remaining seconds

  //transfer to two-digit format for minutes and seconds
  //The idea is from -- https://www.geeksforgeeks.org/how-to-create-seven-segment-clock-using-p5-js-library/
  //The use of slice(-2) id from -- https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
  let min = ("0" + minutes).slice(-2);// e.g.min = "0" +5   → "05",   "05".slice(-2) → "05"
  let sec = ("0" + seconds).slice(-2);// e.g.sec = "0" + 12 → "012", "012".slice(-2) → "12"

  //show() function is written in the class SevenSegmentDisplay.
  sevenSegmentDisplay[0].show(number[min[0]]); // Show the first digit of minutes
  sevenSegmentDisplay[1].show(number[min[1]]); // Show the second digit of minutes
  sevenSegmentDisplay[2].show(number[sec[0]]); // Show the first digit of seconds
  sevenSegmentDisplay[3].show(number[sec[1]]); // Show the second digit of seconds

  colonStripes.upper.currentLen = colonStripes.upper.len; // Set the upper colon stripe to full length
  colonStripes.upper.gray = 60; // Set the color to gray for visibility
  colonStripes.upper.displayStep(); // Draw the upper colon stripe

  colonStripes.lower.currentLen = colonStripes.lower.len; // Set the lower colon stripe to full length
  colonStripes.lower.gray = 60; // Set the color to gray for visibility
  colonStripes.lower.displayStep(); // Draw the lower colon stripe

  drawControlButtons(); // Draw UI button
}

function initializeArray() {
  // Initialize the number array with the segments for each digit

  //  f  aaa  b
  //  f       b
  //  f       b
  //     ggg
  //  e       c
  //  e       c
  //  e  ddd  c
 
  //In the order number[i] = [a,b,c,d,e,f,g]
  //If the segment is on, it is 1, and filled with gray color
  //If the segment is off, it is 0, and filled with (240, 240, 225), which is the background color.

  number[0] = [1, 1, 1, 1, 1, 1, 0]; // 0
  number[1] = [0, 1, 1, 0, 0, 0, 0]; // 1
  number[2] = [1, 1, 0, 1, 1, 0, 1]; // 2
  number[3] = [1, 1, 1, 1, 0, 0, 1]; // 3
  number[4] = [0, 1, 1, 0, 0, 1, 1]; // 4
  number[5] = [1, 0, 1, 1, 0, 1, 1]; // 5
  number[6] = [1, 0, 1, 1, 1, 1, 1]; // 6
  number[7] = [1, 1, 1, 0, 0, 0, 0]; // 7 
  number[8] = [1, 1, 1, 1, 1, 1, 1]; // 8
  number[9] = [1, 1, 1, 1, 0, 1, 1]; // 9   
  
}

class SevenSegmentDisplay {
  constructor(x, y, w, h) {
    this.x = x; // X position of the display
    this.y = y; // Y position of the display
    this.w = w; // Width of the display
    this.h = h; // Height of the display

    

    this.segmentLength = w*0.7; // Length of each segment
    this.gap = w*0.1; // Spacing between segments. The"spacing" has been used in function setup().  For the sake of clarity, we use gap here.

    this.coords = {
      //a
      a:[ x + this.gap  , 
          y , 
          x + this.gap + this.segmentLength  ,  
          y   ], 
      //b
      b:[ x + this.gap + this.segmentLength  , 
          y - h/20 , 
          x + this.gap + this.segmentLength , 
          y + h/2 - h/20 ],
      //c
      c:[ x + this.gap + this.segmentLength , 
          y + h/2 - h/20 , 
          x + this.gap + this.segmentLength , 
          y + h - h/20 ],
      //d
      d:[ x + this.gap  , 
          y + h , 
          x + this.gap + this.segmentLength   , 
          y + h ],
      //e
      e:[ x + this.gap , 
          y + h/2 - h/20 , 
          x + this.gap , 
          y + h - h/20 ],
      //f
      f:[ x + this.gap ,
          y  - h/20 , 
          x + this.gap , 
          y + h/2 - h/20 ],
      //g
      g:[ x + this.gap  , 
          y + h/2 , 
          x + this.gap + this.segmentLength  , 
          y + h/2 ]
    };

    //TEST
    console.log(`a segment's coord: [${this.coords.a}]`),
    console.log(`b segment's coord: [${this.coords.b}]`),
    console.log(`c segment's coord: [${this.coords.c}]`),
    console.log(`d segment's coord: [${this.coords.d}]`),
    console.log(`e segment's coord: [${this.coords.e}]`),
    console.log(`f segment's coord: [${this.coords.f}]`),
    console.log(`g segment's coord: [${this.coords.g}]`);   

    this.stripes = {}; // Object to store LineStripe objects for each segment
    let segments = Object.keys(this.coords); 
    /* Get the keys of the coordinates object, which are the segment names (a, b, c, d, e, f, g)
     In order to get the coordinates and the status of one of the seven segments later, I reference this feature.
     Object.key()
     https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/keys */

    //TEST
        console.log(segments); //should show ["a", "b", "c", "d", "e", "f", "g"]
    
    for (let i = 0; i < Object.keys(this.coords).length; i++) {
      let segment = Object.keys(this.coords)[i];
       //TEST
        console.log(`segment: = Object.keys(this.coords)[i] = "${segment}"`); 
        /*should do it for 7 times
          e.g. segment = Object.keys(this.coords)[0] = "a",
               segment = Object.keys(this.coords)[1] = "b", etc. */

      let coord = this.coords[segment];
        // Get the coordinates for the current segment
        //e.g. coords = this.coords["a"] = [x + this.gap, y, x + this.gap + this.segmentLength,  y   ]

      
      
      let x1 = coord[0]; //e.g. x1 = x + this.gap 
      let y1 = coord[1]; //e.g. y1 = y 
      let x2 = coord[2]; //e.g. x2 = x + this.gap -h/20 + this.segmentLength
      let y2 = coord[3]; //e.g. y2 = y 
      let len = dist(x1, y1, x2, y2); // Calculate the length of the segment. 
        /*The previous segment Length was just the line segnment being drawn.
          But since he coordinates were fine-tuned to avoid the lines being glued together, the value has changed.
          We need to recalculate the length of the segment.*/

      let angle = 0; // Initialize angle to 0
      if (x1 === x2) {
        angle = 90; // Vertical segment
      } else if (y1 === y2) {
        angle = 0; // Horizontal segment
      } 

      this.stripes[segment] = new LineStripe(//(x, y, len, spacing, count, angle, baseWeight)
        // Create a new LineStripe for each segment
        x1, 
        y1, 
        len - this.gap, 
        len * 0.05, // Spacing between lines, using length proportion instead of fixed value
        floor(random(3, 5)), 
        angle, 
        w*(random(0.01, 0.03)) 
      );
    }
  }

  show(segments) {
    //Used the website mentioned before.
    //https://www.geeksforgeeks.org/how-to-create-seven-segment-clock-using-p5-js-library/
    this.edge('a', segments[0]); // a segment: top horizontal line
    //segments[0] controls whether a is on or off.
    this.edge('b', segments[1]); // b segment: top right vertical line
    this.edge('c', segments[2]); // c segment: bottom right vertical line     
    this.edge('d', segments[3]); // d segment: bottom horizontal line
    this.edge('e', segments[4]); // e segment: bottom left vertical line
    this.edge('f', segments[5]); // f segment: top left vertical line
    this.edge('g', segments[6]); // g segment: middle horizontal line
  }
  edge(segment, flag) {
    let stripe = this.stripes[segment]; // Get the LineStripe object for the segment
    stripe.currentLen = stripe.len; // Set the current length to the full length of the segment
    if(flag == 1) { // If the segment is on
      stripe.gray = 60; // Convert to RGB color
    }else {
      stripe.gray = 240; // Still draw the segment, but with the color is similar to the background, almost invisible.
      
    }
    stripe.displayStep(); // Draw the segment
    }
}

function drawButton(x,y,w,h,buttonText, isHovered = false) {
  if (isHovered == true) {
    fill(255, 200, 120, 240); // Change color when hovered
  }
  else {
  fill(255, 230, 180, 220); // Set button color with transparency
  }
  stroke(120); // Set stroke color
  strokeWeight(2); // Set stroke weight
  rect(x, y, w, h, 12); // Draw rectangle with rounded corners

  fill(60); // Set text color
  noStroke(); // No stroke for text
  textSize(h * 0.45); // Set font size relative to button height
  textAlign(CENTER, CENTER); // Center align text
  text(buttonText, x + w / 2, y + h / 2); // Draw button text
  
}

function mouseIsOnTheButton(buttonX, buttonY, buttonW, buttonH) {
  // Check if the mouse is within the button's bounds
  return mouseX >= buttonX && mouseX <= buttonX + buttonW &&
         mouseY >= buttonY && mouseY <= buttonY + buttonH;
}

function drawControlButtons() {
  push();
  resetMatrix();//
  // Button position and size adapt to the canvas
  let margin = 0.025 * min(width, height); 
  let btnW = 0.25 * width;   
  let btnH = 0.06 * height;  
  let x = 0.1 * width; // Starting X position for buttons
  let y = height - btnH - margin;
  let btnSpacing = btnW + margin; // Spacing between buttons
  
  let startHovered = mouseIsOnTheButton(x, y, btnW, btnH); // Check if the "START" button is hovered
  let pauseHovered = mouseIsOnTheButton(x + btnSpacing, y, btnW, btnH); // Check if the "PAUSE" button is hovered
  let resetHovered = mouseIsOnTheButton(x + btnSpacing * 2, y, btnW, btnH); // Check if the "RESET" button is hovered

  drawButton(x, y, btnW, btnH,"START",startHovered);
  drawButton(x + btnSpacing, y, btnW, btnH,"PAUSE",pauseHovered);
  drawButton(x + btnSpacing*2, y, btnW, btnH,"RESET",resetHovered);
  pop();
}

function startTimer() {
  if (clockIsRunning == false) {
    // If the clock is not running, start it
      pausedTime = pausedTime + millis() - startTime; // Update paused time
      clockIsRunning = true; // Set the flag to true to start the clock
   
    
  }
}

function resetTimer() {
  resetTime = millis(); // Update reset time to current time
  pausedTime = 0;
  startTime = millis(); // Update start time to current time
  clockIsRunning = false; // Set the flag to false to pause the clock

}

function pauseTimer() {
  if (clockIsRunning == true) {
    // If the clock is not running, start it
      startTime = millis(); // Update start time to current time
      clockIsRunning = false; // Set the flag to true to start the clock
  }
 
  
}

// Handle mouse press events for button clicks
function mousePressed() {
  let margin = 0.025 * min(width, height);
  let btnW = 0.25 * width;
  let btnH = 0.06 * height;
  let x = 0.1 * width;
  let y = height - btnH - margin;
  let btnSpacing = btnW + margin; // Spacing between buttons

  if (mouseY >= y && mouseY <= y + btnH){
    if (mouseX >= x && mouseX <= x + btnW) {
      startTimer(); // Start the timer when the first button is clicked
    } else if (mouseX >= x + btnSpacing && mouseX <= x + btnSpacing + btnW) {
      pauseTimer(); // Pause the timer when the second button is clicked
    } else if (mouseX >= x + btnSpacing * 2 && mouseX <= x + btnSpacing * 2 + btnW) {
      resetTimer(); // Reset the timer when the third button is clicked
    }
  }

}

// Handle window resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight); 
  background(240, 240, 225); 
  stripes = [];
  currentStripe = 0;
  sevenSegmentDisplay = [];// 🔴Reset the seven-segment display
  colon = []; // 🔴Reset the colon position，in case the colon move towards right.
  setup(); // regenerate stripes on resize
}

// LineStripe class for generating and animating a set of lines
//🔴Change the angle
class LineStripe {
  constructor(x, y, len, spacing, count, angle, baseWeight) {   
    this.x = x;                        //Position of line
    this.y = y;                        //Position of line
    this.len = len;                    //Length of line
    this.spacing = spacing;            //Spacing of line
    this.count = count;                // Number of lines in the stripe
    this.angle = angle;                //Angle of line
    this.baseWeight = baseWeight;      //Width of line stroke
    this.lines = [];                   //Array to store the lines
    this.done = false;                 //Flag to indicate if the stripe is fully drawn
    this.currentLen = 0;               //Current line length  
    this.gray = random(10, 200);       //grayscale base color"

    // Initialize each line’s parameters
    for (let i = 0; i < this.count; i++) {
      let offsetY = i * this.spacing;                     // avoid overlapping lines
      let opacity = random(2, 100);                       // random opacity
      let weight = this.baseWeight + random(-0.1, 0.5);   // random weight variation
      let m = round(random(3));                           // direction modifier (0 or 1)
      this.lines.push({ offsetY, opacity, weight, m });   
    }
  }

  // Draw the line stripe step by step with animation
  displayStep() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);//🔴🔴🔴!!!!!!!!This is very very very important!!!!
    // I changed the original "-this.angle" to "this.angle" to make the lines grow in the correct direction.
    //Exhausted hours of debugging, and finally found this issue.
    //At first, I thought only line segment a was wrong, but later I found that all the horizontal line segments were wrong:(


    // Draw each line segment with dynamic length
    for (let i = 0; i < this.lines.length; i++) {
      let l = this.lines[i];
      stroke(this.gray, l.opacity);// meet the requirement of background color
      strokeWeight(l.weight);
      
      //Decide the growing direction of line based on mode
      if (l.m == 0) {
        line(0 + l.offsetY, l.offsetY, this.currentLen + l.offsetY, l.offsetY);
      } else {
        line(this.len + l.offsetY, l.offsetY, this.len - this.currentLen + l.offsetY, l.offsetY);
      }
    }

    // Animate growth of lines
    if (this.currentLen < this.len) {
      this.currentLen += 10;
    } else {
      this.done = true; //Mark done and continue to draw the next lines
    }
    pop();
  }
}
