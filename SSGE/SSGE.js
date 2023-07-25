let canvas = document.querySelector("canvas")
if (canvas == null) {
    canvas = document.createElement("canvas")
    document.body.appendChild(canvas)
}
canvas.width = 1024
canvas.height = 576

let c = canvas.getContext("2d")

c.fillRect(0,0,canvas.width,canvas.height)
const SSGE = {
    Scene: class Scene {
        constructor ({gravity=.7,color="lightblue"}) {
            this.gravity = gravity
            this.color = color
            this.children = {}
            this.renderOrder = {}
            this.render()
        }
        add(child) {
            if (this.children[child.id]) delete this.children[child.id]
            this.children[child.id] = child
            for (let thing in this.children) {
                let thisid = this.children[thing].id
                let childthing = this.children[thing].renderOrder
                if (!this.renderOrder[childthing]) {
                    this.renderOrder[childthing] = {}
                }
                this.renderOrder[childthing][this.children[thing].id] = this.children[thing]

                
            }
        }
        remove(child) {
            if (!this.children[child.id]) {
                console.error(`${child} is not a child of scene`)
                return
            }
            delete this.children[child.id]
            delete this.renderOrder[child.renderOrder][child.id]
            if (Object.keys(this.renderOrder[child.renderOrder]).length == 0) {
                delete this.renderOrder[child.renderOrder]
                console.log(this.renderOrder[child.renderOrder])
            }
        }
        render() {
            c.clearRect(0,0,canvas.width,canvas.height)
            c.fillStyle = this.color
            c.fillRect(0,0,canvas.width,canvas.height)
            for (let x in this.renderOrder) {   
                for (let y in this.renderOrder[x]) {
                let child = this.children[this.renderOrder[x][y].id]
                child.draw()
                if (child.isPhysicsObject) { 
                    if (child.position.y >= canvas.height - child.height) {
                        child.position.y = canvas.height - child.height
                        child.velocity.y = 0
                        child.isInAir = false
                    } else {
                        child.velocity.y += this.gravity
                        child.isInAir = true
                    }
                    child.velocity.x = 0
                    if (child.keys.goingLeft) {
                        child.velocity.x = 0 - Math.abs(child.walkSpeed)
                        child.switchSprites("run")
                    } else if (child.keys.goingRight) {
                        child.velocity.x = Math.abs(child.walkSpeed)
                        child.switchSprites("run")
                    } else {
                        child.switchSprites("idle")
                    }
                    if (child.keys.goingUp && !child.isInAir) {
                        child.velocity.y += child.jumpPower
                        child.keys.goingUp = false
                    }
                    if (child.velocity.x != 0 || child.velocity.y != 0) {
                        child.position.x += child.velocity.x
                        child.position.y += child.velocity.y
                        if (child.position.x < 0) {
                            child.position.x -= child.velocity.x
                        } else if (child.position.x > canvas.width - child.width) {
                            child.position.x -= child.velocity.x
                        }
                    }
                }
                }
            }
        }
    },
    Sprite: class Sprite {
        constructor ({
            position = {
                x:0,
                y:0,
            },
            velocity = {
                x:0,
                y:0
            },
            isImage = false,
            width=0,
            height=0,
            properties,
            imgSrc,
            renderOrder=1,
            jumpPower=-15,
            color="red",
            id,
            walkSpeed=5,
            framesHold=7,
            framesMax=1,
            scale=1,
            isPhysicsObject=true,
            offset = {
                x: 0,
                y: 0
            },
            animationType,
            scrollOffsetX=0,
            sprites={},
            }) {
            if (!id) {
                console.error("Sprites require an Id")
                return
            }
            this.keys = {
                goingUp: false,
                goingRight: false,
                goingLeft: false,
                actionKeyPressed: false,
            }
            this.isPhysicsObject = isPhysicsObject
            this.isInAir = true
            this.velocity = velocity
            this.color = color
            this.renderOrder = renderOrder
            this.position = position
            this.isImage = isImage
            this.walkSpeed = walkSpeed
            this.jumpPower = 0 - Math.abs(jumpPower)
            this.properties = properties
            this.id = id
            this.width = width
            this.height = height
            this.hasError = false
            this.hasWarn = false
            if (this.isImage){
                this.image = new Image()
                this.image.src = imgSrc
                this.scale = scale
                this.framesElapsed = 0
                this.framesHold = framesHold
                this.frame = 0
                this.framesMax = framesMax
                this.offset = offset
                this.sprites = sprites
                this.framesIncrease = 1
                this.animationType = animationType
                this.scrollOffsetX = scrollOffsetX
                for (let thing in this.sprites) {
                    sprites[thing].image = new Image()
                    sprites[thing].image.src = sprites[thing].imgSrc
                }
                return
            }
        }
        draw() {
            if (this.isImage) {
                c.drawImage(
                    this.image,
                    this.frame * (this.image.width / this.framesMax) - this.scrollOffsetX,
                    0,
                    this.image.width / this.framesMax,
                    this.image.height,
                    this.position.x - this.offset.x,
                    this.position.y -  this.offset.y,
                    (this.image.width / this.framesMax) * this.scale
                    ,this.image.height * this.scale
                    )
                this.animateFrames()
                } else {
                    c.fillStyle = this.color
                    c.fillRect(this.position.x,this.position.y,this.width,this.height)
            }
            }
        isTouching(obj) {
            let condition = this.position.x  + this.width >= obj.position.x&& this.position.x <=  obj.position.x +  obj.width && this.position.y + this.height >=  obj.position.y && this.position.y <=  obj.position.y +  obj.height
            return condition 
        }
        animateFrames() {
            this.framesElapsed ++
        
            if (this.framesElapsed % this.framesHold == 0) {
                if (this.frame < this.framesMax - 1 && this.framesIncrease != -1|| this.animationType == "reverse" && this.frame >= 0 && this.framesIncrease == -1) {
                    this.frame += this.framesIncrease
                } else {
                    switch(this.animationType) {
                        case "reverseloop":
                            if (this.framesIncrease == 1) {
                                this.framesIncrease = -1
                                this.frame = this.framesMax - 1
                            } else if (this.framesIncrease == -1) {
                                this.framesIncrease = 1
                                this.frame = 1
                            }
                            break
                        default: 
                            this.frame = 0
                            break
                    }
                }
            }
        }
        switchSprites(sprite) {
            if (!this.isImage) return
            if (!this.sprites) {
                if (!this.hasWarn) {
                    console.warn(`${this.id} does not contain sprites`)
                    this.hasWarn = true
                }
                return
            }
            if (!this.sprites[sprite]) {
                if (!this.hasError) {
                    this.hasError = true
                    console.error(`Error: ${sprite} is not a sprite of ${this.id}`)
                }
                return
            }
            let newImg = this.sprites[sprite]
            if (this.image == newImg.image) return
            this.image = newImg.image
            this.image.src = newImg.imgSrc
            this.framesMax = newImg.framesMax
            this.frame = 0
        }
    },
}