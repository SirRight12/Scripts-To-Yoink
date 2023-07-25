let scene = new SSGE.Scene(.7)
let testchild = new SSGE.Sprite({
    position: {
        x: 0,
        y: 0,
    },
    width: 100,
    height: 100,
    id: "test",
    jumpPower: 17,
    walkSpeed: 7,
    isImage: true,
    scale: 3,
    imgSrc: "Assets/samuraiMack/Idle.png",
    framesMax: 8,
    offset: {
        x: 230,
        y: 265,
    },
    sprites: {
        idle: {
            imgSrc:  "./Assets/samuraiMack/Idle.png",
            framesMax: 8,
        },
        run: {
            imgSrc:  "./Assets/samuraiMack/Run.png",
            framesMax: 8,
        },
        runL: {
            imgSrc: "Assets/samuraiMack/RunL.png",
            framesMax: 8,
        },
        jump: {
            imgSrc:  "./Assets/samuraiMack/Jump.png",
            framesMax: 2,
        },
        fall: {
            imgSrc:  "./Assets/samuraiMack/Fall.png",
            framesMax: 2,
        },
        attack1: {
            imgSrc:  "./Assets/samuraiMack/Attack1.png",
            framesMax: 6,
        },
        death: {
            imgSrc: "./Assets/samuraiMack/Death.png",
            framesMax: 6,
        },
        hit: {
            imgSrc: "./Assets/samuraiMack/Take Hit - white silhouette.png",
            framesMax: 4,
        },
    }
})
let testchild2 = new SSGE.Sprite({
    position: {
        x: canvas.width - 100, 
        y: 0,
    },
    width: 100,
    height: 150,
    id: "test2",
    renderOrder: 3,
    color: "green",
    isImage: true,
    scale: 3,
    imgSrc: "Assets/kenji/Idle.png",
    framesMax: 4,
    framesHold: 4,
    offset: {
        x: 225,
        y: 233,
    },
    jumpPower: 17,
    walkSpeed: 7,
    sprites: {
        idle: {
            imgSrc:  "./Assets/kenji/Idle.png",
            framesMax: 4,
        },
        run: {
            imgSrc:  "./Assets/kenji/Run.png",
            framesMax: 8,
        },
        jump: {
            imgSrc:  "./Assets/kenji/Jump.png",
            framesMax: 2,
        },
        fall: {
            imgSrc:  "./Assets/kenji/Fall.png",
            framesMax: 2,
        },
        attack1: {
            imgSrc:  "./Assets/kenji/Attack2.png",
            framesMax: 4,
        },
        death: {
            imgSrc: "./Assets/kenji/Death.png",
            framesMax: 7,
        },
        hit: {
            imgSrc: "./Assets/kenji/Take Hit.png",
            framesMax: 3,
        },
    }
})
let BF = new SSGE.Sprite({
    position: {
        x: canvas.width / 2,
        y: 0,
    },
    isImage: true,
    imgSrc: "Assets/CupHead.png",
    framesMax: 10,
    framesHold: 3,
    animationType: "reverseloop",
    scale: 1,
    offset: {
        x: 0,
        y: 250,
    },
    scrollOffsetX: 0,
    id: "Cuphead",
    renderOrder: 3,
})
console.log(testchild.renderOrder)
console.log(testchild2.renderOrder)
scene.add(testchild)
scene.add(testchild2)
scene.add(BF)
requestAnimationFrame(Animate)
document.addEventListener("keydown",(event) => {
    let keyism = event.key.toUpperCase()
    switch (keyism) {
        case "A":
            testchild.keys.goingLeft = true
            break;
        case "D": 
            testchild.keys.goingRight = true
            break;
        case "W":
            if (testchild.isInAir) return
            testchild.keys.goingUp = true
            break;
        case "S": 
            testchild.keys.actionKeyPressed = true
            break;
        case "ARROWLEFT":
            testchild2.keys.goingLeft = true
            break;
        case "ARROWRIGHT":
            testchild2.keys.goingRight = true
            break;
        case "ARROWUP":
            if (testchild2.isInAir) return
            testchild2.keys.goingUp = true
            break;
        case "ARROWDOWN":
            testchild2.actionKeyPressed = true
            break;
    }
})
document.addEventListener("keyup",(event) => {
    let keyism = event.key.toUpperCase()
    switch (keyism) {
        case "A":
            testchild.keys.goingLeft = false
            break;
        case "D": 
            testchild.keys.goingRight = false
            break;
        case "W":
            testchild.keys.goingUp = false
            break;
        case "S": 
            testchild.keys.actionKeyPressed = false
            break;
        case "ARROWLEFT":
            testchild2.keys.goingLeft = false
            break;
        case "ARROWRIGHT":
            testchild2.keys.goingRight = false
        case "ARROWUP":
            testchild2.keys.goingUp = false
            break;
        case "ARROWDOWN":
            testchild2.actionKeyPressed = false
            break;
    }
})
function Animate() {
    requestAnimationFrame(Animate)
    scene.render()
}