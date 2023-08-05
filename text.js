function initText(p) {
    let created = false
    if (!p) {
       created = true
       p = document.createElement("p")
       document.body.appendChild(p)
    }
    p.dramaticText = dramaticText
    p.funText = funText
    if (created) return p
    return
 }
function funText(text="Hi :)",delay=10,afterdone={
    delay: 1000,
    callback: () => {},
 }) {
 let loop = 0
 this.innerHTML = ""
 let main = setInterval(() => {
    this.innerHTML += text[loop]
    loop ++
    if (loop >= text.length) {
       clearInterval(main)
       setTimeout(afterdone.callback,afterdone.delay)
    }
 },delay)
}
function dramaticText(text="Hi :)",delay=100,afterdone={
    delay: 1000,
    callback: () => {},
 }) {
    let loop = 0
    this.innerHTML = ""
    let parent = initDiv(false,false,"parent")
    this.appendChild(parent)
    real()
    const interval = setInterval(() => {
       real()
    },delay)
    function real() {
       const textThing = text[loop]
       main(textThing)
       if (textThing === " ") {
          main(text[loop])
       }
    }
    function main(textThing) {
       const div = initDiv(textThing,"delete")
       
       parent.appendChild(div)
       loop ++
       if (loop >= text.length) {
          clearInterval(interval)
          setTimeout(afterdone.callback,afterdone.delay)
       }
    }
    function initDiv(text,className,id="delete") {
       const div = document.createElement("div")
       div.id = id
       if (!text && !className) return div
       div.innerHTML = text
       if (div.innerHTML === " ") {
          div.innerHTML = "f"
          div.style.color = "black"
          className += "2"
       }
       div.className = className
       return div
    }
 }