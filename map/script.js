


// Выключаем контекстное меню при нажатии правой кнопки мыши
document.oncontextmenu = function () {
    return false
};

// Размер основного поля
const gridX = 8
const gridY = 10

var lastClicked;
var lastClickedType;

var gridArr = [];

var flipped = false;

for (var i = 0; i < gridY; i++) {
    nArr = [];
    for (var j = 0; j < gridX; j++) {
        nArr.push(null);
    }
    gridArr.push(nArr);
}

// Массив хронящий изменения основного поля

var gridArrChanges = [];

for (var i = 0; i < gridY; i++) {
    nArr = [];
    for (var j = 0; j < gridX; j++) {
        nArr.push(null);
    }
    gridArrChanges.push(nArr);
}

var tileTypes = [];

// Класс маркеров (Картинка сверху, Картинка снизу)
class Tile {
    constructor(front, back, name, markerID) {
        this.front = front;
        this.back = back;
        this.name = name;
        this.markerID = markerID;
    }

}

// Маркеры
var images = {
    "lamp": new Tile("/png/lamp.png", "/png/QR-1.png","lamp",0),
    "buzzer": new Tile("/png/buzzer.png", "/png/QR-2.png","buzzer",1),
    "battery": new Tile("/png/battery.png", "/png/QR-3.png","battery",2),
    "cell": new Tile("/png/cell.png", "/png/QR-4.png","cell",3),
    "fuse": new Tile("/png/fuse.png", "/png/QR-5.png","fuse",4),
}

// Заполняем массив tileTypes
load_images();

function load_images() {
    for (key in images) {
        tileTypes.push(images[key]);
    }
}

// Создаем три сетки (Вверхний вид, нижний вид, меню выбора маркера)
createGrid(8, 10, "gridFront")
createGrid(8, 10, "gridBack")
createGrid(5, 2, "gridSelect", tileTypes)

// Создание сетки
function createGrid(rows, cols, className, array = []) {
    var i = 0;
    var ar = 0;
    var grid = document.createElement('table');

    grid.className = className;
    grid.id = className;

    for (var r = 0; r < rows; ++r) {
        var tr = grid.appendChild(document.createElement('tr'));

        for (var c = 0; c < cols; ++c) {
            var cell = tr.appendChild(document.createElement('td'));
            cell.innerHTML = "";
            cell.classList.add(i++);

            if (ar < array.length) {
                cell.innerHTML = "<img src=." + array[ar].front + ">";
                ar++;
            }
        }
    }
    document.body.appendChild(grid);
}

// Добавление маркера на сетку
function gridFront(evt) {
    el = evt.target

    if (lastClicked) {
        ls = lastClicked.innerHTML;
        el.innerHTML = '<div class="flip-card"> <div class="flip-card-inner"> <div class="flip-card-front"> <img src=".' + lastClickedType.front + '"> </div> <div class="flip-card-back"> <img src=".' + lastClickedType.back + '"> </div> </div> </div>'
        el.firstChild.style.transform = 'rotate(0deg)'
        // если поле перевернуто, перевернуть маркер перед добавлением
        if (flipped){
            el.firstChild.children[0].classList.add('flipped');
        }
        // добавление маркера в массив
        gridArr[el.className%gridY][Math.floor(el.className/gridY)] = [];
        gridArr[el.className%gridY][Math.floor(el.className/gridY)].push(lastClickedType,0);
        // добавляем что в данной ячейке появился новый маркер
        gridArrChanges[el.className%gridY][Math.floor(el.className/gridY)] = 'new marker';
        // добавляем маркер на нижнюю доску
        var backCellNumber = +el.className + gridY - 1 - el.className%gridY*2;
        var backCell = document.getElementsByClassName(backCellNumber);

        for (var i = 0; i < backCell.length; i++) {
            if (backCell[i].parentNode.parentNode.classList.contains("gridBack")) {
                backCell[i].innerHTML = "<img src=." + lastClickedType.back + ">";
                backCell[i].style.transform = 'rotate(0deg)';
            }
        }
    };
    // перерисовываем канвас
    changeCanv();
    //console.log(gridArr);
};

