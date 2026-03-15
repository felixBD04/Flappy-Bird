const canvas = document.getElementById("gameBoard")
const ctx = canvas.getContext("2d")

const gap = 200;
const gravity = 5;
const tuboSpeed = 10
const jumpForce = -30
let velocity = 0

const catWidth = 100;
const catHeigth = 60;

let cat = {
    x : 100,
    y : 100,
    angle : 0
}

const limitHeight = 530;
const rectAngle = 1.5708;

const tuboUp = new Image();
tuboUp.src = "./media/tuboUp.png"
const tuboDown = new Image();
tuboDown.src = "./media/tuboDown.png"

const imgTubo = {
    up: tuboUp,
    down: tuboDown
}

//frames del gato cons lo que lo vamos a animer
let frames = []
// cargar frames
for(let i = 1; i <= 4; i++){;
    let img = new Image();
    img.src = `./media/NyanCatFrames/frame_${i}_delay-0.07s.png`;
    frames.push(img);
};

const tuboWidth = 80;
const tuboHeight = 300;

let tubosInferiores = [
    {
        x : 700,
        y : 400
    },
    {
        x : 700,
        y : 400
    },
    {
        x : 700,
        y : 400
    }
]

//Separamos los tubos y los ponemos a distintas alturas
const separacion = 300
tubosInferiores = tubosInferiores.map((t,index) => {
    t.y = Math.random() * (500 - 300) + 300
    t.x += separacion * index
    return {...t}
})

let currentFrame = 0
function animate(){
    velocity += gravity
    ctx.clearRect(0,0,canvas.width,canvas.height)

    cat.y = cat.y + velocity >= limitHeight ? limitHeight : cat.y += velocity
    cat.angle = cat.angle + 0.08 >= rectAngle ? rectAngle : cat.angle += 0.08

    draw(cat,catWidth,catHeigth,frames[currentFrame]);

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
        draw(t,tuboWidth,tuboHeight,imgTubo.down)
        const tuboSupeior = {
            x : t.x,
            y : t.y-tuboHeight-gap,
        }
        draw(tuboSupeior,tuboWidth,tuboHeight,imgTubo.up)
    })


    const tuboCercano = tubosInferiores
        .filter(t => t.x + tuboWidth > cat.x)
        .sort((a, b) => a.x - b.x)[0]

    //reducimos la hitbox del gato para que no se detecten colisiones imposibles
    const catBox = {
        x: cat.x + 15,
        y: cat.y + 10,
        width: catWidth-30,
        height: catHeigth-20
    }

    //para ver la hit box del gato
    ctx.strokeStyle = "red"
    ctx.strokeRect(catBox.x, catBox.y, catBox.width, catBox.height)

    const tuboInferior = {
        ...tuboCercano,
        width: tuboWidth,
        height: tuboHeight
    }

    const tuboSuperior = {
        x: tuboCercano.x,
        y: tuboCercano.y - tuboHeight - gap,
        width: tuboWidth,
        height: tuboHeight
    }

    if (
        tuboCercano &&
        (collision(tuboInferior, catBox) || collision(tuboSuperior, catBox))
    ) {
        console.log("¡Colisión detectada!")
    }else{
        setTimeout(() => {
            requestAnimationFrame(animate)
        }, 50);
    }
}

function draw(obj,width,height,img){
    ctx.save()

    ctx.translate(obj.x + width/2, obj.y + height/2)

    ctx.rotate(obj.angle ? obj.angle : 0)

    ctx.drawImage(
        img,
        -width/2,
        -height/2,
        width,
        height
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

animate();

document.addEventListener("click", ()=>{
    velocity = jumpForce
    cat.y -= velocity;
    cat.angle = -0.4;
})

