// Initialize a variable to keep track of the number of frames
let frames = 0;

// This function will be called recursively using requestAnimationFrame
function bozo() {
    // Increment the frames counter on each function call
    frames += 1;

    // Request the next animation frame, calling the 'bozo' function again
    window.requestAnimationFrame(bozo);
}

// Start the animation loop by calling 'bozo' for the first time
window.requestAnimationFrame(bozo);

// Every 1000 milliseconds (1 second), update the displayed frames per second (fps)
setInterval(function() {
    // Log the number of frames to the console along with the "frames" label
    console.log(frames + " frames");

    // Update the innerHTML of a <p> element called 'displayfps' with the current frames per second (fps)
    displayfps.innerHTML = frames + " fps";

    // Reset the frames counter to zero for the next interval
    frames = 0;
}, 1000);

// Create a new <p> element to display the FPS counter on the page
let displayfps = document.createElement("p");

// Set the position and style of the <p> element
displayfps.style.display = "block";
displayfps.style.top = "0%";
displayfps.style.left = "0%";
displayfps.style.position = "absolute";
displayfps.style.zIndex = "100000000000000000000000000000";
displayfps.style.color = "white";
displayfps.style.fontFamily = "Cursive";

// Append the <p> element to the body of the HTML document
document.body.appendChild(displayfps);