// Удаление маркера из сетки
function gridFrontRemove(evt) {
    el = evt.target.parentElement.parentElement.parentElement.parentElement;
    // удаление с верхнего поля
    var frontCell = document.getElementsByClassName(el.className);

    for (var i = frontCell.length - 1; i >= 0; i--) {
        if (frontCell[i].parentNode.parentNode.classList.contains("gridFront")) {
            frontCell[i].childNodes[0].remove();
        }
    }

    gridArr[el.className%gridY][Math.floor(el.className/gridY)] = null;
    // произошло событие удаления, отмечаем это в массиве
    gridArrChanges[el.className%gridY][Math.floor(el.className/gridY)] = 'marker deleted';
    //удаление с нижнего поля
    var backCellNumber = +el.className + gridY - 1 - el.className%gridY*2;
    var backCell = document.getElementsByClassName(backCellNumber);

    for (var i = 0; i < backCell.length; i++) {
        if (backCell[i].parentNode.parentNode.classList.contains("gridBack")) {
            backCell[i].firstChild.remove();
        }
    }
    //перерисуем канвас
    changeCanv()

}

// Поворот маркера
function gridFrontRotate(evt) {
    el = evt.target.parentElement.parentElement.parentElement;

    //находим нужную нам ячейку на нижнем поле
    var backCellNumber = +el.parentElement.className + gridY - 1 - el.parentElement.className%gridY*2;
    var backCell = document.getElementsByClassName(backCellNumber);
    var targetBackCell;

    for (var i = 0; i < backCell.length; i++) {
        if (backCell[i].parentNode.parentNode.classList.contains("gridBack")) {
            targetBackCell = backCell[i];
        }
    }
    // поворачиваем ячейки
    switch (el.style.transform) {
        case 'rotate(0deg)':
            el.style.transform = 'rotate(90deg)';
            targetBackCell.style.transform = 'rotate(90deg)';
            gridArr[el.parentElement.className%gridY][Math.floor(el.parentElement.className/gridY)][1] = 1;
            break;
        case 'rotate(90deg)':
            el.style.transform = 'rotate(180deg)';
            targetBackCell.style.transform = 'rotate(180deg)';
            gridArr[el.parentElement.className%gridY][Math.floor(el.parentElement.className/gridY)][1] = 2;
            break;
        case 'rotate(180deg)':
            el.style.transform = 'rotate(270deg)';
            targetBackCell.style.transform = 'rotate(270deg)';
            gridArr[el.parentElement.className%gridY][Math.floor(el.parentElement.className/gridY)][1] = 3;
            break;
        default:
            el.style.transform = 'rotate(0deg)';
            targetBackCell.style.transform = 'rotate(0deg)';
            gridArr[el.parentElement.className%gridY][Math.floor(el.parentElement.className/gridY)][1] = 0;
    }
    //произошел поворот ячейки, отмечаем это в массиве
    gridArrChanges[el.parentElement.className%gridY][Math.floor(el.parentElement.className/gridY)] = 'marker rotated';
    //перерисовываем канвас
    changeCanv();
    //console.log(gridArr);
}

// Выбор маркера
function gridSelect(evt, i) {
    el = evt.target.parentElement

    if (el.classList[1] === 'clicked') {
        return 0;
    }

    el.classList.add('clicked');
    if (lastClicked) lastClicked.classList.remove('clicked');
    lastClicked = el;
    lastClickedType = tileTypes[i];
}

