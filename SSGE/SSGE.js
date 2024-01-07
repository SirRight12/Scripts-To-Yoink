const SSGE = {
    //class to render scenes to make swapping easier
    SceneRender: class SceneRender {
        constructor (scene,width,height,provideCanvas = false) {
            this.canvas = provideCanvas;
            if (!provideCanvas) {
                this.canvas = document.createElement("canvas");
                document.body.appendChild(this.canvas)
            }
            this.canvas.width = width;
            this.canvas.height = height;
            this.scene = scene
            this.canvas.addEventListener("mousemove", (event) => {
                this.mouseX = event.offsetX
                this.mouseY = event.offsetY
            })
            this.scene.drawBackground(this.canvas)
        }
        swapScene(newScene) {
            this.scene = newScene
            //redraw the scene without updating stuff
            this.scene.render(this.canvas,false)
        }
        render() {
            this.scene.render(this.canvas)
        }
        updateDimensions(width,height) {
            this.canvas.width = width;
            this.canvas.height = height;
        }
        mouseIntersects(transform) {
            transform.getNormalsFromRelatives({
                x: this.canvas.width,
                y: this.canvas.height,
            })
            let condition =
            transform.position.x + transform.width >= scene.mouseX &&
            transform.position.x <= scene.mouseX &&
            transform.position.y + transform.height >= scene.mouseY &&
            transform.position.y <= scene.mouseY;
            return condition;
        }
    },
    // Define the 'Scene' class in the SSGE namespace
    Scene: class Scene {
        constructor({ gravity = 0.7, color = "lightblue" }) {
            // Initialize the scene properties
            this.gravity = gravity;
            this.color = color;
            this.children = {}; // To store the objects in the scene
            this.renderOrder = {}; // To maintain the rendering order of objects
        }
        // Method to add a child object to the scene
        add(child) {
            // If a child with the same ID already exists, remove it
            if (this.children[child.id]) delete this.children[child.id];

            // Add the child to the scene's children collection
            this.children[child.id] = child;

            // Update the rendering order to ensure correct drawing
            for (let thing in this.children) {
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
            }
        }

        // Method to render the scene and its child objects
        drawBackground(canvas) {
            const c = canvas.getContext('2d')
            c.clearRect(0, 0, canvas.width, canvas.height);
            c.fillStyle = this.color;
            c.fillRect(0, 0, canvas.width, canvas.height);
        }
        render(canvas,upd=true) {
            const c = canvas.getContext('2d')
            this.drawBackground(canvas)

            // Loop through the objects in the scene's rendering order and draw them
            for (let x in this.renderOrder) {
                for (let y in this.renderOrder[x]) {
                    let child = this.children[this.renderOrder[x][y].id];
                    child.transform.getNormalsFromRelatives({
                        x: canvas.width,
                        y: canvas.height,
                    })
                    child.draw(c);
                    if (!upd) continue
                    if (child.isPhysicsObject) {
                        // Check if the object is touching the ground (bottom of the canvas)
                        if (child.transform.position.y >= canvas.height - child.scale.y) {
                            child.transform.position.y = canvas.height - child.scale.y;
                            child.transform.velocity.y = 0;
                            child.isInAir = false;
                        } else {
                            // Apply gravity if the object is in the air
                            child.transform.velocity.y += this.gravity;
                            child.isInAir = true;
                        }

                        // Horizontal movement handling
                        child.transform.velocity.x = 0;
                        if (child.keys.goingLeft) {
                            child.transform.velocity.x = 0 - Math.abs(child.walkSpeed);
                            if (child.isImage) child.switchSprites("run");
                        } else if (child.keys.goingRight) {
                            child.transform.velocity.x = Math.abs(child.walkSpeed);
                            if (child.isImage) child.switchSprites("run");
                        } else {
                            if (child.isImage) child.switchSprites("idle");
                        }

                        // Jump handling
                        if (child.keys.goingUp && !child.isInAir) {
                            child.transform.velocity.y += child.jumpPower;
                            child.keys.goingUp = false;
                        }

                        // Update the object's position based on its velocity
                        if (child.transform.velocity.x != 0 || child.transform.velocity.y != 0) {
                            child.transform.position.x += child.transform.velocity.x;
                            child.transform.position.y += child.transform.velocity.y;

                            // Check if the object is out of the canvas bounds and adjust its position
                            if (child.transform.position.x < 0) {
                                child.transform.position.x -= child.transform.velocity.x;
                            } else if (child.transform.position.x > canvas.width - child.transform.scale.x) {
                                child.transform.position.x -= child.transform.velocity.x;
                            }
                        }
                    }
                    // Update the physics (if the object is a physics object)
                }
            }
        }
    },
    // Define a transform class (To save space so you don't have to declare all things at once
    transform: class transform {
        
        constructor ({position,scale,velocity}) {
            if (!position.isVector2) {
                throw new Error("Position must be type 'Vector2'")
            }
            if (!velocity.isVector2) {
                throw new Error("Velocity must be type 'Vector2'")
            }
            if (!scale.isVector2) {
                throw new Error("Velocity must be type 'Vector2'")
            }
            this.relatives = {
                empty: true,   
            }
            if (position.isRelativeVector2) {
                this.fillRelatives()
                this.relatives['position'] = position
            }
            if (velocity.isRelativeVector2) {
                this.fillRelatives()
                this.relatives['velocity'] = velocity
            }
            if (scale.isRelativeVector2) {
                this.fillRelatives()
                this.relatives['scale'] = scale
            }
            this.position = position
            this.scale = scale
            this.velocity = velocity
        }
        fillRelatives() {
            if (this.relatives.empty) delete this.relatives.empty
        }
        getNormalsFromRelatives(Dimensions) {
            for (let x in this.relatives) {
                const thing = this.relatives[x]
                this[x] = thing.getGlobalVector(Dimensions)
            }
        }
    },
    //simple object class
    Object: class Object {
        constructor({
            transform,
            properties,
            renderOrder = 1,
            color = "red",
            id,
            isPhysicsObject = true,
            }) {
                this.transform = transform
                this.isPhysicsObject = isPhysicsObject
                this.id = id
                this.color = color
                this.renderOrder = renderOrder
                this.properties = properties
                this.keys = {
                    goingUp: false,
                    goingRight: false,
                    goingLeft: false,
                    actionKeyPressed: false,
                };
            }
            draw(c) {
                // Draw the sprite as a colored rectangle
                c.fillStyle = this.color;
                c.fillRect(this.transform.position.x, this.transform.position.y, this.transform.scale.x, this.transform.scale.y);
            }
            
            // Method to check if the sprite is touching another object
            isTouching(obj) {
                if (obj.length > 0) {
                    for (let x = 0; x < obj.length; x ++) {
                        const obj1 = obj[x]
                        let condition =
                        this.transform.position.x + this.transform.scale.x >= obj1.transform.position.x &&
                        this.transform.position.x <= obj1.transform.position.x + obj1.transform.scale.x &&
                        this.transform.position.y + this.transform.scale.y >= obj.transform.position.y &&
                        this.transform.position.y <= obj1.transform.position.y + obj1.transform.scale.y;
                        if (condition) return obj1
                    }
                    return false
                }
                let condition =
                    this.transform.position.x + this.transform.scale.x >= obj.transform.position.x &&
                    this.transform.position.x <= obj.transform.position.x + obj.transform.scale.x &&
                    this.transform.position.y + this.transform.scale.y >= obj.transform.position.y &&
                    this.transform.position.y <= obj.transform.position.y + obj.transform.scale.y;
                return condition;
            }
    },
    Vector2: class Vector2 {
        static UP = new this(0,1)
        static RIGHT = new this(1,0)
        static LEFT = new this(-1,0)
        static RIGHT = new this(0,-1)
        static ZERO = new this(0,0)
        constructor (x=0,y=0) {
            this.x = x
            this.y = y
            this.isVector2 = true
        }
        add(v2) {
            this.x += v2.x
            this.y += v2.y
        }
        multiply(v2) {
            this.x *= v2.x
            this.y *= v2.y
        }
        divide(v2) {
            this.x = v2.x / this.x
            this.y = v2.y / this.y
        }
        multiplyScalar(s) {
            this.x *= s
            this.y *= s
        }
        normalize() {
            const length = (this.x ** 2) + (this.y ** 2)
            this.x = this.x / length || 0
            this.y = this.y / length || 0
        }
        subtract(v2) {
            this.x -= v2.x
            this.y -= v2.y
        }
        subtract2(v1,v2) {
            this.x = v2.x - v1.x
            this.y = v2.y - v1.y
        }
        add2(v1,v2) {
            this.x = v1.x + v2.x
            this.y = v1.y + v1.y
        }
        divide2(v1,v2) {
            this.x = v2.x / v1.x
            this.y = v2.y / v1.y
        }
    },
    // Define the 'Sprite' class in the SSGE namespace
    //more complex than object as it supports images and spritesheets
    Sprite: class Sprite {
        constructor({
            transform,
            isImage = false,
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
            this.color = color;
            this.renderOrder = renderOrder;
            this.transform = transform;
            this.isImage = isImage;
            this.walkSpeed = walkSpeed;
            this.jumpPower = 0 - Math.abs(jumpPower);
            this.properties = properties;
            this.id = id;
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
        draw(c) {
            if (this.isImage) {
                // Draw the sprite as an image
                c.drawImage(
                    this.image,
                    this.frame * (this.image.width / this.framesMax) - this.scrollOffsetX,
                    0,
                    this.image.width / this.framesMax,
                    this.image.height,
                    this.transform.position.x - this.offset.x,
                    this.transform.position.y - this.offset.y,
                    (this.image.width / this.framesMax) * this.scale,
                    this.image.height * this.scale
                );
                this.animateFrames();
            } else {
                // Draw the sprite as a colored rectangle
                c.fillStyle = this.color;
                c.fillRect(this.transform.position.x, this.transform.position.y, this.transform.scale.x, this.transform.scale.y);
            }
        }

        // Method to check if the sprite is touching another object
        isTouching(obj) {
            let condition =
                this.transform.position.x + this.transform.scale.x >= obj.transform.position.x &&
                this.transform.position.x <= obj.transform.position.x + obj.transform.scale.x &&
                this.transform.position.y + this.transform.scale.y >= obj.transform.position.y &&
                this.transform.position.y <= obj.transform.position.y + obj.transform.scale.y;
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
SSGE.transform.ZERO = new SSGE.transform({
    position: new SSGE.Vector2(),
    scale: new SSGE.Vector2(100,100),
    velocity: new SSGE.Vector2()
})
SSGE['RelativeVector2'] = class Vector2R extends SSGE.Vector2 {
    constructor (x,y) {
        super(x,y)
        this.isRelativeVector2 = true
    }
    getGlobalVector(Dimensions) {
        const vec = new SSGE.Vector2(Dimensions.x * this.x, Dimensions.y * this.y)
        return vec
    }
}
