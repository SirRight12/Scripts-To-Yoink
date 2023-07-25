// This code uses Three.js from mr. doob, make sure to include the library.

// Utility function to check if one object is touching another object within a specified range.
function touchingsomething(obj1, obj2, xsquare = 1, ysquare = 1, zsquare = 1) {
  let touching = obj1.position.x >= obj2.position.x - xsquare &&
                 obj1.position.x <= obj2.position.x + xsquare &&
                 obj1.position.z >= obj2.position.z - zsquare &&
                 obj1.position.z <= obj2.position.z + zsquare &&
                 obj1.position.y >= obj2.position.y - ysquare &&
                 obj1.position.y <= obj2.position.y + ysquare;
  return touching;
}

// Utility function to check if the camera is near any object in the scene.
function nearanything(obj1, scene) {
  for (let p of scene.children) {
    if (touchingsomething(obj1, p, 0.6, 0.6, 1)) {
      return touchingsomething(obj1, p);
    }
  }
}

// Initiate camera movement and rotation controls.
function startMovement(camera) {
  
  // Initialize a clock to keep track of time for smooth animations.
  let clockthing = new THREE.Clock(true);
  
  // Reset camera's X and Z rotation angles.
  camera.rotation.x = 0;
  camera.rotation.z = 0;

  // Flags to track whether arrow keys and WASD keys are pressed for movement and rotation.
  let arrowright = false;
  let arrowleft = false;
  let arrowUp = false;
  let arrowDown = false;
  let wdown = false;
  let sdown = false;
  let adown = false;
  let ddown = false;

  // Flag to determine if the camera can move.
  camera.canMove = true;

  // Function to toggle camera movement on/off.
  camera.toggleMove = function () {
    if (this.canMove) {
      this.canMove = false;
    } else {
      this.canMove = true;
    }
  };

  // Variable to keep track of camera rotation for looking up or down.
  let times = 0;

  // Function to rotate the camera up or down.
  function lookUp(camera, angleToLookUp) {
    const goingToLookUp = angleToLookUp > 0;
    const goingToLookDown = angleToLookUp < 0;
    const up = times >= 48 && goingToLookUp;
    const down = times <= -48 && goingToLookDown;

    if (down || up) return;
    
    if (goingToLookDown) {
      times -= 1;
    } else if (goingToLookUp) {
      times += 1;
    }
    // Convert the angle from degrees to radians.
    const angleRad = THREE.MathUtils.degToRad(angleToLookUp);

    // Get the camera's current quaternion rotation.
    const quaternion = new THREE.Quaternion();
    quaternion.copy(camera.quaternion);

    // Calculate the rotation quaternion for pitch (around X-axis).
    const axisX = new THREE.Vector3(1, 0, 0);
    const quaternionX = new THREE.Quaternion().setFromAxisAngle(axisX, angleRad);

    // Apply the new rotation to the camera (update the pitch).
    camera.rotation.x += angleRad;

    // Update the camera's quaternion rotation with the updated pitch.
    quaternion.multiply(quaternionX);
    quaternion.normalize();

    // Apply the new rotation to the camera.
    camera.setRotationFromQuaternion(quaternion);
  }

  // Function to move the camera sideways (strafe).
  function strafe(camera, distance) {
    // Store the previous Y position.
    let posy = camera.position.y;

    // Get the camera's right vector (normalized) based on its orientation.
    let right = new THREE.Vector3(1, 0, 0);
    right.applyQuaternion(camera.quaternion);

    // Scale the right vector by the distance to move sideways.
    right.multiplyScalar(distance);

    // Update the camera's position.
    camera.position.add(right);

    // Set the Y position back to the saved one to prevent vertical movement.
    camera.position.y = posy;
  }

  // Function to rotate the camera left or right.
  function turn(camera, angleToTurn) {
    let angleRad = THREE.MathUtils.degToRad(angleToTurn); // Convert angle from degrees to radians

    // Create a quaternion for the rotation around the camera's up vector (yaw).
    let quaternion = new THREE.Quaternion().setFromAxisAngle(camera.up, angleRad);

    // Apply the quaternion rotation to the camera's current orientation.
    camera.quaternion.premultiply(quaternion);

    // Ensure the quaternion is normalized to prevent potential issues with accumulated rotations.
    camera.quaternion.normalize();
  }

  // Function to move the camera forward or backward.
  function moveForward(camera, distance) {
    // Get the camera's direction vector (normalized) based on its orientation.
    let direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(camera.quaternion);

    // Set the Y value to 0 to prevent vertical movement.
    direction.y = 0;

    // Normalize the direction again to avoid slower movement while looking up.
    direction.normalize();

    // Scale the direction vector by the distance to move forward or backward.
    direction.multiplyScalar(distance);

    // Update the camera's position.
    camera.position.add(direction);
  }

  // Event listener for keydown events.
  document.addEventListener("keydown", function (event) {
    if (!camera.canMove) return; // If the camera can't move, ignore the keypress.

    // Update the arrow keys and WASD flags based on the keys being pressed.
    if (event.key == "ArrowDown") {
      arrowUp = false;
      arrowDown = true;
    } else if (event.key == "ArrowUp") {
      arrowUp = true;
      arrowDown = false;
    } else if (event.key == "ArrowRight" && !arrowright) {
      arrowright = true;
    } else if (event.key == "ArrowLeft" && !arrowleft) {
      arrowleft = true;
    } else if (event.key == " ") {
      camera.position.y += 0.5; // Move the camera up on the Y-axis.
    } else if (event.key == "q") {
      camera.position.y -= 0.5; // Move the camera down on the Y-axis.
    }
  });

  // Event listener for keydown events for WASD keys.
  document.addEventListener("keydown", function (event) {
    let keyism = event.key.toUpperCase(); // Get the key and make it uppercase.

    if (!camera.canMove) return; // If the camera can't move, ignore the keypress.

    // Update the WASD flags based on the keys being pressed.
    if (keyism == "W" && !wdown) {
      wdown = true;
      sdown = false;
    } else if (keyism == "S" && !sdown) {
      wdown = false;
      sdown = true;
    } else if (keyism == "A" && !adown) {
      adown = true;
      ddown = false;
    } else if (keyism == "D" && !ddown) {
      ddown = true;
      adown = false;
    }
  });

  // Event listener for keyup events to reset the WASD flags when keys are released.
  document.addEventListener("keyup", function (event) {
    let keyism = event.key.toUpperCase(); // Get the key and make it uppercase.

    // Reset the relevant flags based on the keys being released.
    switch (keyism) {
      case "W":
        wdown = false;
        break;
      case "S":
        sdown = false;
        break;
      case "D":
        ddown = false;
        break;
      case "A":
        adown = false;
        break;
      case "ARROWRIGHT":
        arrowright = false;
        break;
      case "ARROWLEFT":
        arrowleft = false;
        break;
      case "ARROWUP":
        arrowUp = false;
        break;
      case "ARROWDOWN":
        arrowDown = false;
    }
  });

  // Animation loop for continuous camera movement based on the pressed keys.
  loop();
  function loop() {
    if (!camera.canMove) return; // If the camera can't move, do nothing.

    // Get delta time for consistent movement with varying frame rates.
    let delta = clockthing.getDelta();
    requestAnimationFrame(loop);

    // Calculate the actual amount moved and turned in the current frame.
    let amt = 4 * delta;
    let turnAmt = 100 * delta;

    // Reduce speed if both forward and sideways movement keys are pressed (strafing).
    const forward = wdown || sdown;
    const side = adown || ddown;
    if (forward && side) {
      amt = amt * 0.75;
    }

    // Move the camera based on the pressed keys.
    if (sdown) {
      moveForward(camera, -amt); // Move backward.
    } else if (wdown) {
      moveForward(camera, amt); // Move forward.
    }
    if (ddown) {
      strafe(camera, amt); // Move right.
    } else if (adown) {
      strafe(camera, -amt); // Move left.
    }

    // Rotate the camera based on the pressed arrow keys.
    if (arrowleft) {
      turn(camera, turnAmt); // Turn left.
    } else if (arrowright) {
      turn(camera, -turnAmt); // Turn right.
    }

    // Rotate the camera up or down based on the pressed arrow keys.
    if (arrowUp) {
      lookUp(camera, turnAmt); // Look up.
    } else if (arrowDown) {
      lookUp(camera, -turnAmt); // Look down.
    }
  }
}
