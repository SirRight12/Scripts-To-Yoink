let frames = 0
function bozo() {
    frames += 1
    window.requestAnimationFrame(bozo);
}
window.requestAnimationFrame(bozo);
setInterval(function() {
    console.log(frames + " frames")
    displayfps.innerHTML = frames + " fps"
    frames = 0
},1000)
let displayfps = document.createElement("p")
displayfps.style.display = "block"
displayfps.style.top = "0%"
displayfps.style.left = "0%"
document.body.appendChild(displayfps)
displayfps.style.position = "absolute"
displayfps.style.zIndex =  "100000000000000000000000000000"
displayfps.style.color = "white"
displayfps.style.fontFamliy = "Cursive"