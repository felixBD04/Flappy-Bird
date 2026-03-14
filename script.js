const canvas = document.getElementById("gameBoard")
const ctx = canvas.getContext("2d")

const tuboUp = new Image();
tuboUp.src = "./media/tuboUp.png"
const tuboDown = new Image();
tuboDown.src = "./media/tuboDown.png"

const imgTubo = {
    up: tuboUp,
    down: tuboDown
}

let frames = []
// cargar frames
for(let i = 1; i <= 4; i++){;
    let img = new Image();
    img.src = `./media/NyanCatFrames/frame_${i}_delay-0.07s.png`;
    frames.push(img);
};

let currentFrame = 0

let cat = {
    x : 100,
    y : 100,
    angle : 0,
    img : frames[0],
    width : 100,
    height : 60 
}

const tuboWidth = 80;
const tuboHeight = 300;

let tubosInferiores = [
    {
        x : 700,
        y : 400,
        img : imgTubo.down,
        width : 80,
        height : 300 
    },
    {
        x : 700,
        y : 400,
        img : imgTubo.down,
        width : 80,
        height : 300 
    },
    {
        x : 700,
        y : 400,
        img : imgTubo.down,
        width : 80,
        height : 300 
    }
]
const separacion = 300
tubosInferiores = tubosInferiores.map((t,index) => {
    t.y = Math.random() * (500 - 300) + 300
    t.x += separacion * index
    return {...t}
})

const gap = 150;
const gravity = 5;
let velocity = 0
const tuboSpeed = 10
const jumpForce = -30

let tubo = {
    x : 700,
    y : 400,
    img : imgTubo.down,
    width : 80,
    height : 300 
}

const limitHeight = 530;
const rectAngle = 1.5708;
function animate(){
    velocity += gravity
    ctx.clearRect(0,0,canvas.width,canvas.height)

    

    cat.y = cat.y + velocity >= limitHeight ? limitHeight : cat.y += velocity
    cat.angle = cat.angle + 0.08 >= rectAngle ? rectAngle : cat.angle += 0.08

    cat.img = frames[currentFrame]
    draw(cat);

    currentFrame++;
    if(currentFrame >= frames.length){
        currentFrame = 0;
    }
    
    tubosInferiores.forEach(t => {
        t.x -= tuboSpeed
        if (t.x === -80) {
            let maxX = Math.max(...tubosInferiores.map(t => t.x))
            t.x = maxX + 300
            t.y = Math.random() * (500 - 300) + 300
        }
        draw(t)
        draw({
            x : t.x,
            y : t.y-t.height-gap,
            img : imgTubo.up,
            width : 80,
            height : 300 
        })
    })

    /* const tuboCercano = {
        down : tubosInferiores
                .filter(t => t.x + t.width > cat.x)
                .sort((a, b) => a.x - b.x)[0],
        up : {
            x : tuboCercano.down.x,
            y : tuboCercano.down.y - t.height - gap,
            width : 80,
            height : 300 
        }
    }
    console.log(tuboCercano) */

    const tuboCercanoInferior = tubosInferiores
        .filter(t => t.x + t.width > cat.x)
        .sort((a, b) => a.x - b.x)[0]
    /* const tuboCercanoSupeior = {
            x : t.x,
            y : t.y-t.height-gap,
            img : imgTubo.up,
            width : 80,
            height : 300 
        } */

    if (
        (tuboCercanoInferior && collision(tuboCercanoInferior, cat)) ||
        collision(
            {
                x:tuboCercanoInferior.x,
                y:tuboCercanoInferior.y - tuboCercanoInferior.height - gap,
                width:tuboCercanoInferior.width,
                height:tuboCercanoInferior.height
            },
            cat
        )
    ) {
        console.log("¡Colisión detectada!")
    }

    setTimeout(() => {
        requestAnimationFrame(animate)
    }, 100);
}

//maneajer los conceptos de velocity gravedad y distnacia para el movimiento del pajaro
animate();

document.addEventListener("click", ()=>{
    velocity = jumpForce
    cat.y -= velocity;
    cat.angle = -0.4;
})

function draw(obj){
    ctx.save()

    // mover origen al centro del objeto
    ctx.translate(obj.x + obj.width/2, obj.y + obj.height/2)

    // rotar si tiene ángulo
    ctx.rotate(obj.angle ? obj.angle : 0)

    // dibujar desde el centro
    ctx.drawImage(
        obj.img,
        -obj.width/2,
        -obj.height/2,
        obj.width,
        obj.height
    )

    ctx.restore()
}

function collision(a, b){
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    )
}