// Обработка левого клика
window.addEventListener('click', function (evt) {

    //обработка слайдера
    if (evt.target.tagName === "INPUT"){
         fieldRotate()
    }
    if (evt.target.tagName === "IMG") {
        var lol;
        if (evt.target.parentElement.className == 'flip-card-front' || evt.target.parentElement.className == 'flip-card-back') {
            lol = evt.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.className;
        } else {
            lol = evt.target.parentElement.parentElement.parentElement.className;
        }

        if (lol === "gridFront") {
            window[lol + "Rotate"](evt);
        } else {
            window[lol](evt, evt.target.parentElement.className);
        }
    }

    if (evt.target.tagName === "TD") {
        var lol = evt.target.parentElement.parentElement.className;

        if (lol === "gridFront") {
            window[lol](evt);
        }
    }
});

// Обработка правого
window.addEventListener('contextmenu', function (evt) {
    if (evt.target.tagName === "IMG") {
        var lol = evt.target.parentElement.parentElement.parentElement;
        lol = lol.parentElement.parentElement.parentElement.className;

        if (lol === "gridFront") {
            window[lol + "Remove"](evt);
        }
    }
});

//обработка слайдера

function fieldRotate(){
    var chbox;
    chbox=document.getElementById('field');

    var front = document.getElementsByClassName('flip-card-inner');
    if (chbox.checked) {
        flipped = true;
        for (var i = front.length - 1; i >= 0; i--) {
            if (front[i].classList.contains('flipped')){
                front[i].classList.remove("flipped");
            }
            else {
                front[i].classList.add("flipped");
            }
        }
    } else {
        flipped = false;
        for (var i = front.length - 1; i >= 0; i--) {
            if (front[i].classList.contains('flipped')){
                front[i].classList.remove("flipped");
            }
            else {
                front[i].classList.add("flipped");
            }
        }
    }
}

//кнопка отчистки всех полей на экране

var eraseAllBtn = document.getElementById('erase').addEventListener("click", eraseAll);

function eraseAll(){
    var event = new MouseEvent('contextmenu', {
        'view': window,
        'bubbles': true,
        'cancelable': true
    });
    
    for (var i = 0; i < gridY; i++) {
        for (var j = 0; j < gridX; j++) {
            if (gridArr[i][j]){
                gridArr[i][j] = null;
                var cells = document.getElementsByClassName(j*gridY + i);
                console.log(cells);
                for (var k = cells.length - 1; k >= 0; k--) {
                    if (cells[k].parentElement.parentElement.classList.contains("gridFront")){
                        cells[k].querySelector(".flip-card-front img").dispatchEvent(event);
                    }
                }
            }
        }
    }
    console.log(gridArr);
}






















// эксперементальные кнопки для эксперементальных функций (просто чтоб функции тестить)


 var tr1 = document.getElementById("try").addEventListener("click", try2);
 var tr2 = document.getElementById("try2").addEventListener("click", try1);



var canv;
var canvCont;
var matrix;
// эксперементальная функция(аффинные преобразования)
function try2(){
    matrix = new Matrix(canvCont);
    canvCont.clearRect(0,0,472,378);
    matrix.rotate(0.7);
}
function try1() {
      var canvas = document.getElementById('canvas');
      console.log(canvas);
      if (canvas.getContext) {
        console.log('hey');
        var ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgb(200, 0, 0)';
        ctx.fillRect(10, 10, 50, 50);

        ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
        ctx.fillRect(30, 30, 50, 50);
      }
    }


// изменение канваса(на данный момент просто его пересоздание)
function changeCanv(){
    html2canvas(document.getElementById("gridBack")).then(function(canvas) {
    canvCont = document.getElementById('canvas').getContext('2d');
    // canvCont.imageSmoothingEnabled = false;
    canvCont.drawImage(canvas,0,0);
    canv = canvas;
    });
}


// получаем изначальный канвас(пустой без маркеров)
changeCanv();


// получение пнг изображения с канваса
function getImg(){
  var link = document.createElement('a');
  link.download = 'filename.png';
  link.href = canv.toDataURL()
  link.click();
}




// функции для получения данных с цифрового двойника


