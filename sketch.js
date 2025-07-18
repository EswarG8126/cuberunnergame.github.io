let scene, camera, renderer, player;
let obstacles = [], terrainSegments = [];
let score = 0, lives = 5;
let lane = 0; // -1, 0, 1 for left, middle, right
const lanes = [-2, 0, 2];
let isJumping = false;
let velocityY = 0;
const gravity = -0.1;
const jumpStrength = 0.2;
const groundY = 0.5;


const clock = new THREE.Clock();

init();

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 7);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 10, 5);
    scene.add(light);

    // Player Cube
    const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
    const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.set(0, 0.5, 0);
    scene.add(player);

    // Terrain
    spawnInitialTerrain();

    // Controls
    document.addEventListener("keydown", e => {
        if (e.code === "ArrowLeft") lane = Math.max(-1, lane - 1);
        if (e.code === "ArrowRight") lane = Math.min(1, lane + 1);
        if (e.code === "Space" && !isJumping) {
            velocityY = jumpStrength;
            isJumping = true;
        }
    });
    

    animate();
}

function spawnInitialTerrain() {
    for (let i = 0; i < 6; i++) {
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(6, 20),
            new THREE.MeshStandardMaterial({ color: 0x444444 })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.z = -i * 20;
        scene.add(ground);
        terrainSegments.push(ground);
    }
}

function spawnObstacle(zPos) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const obs = new THREE.Mesh(geometry, material);
    obs.position.set(lanes[Math.floor(Math.random() * 3)], 0.5, zPos);
    scene.add(obs);
    obstacles.push(obs);
}

function updateTerrain() {
    terrainSegments.forEach(segment => {
        segment.position.z += 0.2;
        if (segment.position.z > 10) {
            segment.position.z -= terrainSegments.length * 20;
        }
    });
}

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.position.z += 0.2;

        if (obs.position.z > 5) {
            scene.remove(obs);
            obstacles.splice(i, 1);
            score += 10;
        }

        if (
            Math.abs(obs.position.z - player.position.z) < 0.9 &&
            Math.abs(obs.position.x - player.position.x) < 0.9
        ) {
            scene.remove(obs);
            obstacles.splice(i, 1);
            lives--;
            if (lives <= 0) {
                alert("Game Over!");
                lives = 3;
                score = 0;
                obstacles.forEach(o => scene.remove(o));
                obstacles = [];
            }
        }
    }

    if (Math.random() < 0.02) {
        spawnObstacle(-60);
    }
}

function animate() {
    requestAnimationFrame(animate);

    // Move player smoothly toward lane
    player.position.x += (lanes[lane + 1] - player.position.x) * 0.2;

    if (isJumping) {
        player.position.y += velocityY;
        velocityY += gravity;
    
        if (player.position.y <= groundY) {
            player.position.y = groundY;
            isJumping = false;
            velocityY = 0;
        }
    }

    updateTerrain();
    updateObstacles();

    camera.lookAt(player.position);

    document.getElementById("hud").innerText = `Score: ${score} | Lives: ${lives}`;
    renderer.render(scene, camera);
}

window.addEventListener("click", () => {
    document.getElementById("bg-music").play();
}, { once: true });
