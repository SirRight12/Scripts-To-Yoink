// Select the canvas element, if it exists in the HTML. Otherwise, create a new one and append it to the body.
let canvas = document.querySelector("canvas");
if (canvas == null) {
    canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
}

// Set the width and height of the canvas.
canvas.width = 1024;
canvas.height = 576;

// Get the 2D rendering context of the canvas.
let c = canvas.getContext("2d");

// Fill the canvas with a default color to start with.
c.fillRect(0, 0, canvas.width, canvas.height);

// SSGE (Simple Sprite Game Engine) namespace definition
const SSGE = {
    // Define the 'Scene' class in the SSGE namespace
    Scene: class Scene {
        constructor({ gravity = 0.7, color = "lightblue" }) {
            // Initialize the scene properties
            this.gravity = gravity;
            this.color = color;
            this.children = {}; // To store the objects in the scene
            this.renderOrder = {}; // To maintain the rendering order of objects
            this.render(); // Render the scene
        }

        // Method to add a child object to the scene
        add(child) {
            // If a child with the same ID already exists, remove it
            if (this.children[child.id]) delete this.children[child.id];

            // Add the child to the scene's children collection
            this.children[child.id] = child;

            // Update the rendering order to ensure correct drawing
            for (let thing in this.children) {
                let thisid = this.children[thing].id;
                let childthing = this.children[thing].renderOrder;
                if (!this.renderOrder[childthing]) {
                    this.renderOrder[childthing] = {};
                }
                this.renderOrder[childthing][this.children[thing].id] = this.children[thing];
            }
        }

        // Method to remove a child object from the scene
        remove(child) {
            // Check if the child exists in the scene
            if (!this.children[child.id]) {
                console.error(`${child} is not a child of the scene`);
                return;
            }

            // Remove the child from the scene's children collection
            delete this.children[child.id];

            // Remove the child from the rendering order
            delete this.renderOrder[child.renderOrder][child.id];

            // Check if the render order is empty, and if so, delete it
            if (Object.keys(this.renderOrder[child.renderOrder]).length == 0) {
                delete this.renderOrder[child.renderOrder];
                console.log(this.renderOrder[child.renderOrder]);
            }
        }

        // Method to render the scene and its child objects
        render() {
            // Clear the canvas to start rendering from a clean slate
            c.clearRect(0, 0, canvas.width, canvas.height);
            c.fillStyle = this.color;
            c.fillRect(0, 0, canvas.width, canvas.height);

            // Loop through the objects in the scene's rendering order and draw them
            for (let x in this.renderOrder) {
                for (let y in this.renderOrder[x]) {
                    let child = this.children[this.renderOrder[x][y].id];
                    child.draw();

                    // Update the physics (if the object is a physics object)
                    if (child.isPhysicsObject) {
                        // Check if the object is touching the ground (bottom of the canvas)
                        if (child.position.y >= canvas.height - child.height) {
                            child.position.y = canvas.height - child.height;
                            child.velocity.y = 0;
                            child.isInAir = false;
                        } else {
                            // Apply gravity if the object is in the air
                            child.velocity.y += this.gravity;
                            child.isInAir = true;
                        }

                        // Horizontal movement handling
                        child.velocity.x = 0;
                        if (child.keys.goingLeft) {
                            child.velocity.x = 0 - Math.abs(child.walkSpeed);
                            child.switchSprites("run");
                        } else if (child.keys.goingRight) {
                            child.velocity.x = Math.abs(child.walkSpeed);
                            child.switchSprites("run");
                        } else {
                            child.switchSprites("idle");
                        }

                        // Jump handling
                        if (child.keys.goingUp && !child.isInAir) {
                            child.velocity.y += child.jumpPower;
                            child.keys.goingUp = false;
                        }

                        // Update the object's position based on its velocity
                        if (child.velocity.x != 0 || child.velocity.y != 0) {
                            child.position.x += child.velocity.x;
                            child.position.y += child.velocity.y;

                            // Check if the object is out of the canvas bounds and adjust its position
                            if (child.position.x < 0) {
                                child.position.x -= child.velocity.x;
                            } else if (child.position.x > canvas.width - child.width) {
                                child.position.x -= child.velocity.x;
                            }
                        }
                    }
                }
            }
        }
    },

    // Define the 'Sprite' class in the SSGE namespace
    Sprite: class Sprite {
        constructor({
            position = { x: 0, y: 0 },
            velocity = { x: 0, y: 0 },
            isImage = false,
            width = 0,
            height = 0,
            properties,
            imgSrc,
            renderOrder = 1,
            jumpPower = -15,
            color = "red",
            id,
            walkSpeed = 5,
            framesHold = 7,
            framesMax = 1,
            scale = 1,
            isPhysicsObject = true,
            offset = { x: 0, y: 0 },
            animationType,
            scrollOffsetX = 0,
            sprites = {},
        }) {
            // Check if the 'id' property is provided, as it's required for a sprite
            if (!id) {
                console.error("Sprites require an ID");
                return;
            }

            // Initialize the sprite properties
            this.keys = {
                goingUp: false,
                goingRight: false,
                goingLeft: false,
                actionKeyPressed: false,
            };
            this.isPhysicsObject = isPhysicsObject;
            this.isInAir = true;
            this.velocity = velocity;
            this.color = color;
            this.renderOrder = renderOrder;
            this.position = position;
            this.isImage = isImage;
            this.walkSpeed = walkSpeed;
            this.jumpPower = 0 - Math.abs(jumpPower);
            this.properties = properties;
            this.id = id;
            this.width = width;
            this.height = height;
            this.hasError = false;
            this.hasWarn = false;

            // If the sprite is an image, initialize image-specific properties
            if (this.isImage) {
                this.image = new Image();
                this.image.src = imgSrc;
                this.scale = scale;
                this.framesElapsed = 0;
                this.framesHold = framesHold;
                this.frame = 0;
                this.framesMax = framesMax;
                this.offset = offset;
                this.sprites = sprites;
                this.framesIncrease = 1;
                this.animationType = animationType;
                this.scrollOffsetX = scrollOffsetX;

                // Preload all sprites' images
                for (let thing in this.sprites) {
                    sprites[thing].image = new Image();
                    sprites[thing].image.src = sprites[thing].imgSrc;
                }

                return;
            }
        }

        // Method to draw the sprite on the canvas
        draw() {
            if (this.isImage) {
                // Draw the sprite as an image
                c.drawImage(
                    this.image,
                    this.frame * (this.image.width / this.framesMax) - this.scrollOffsetX,
                    0,
                    this.image.width / this.framesMax,
                    this.image.height,
                    this.position.x - this.offset.x,
                    this.position.y - this.offset.y,
                    (this.image.width / this.framesMax) * this.scale,
                    this.image.height * this.scale
                );
                this.animateFrames();
            } else {
                // Draw the sprite as a colored rectangle
                c.fillStyle = this.color;
                c.fillRect(this.position.x, this.position.y, this.width, this.height);
            }
        }

        // Method to check if the sprite is touching another object
        isTouching(obj) {
            let condition =
                this.position.x + this.width >= obj.position.x &&
                this.position.x <= obj.position.x + obj.width &&
                this.position.y + this.height >= obj.position.y &&
                this.position.y <= obj.position.y + obj.height;
            return condition;
        }

        // Method to animate the sprite's frames if it's an image
        animateFrames() {
            this.framesElapsed++;

            if (this.framesElapsed % this.framesHold == 0) {
                if (
                    this.frame < this.framesMax - 1 &&
                    this.framesIncrease != -1 ||
                    this.animationType == "reverse" &&
                    this.frame >= 0 &&
                    this.framesIncrease == -1
                ) {
                    this.frame += this.framesIncrease;
                } else {
                    // Handle different animation types when reaching the last frame
                    switch (this.animationType) {
                        case "reverseloop":
                            if (this.framesIncrease == 1) {
                                this.framesIncrease = -1;
                                this.frame = this.framesMax - 1;
                            } else if (this.framesIncrease == -1) {
                                this.framesIncrease = 1;
                                this.frame = 1;
                            }
                            break;
                        default:
                            this.frame = 0;
                            break;
                    }
                }
            }
        }

        // Method to switch the sprite's image based on a given sprite name
        switchSprites(sprite) {
            if (!this.isImage) return;
            if (!this.sprites) {
                if (!this.hasWarn) {
                    console.warn(`${this.id} does not contain sprites`);
                    this.hasWarn = true;
                }
                return;
            }
            if (!this.sprites[sprite]) {
                if (!this.hasError) {
                    this.hasError = true;
                    console.error(`Error: ${sprite} is not a sprite of ${this.id}`);
                }
                return;
            }

            // Change the sprite's image to the selected sprite
            let newImg = this.sprites[sprite];
            if (this.image == newImg.image) return;
            this.image = newImg.image;
            this.image.src = newImg.imgSrc;
            this.framesMax = newImg.framesMax;
            this.frame = 0;
        }
    },
};
