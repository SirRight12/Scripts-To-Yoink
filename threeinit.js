function init(floor=true) {
    try {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, .1, 1000 );
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        document.addEventListener("resize", () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix()
            renderer.setSize(window.innerWidth, window.innerHeight);
        })
        const valToReturn = {
            scene: scene,
            camera: camera,
            renderer: renderer,
        }
        renderer.render(scene, camera)
        if (!floor) return valToReturn;
        const geometry = new THREE.BoxGeometry(6,.1,5);
        const material = new THREE.MeshBasicMaterial({color: 0xffffff});
        const floorObj = new THREE.Mesh(geometry, material);
        floorObj.position.y = camera.position.y - 3 
        valToReturn["floor"] = floorObj;
        scene.add(floorObj)
        return valToReturn
    } catch (err) {
        console.error(err)
    }
}