async function f0(){
    console.log(0);
    // var response = [];
    // for (var i = 0; i < gridY; i++) {
    //     for (var j = 0; j < gridX; j++) {
    //         if(gridArr[i][j]){
    //             response.push({
    //                 x: j,
    //                 y: i,
    //                 id: gridArr[i][j][0].markerID
    //             });
    //         }
    //     }
    // }
    // response = JSON.stringify(response);
    // console.log(response);


    let response = await fetch("http://localhost:3000");
if (response.ok) { // если HTTP-статус в диапазоне 200-299
  // получаем тело ответа (см. про этот метод ниже)
  let json = await response.text();
  console.log(response.status);
  console.log(json);
} else {
  alert("Ошибка HTTP: " + response.status);
}
 }

  async function f1(){
    console.log(1);
    // var response = [];
    // for (var i = 0; i < gridY; i++) {
    //     for (var j = 0; j < gridX; j++) {
    //         if(gridArr[i][j]){
    //             response.push({
    //                 x: j,
    //                 y: i,
    //                 r: gridArr[i][j][1]
    //             });
    //         }
    //     }
    // }
    // response = JSON.stringify(response);
    // console.log(response);
    let response = await fetch("http://localhost:3000/getMarkersPosition");
    if (response.ok) { // если HTTP-статус в диапазоне 200-299
  // получаем тело ответа (см. про этот метод ниже)
  let json = await response.json();
  console.log(response.status);
  console.log(json);
} else {
  alert("Ошибка HTTP: " + response.status);
}
 }
//функция не работает если запускать сайт из файловой системы, запускай через сервер (localhost)
   function f2(){
    console.log(2);
    var backs = document.getElementsByClassName("flip-card-back");
    for (var i = backs.length - 1; i >= 0; i--) {
        backs[i].style.display = 'none'
    }
    html2canvas(document.getElementById("gridFront")).then(function(canvas) {
        var link = document.createElement('a');
        link.download = 'filename.png';
        link.href = canvas.toDataURL()
        link.click();
    });
    for (var i = backs.length - 1; i >= 0; i--) {
        backs[i].style.display = 'block';
    }
 }


  function f3(){
    console.log(3);
 }

  function f4(){
    console.log(4);
 }

  function f5(){
    console.log(5);
    var response = [];
    console.log(gridArrChanges);
    for (var i = 0; i < gridY; i++) {
        for (var j = 0; j < gridX; j++) {
            if(gridArrChanges[i][j]){
                response.push({
                    x: j,
                    y: i,
                    typeOfChange: gridArrChanges[i][j]
                });
                gridArrChanges[i][j] = null;
            }
        }
    }
    response = JSON.stringify(response);
    console.log(response);

 }

   function f6(){
    console.log(6);
 }

// привязываем функции к кнопкам
 var fbuttons = document.querySelectorAll(".buttons .functions .btn");
 var functions = [f0,f1,f2,f3,f4,f5,f6]

  for (var i = fbuttons.length - 1; i >= 0; i--) {
     fbuttons[i].addEventListener("click", functions[i]);
 }



// Функции визуальных эффектов

 function e0(){
    canv.style.filter = "blur(1px)";
}

 function e1(){
    canv.style.filter = "blur(1px)";
}
 function e2(){
    canv.style.filter = "blur(1px)";
}
 function e3(){
    canv.style.filter = "blur(1px)";
}
 function e4(){
    canv.style.filter = "blur(1px)";
}
 function e5(){
    canv.style.filter = "blur(1px)";
}
 function e6(){
    canv.style.filter = "blur(1px)";
}


// привязываем функции к кнопкам
 var effects = [e0,e1,e2,e3,e4,e5,e6]

  var ebuttons = document.querySelectorAll(".buttons .effects .btn");

  for (var i = ebuttons.length - 1; i >= 0; i--) {
     ebuttons[i].addEventListener("click", effects[i]);
 }


