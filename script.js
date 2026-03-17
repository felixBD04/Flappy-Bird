const menu = document.getElementById("menu");
const characterIMG = document.getElementById("character");
const homeScreen = document.getElementById("homeScreen")

const canvas = document.getElementById("gameBoard");
const ctx = canvas.getContext("2d");

//const BASE_WIDTH = 800;
//const BASE_HEIGHT = 600;
//
//canvas.width = BASE_WIDTH;
//canvas.height = BASE_HEIGHT;
//
//function resizeCanvas() {
//    const scale = window.innerHeight / BASE_HEIGHT;
//    canvas.style.transform = `scale(${20})`;
//  }
//  
//window.addEventListener("resize", resizeCanvas);
//  
//resizeCanvas();

//VARIVALES PARA MANTENER EL SISTEMA DE PUNTOS
let idPasado;
let idTuboReciente ;

let score;

//FISICAS DEL JUEGO
const gap = 200;
const gravity = 5;
const tuboSpeed = 10;
const jumpForce = -30;
let velocity = 0;

const characters = [
    {
        name: "Nyan-cat.webp",
        folderName : "NyanCatFrames",
        frames : 6
    },
    {
        name : "bird.webp",
        folderName : "BirdFrames",
        frames : 6
    },
    {
        name : "CupHead.gif",
        folderName : "CupHeadFrames",
        frames : 10
    }
];

//--------------------GATO--------------------

//MEDIDAS DEL GATO
const catWidth = 80;
const catHeigth = 60;

//POSICION DEL GATO
let cat;

//FRAMES DEL GATO
let frames = [];

//LIMITES DEL MAPA PARA EL GATO
const limitHeight = 530;
//LIMITE DE GIRO
const rectAngle = 1.5708;

//CREACION DE LA IMAGENES DEL LOS TUBOS
const tuboUp = new Image();
tuboUp.src = "./media/tubos/tuboUp.png";
const tuboDown = new Image();
tuboDown.src = "./media/tubos/tuboDown.png";

const imgTubo = {
    up: tuboUp,
    down: tuboDown
};

//--------------------TUBOS--------------------

//MEDIDAS DE LOS TUBOS
const tuboWidth = 80;
const tuboHeight = 300;

//POSICION DE LOS TUBOS
let tubosInferiores;

//REUBICACION DE LOS TUBOS
const separacion = 300;


function inicializarVariables(){
    idPasado = 0;
    idTuboReciente = 0;

    score = 0;

    cat = {x : 100, y : 100, angle : 0};

    tubosInferiores = [
        {x : 700, y : 400},
        {x : 700, y : 400},
        {x : 700, y : 400}
    ];

    tubosInferiores = tubosInferiores.map((t,index) => {
        t.y = Math.random() * (500 - 300) + 300;
        t.x += separacion * index;
        return {...t};
    })
}

//--------------------JUEGO--------------------

//CAMBIAR DE PERSONAJE
let character = 0;
const imgContainer = document.getElementById("imgContainer")


function animarImg(img,direccion){
    img.style.animation = "none";
    img.offsetHeight;
    img.style.animation = direccion + " 0.8s cubic-bezier(.68,-0.55,.27,1.55) forwards"
}

const oldImg = new Image
oldImg.classList.add("oldImg")

function cambiar(event){
    
    oldImg.src = `./media/characters/${characters[character].name}`
    imgContainer.appendChild(oldImg)
    
    if(event.currentTarget.id === "prevCharater") {
        animarImg(oldImg,"desaparecerIzquierda")
        animarImg(characterIMG,"aparecerDerecha")
        character -= 1
        if (character < 0){
            character = characters.length-1
        }
    }else {
        animarImg(oldImg,"desaparecerDerecha")
        animarImg(characterIMG,"aparecerIzquierda")
        character += 1
        if (character > characters.length-1){
            character = 0
        }
    }

    characterIMG.src = `./media/characters/${characters[character].name}`
    
    oldImg.addEventListener("animationend", () => {
        imgContainer.removeChild(oldImg);
    });
    
}

//INICO DEL JUEGO

function inicio(){
    inicializarVariables();
    homeScreen.classList.add("hidden")

    //CARGAMOS LO FRAMES
    for(let i = 0; i <= characters[character].frames - 1; i++){;
        let img = new Image();
        img.src = `./media/characters/${characters[character].folderName}/frame_${i}.png`;
        frames.push(img);
    };

    animate();
}

//ANIMACION DEL JUEGO
let currentFrame = 0 //para poder animar al gato
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
        t.x -= tuboSpeed;
        if (t.x === -80) {
            let maxX = Math.max(...tubosInferiores.map(t => t.x))
            t.x = maxX + 300
            t.y = Math.random() * (500 - 300) + 300
        };
        draw(t,tuboWidth,tuboHeight,imgTubo.down);
        const tuboSupeior = {
            x : t.x,
            y : t.y-tuboHeight-gap,
        };
        draw(tuboSupeior,tuboWidth,tuboHeight,imgTubo.up);
    })


    const tuboCercano = tubosInferiores
        .filter(t => t.x + tuboWidth > cat.x)
        .sort((a, b) => a.x - b.x)[0];

    //HIT BOX DEL GATO
    const catBox = {
        //la reducimos para evitar choques invisibles
        x: cat.x + 15,
        y: cat.y + 10,
        width: catWidth-30,
        height: catHeigth-20
    };

    //para ver la hit box del gato
    ctx.strokeStyle = "red";
    ctx.strokeRect(catBox.x, catBox.y, catBox.width, catBox.height);

    //HIT BOX DEL TUBO INFEIOR
    const tuboInferior = {
        ...tuboCercano,
        width: tuboWidth,
        height: tuboHeight
    };
    //HIT BOX DEL TUBO SUPERIOR
    const tuboSuperior = {
        x: tuboCercano.x,
        y: tuboCercano.y - tuboHeight - gap,
        width: tuboWidth,
        height: tuboHeight
    };

    idTuboReciente = tubosInferiores.indexOf(tuboCercano);
    
    if(idPasado != idTuboReciente){
        score ++;
        idPasado = idTuboReciente;
    }

    if (
        tuboCercano &&
        (collision(tuboInferior, catBox) || collision(tuboSuperior, catBox))
    ) {
        console.log("¡Colisión detectada!")
        menu.classList.remove("hidden")
        document.getElementById("score").textContent = score;
        console.log(score)
    }else{
        setTimeout(() => {
            requestAnimationFrame(animate)
        }, 50);
    }
}

//DIBUJASMO LOS ELEMENTOS DEL JUEGO
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

//DETECTAMOS COLICIONES
function collision(a, b){
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    )
}

//CAMBIO DE PERSONAJE

document.getElementById("prevCharater")
    .addEventListener("click",cambiar)

document.getElementById("nextCharater")
    .addEventListener("click",cambiar)

//INICIO DEL JUEGO CON EL BOTON START

document.getElementById("start")
    .addEventListener("click",inicio)

//SALTO DEL GATO
canvas.addEventListener("click", ()=>{
    velocity = jumpForce
    cat.y -= velocity;
    cat.angle = -0.4;
})

//VOLVER A JUGAR
function volverJugar(){
    inicializarVariables();
    menu.classList.add("hidden");
    animate();
}

document.getElementById("playAgain")
    .addEventListener("click", volverJugar)


