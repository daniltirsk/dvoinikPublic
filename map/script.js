


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
        updateFieldChanges(Math.floor(el.className/gridY),el.className%gridY,'new marker');
        // добавляем маркер на нижнюю доску
        var backCellNumber = +el.className + gridY - 1 - el.className%gridY*2;
        var backCell = document.getElementsByClassName(backCellNumber);

        for (var i = 0; i < backCell.length; i++) {
            if (backCell[i].parentNode.parentNode.classList.contains("gridBack")) {
                backCell[i].innerHTML = "<img src=." + lastClickedType.back + ">";
                backCell[i].style.transform = 'rotate(0deg)';
            }
        }
        addMarkerToServ(Math.floor(el.className/gridY),el.className%gridY,lastClickedType.markerID,0);

    };
    // перерисовываем канвас

    uploadFrontGridImg();

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
    updateFieldChanges(Math.floor(el.className/gridY),el.className%gridY,'marker deleted');
    //удаление с нижнего поля
    var backCellNumber = +el.className + gridY - 1 - el.className%gridY*2;
    var backCell = document.getElementsByClassName(backCellNumber);

    for (var i = 0; i < backCell.length; i++) {
        if (backCell[i].parentNode.parentNode.classList.contains("gridBack")) {
            backCell[i].firstChild.remove();
        }
    }

    deleteMarkerFromServ(Math.floor(el.className/gridY),el.className%gridY);

    uploadFrontGridImg();
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
    var r;

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
            //gridArr[el.parentElement.className%gridY][Math.floor(el.parentElement.className/gridY)][1] = 1;
            r = 1;
            break;
        case 'rotate(90deg)':
            el.style.transform = 'rotate(180deg)';
            targetBackCell.style.transform = 'rotate(180deg)';
            //gridArr[el.parentElement.className%gridY][Math.floor(el.parentElement.className/gridY)][1] = 2;
            r = 2;
            break;
        case 'rotate(180deg)':
            el.style.transform = 'rotate(270deg)';
            targetBackCell.style.transform = 'rotate(270deg)';
            //gridArr[el.parentElement.className%gridY][Math.floor(el.parentElement.className/gridY)][1] = 3;
            r = 3;
            break;
        default:
            el.style.transform = 'rotate(0deg)';
            targetBackCell.style.transform = 'rotate(0deg)';
            //gridArr[el.parentElement.className%gridY][Math.floor(el.parentElement.className/gridY)][1] = 0;
            r = 0;
    }
    //произошел поворот ячейки, отмечаем это в массиве
    updateFieldChanges(Math.floor(el.parentElement.className/gridY),el.parentElement.className%gridY,'marker rotated');

    updateMarkerRotationServ(Math.floor(el.parentElement.className/gridY),el.parentElement.className%gridY,r);

    uploadFrontGridImg();
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
    if (evt.target.id === "field"){
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



function AddMarkerToBoard(x,y,id,r) {
    let cells = document.getElementsByClassName(x*gridY + y);
    var el;
    lastClickedType = tileTypes[id];

    for (var k = cells.length - 1; k >= 0; k--) {
        if (cells[k].parentElement.parentElement.classList.contains("gridFront")){
            el = cells[k];
        }
    }

    el.innerHTML = '<div class="flip-card"> <div class="flip-card-inner"> <div class="flip-card-front"> <img src=".' + lastClickedType.front + '"> </div> <div class="flip-card-back"> <img src=".' + lastClickedType.back + '"> </div> </div> </div>'
    el.firstChild.style.transform = 'rotate('+r*90+'deg)';
    // если поле перевернуто, перевернуть маркер перед добавлением
    if (flipped){
        el.firstChild.children[0].classList.add('flipped');
    }
        // добавляем что в данной ячейке появился новый маркер
        // добавляем маркер на нижнюю доску
    var backCellNumber = +el.className + gridY - 1 - el.className%gridY*2;
    var backCell = document.getElementsByClassName(backCellNumber);

    for (var i = 0; i < backCell.length; i++) {
        if (backCell[i].parentNode.parentNode.classList.contains("gridBack")) {
            backCell[i].innerHTML = "<img src=." + lastClickedType.back + ">";
            backCell[i].style.transform = 'rotate(0deg)';
        }
    };
};





var canv;
var canvCont;
var matrix;
// эксперементальная функция(аффинные преобразования)



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

// функции отправляющие данные на сервер


async function addMarkerToServ(xn,yn,idn,rn){
    let newMark = {
        x:xn,
        y:yn,
        id:idn,
        r:rn
    }
    console.log(newMark);
    let response = await fetch("http://localhost:3000/updateFieldAdd", {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(newMark)
    });
}

async function deleteMarkerFromServ(xn,yn){
    let delMark = {
        x:xn,
        y:yn
    }
    console.log(delMark);
    let response = await fetch("http://localhost:3000/updateFieldRemove", {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(delMark)
    });
}

async function updateMarkerRotationServ(xn,yn,rn){
    let rotMark = {
        x:xn,
        y:yn,
        r:rn
    }
    console.log(rotMark);
    let response = await fetch("http://localhost:3000/updateFieldRotate", {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(rotMark)
    });
}

async function updateMarkerRotationServ(xn,yn,rn){
    let rotMark = {
        x:xn,
        y:yn,
        r:rn
    }
    console.log(rotMark);
    let response = await fetch("http://localhost:3000/updateFieldRotate", {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(rotMark)
    });
}

async function updateFieldChanges(xn,yn,typeOfChangen){
    let change = {
        x:xn,
        y:yn,
        typeOfChange:typeOfChangen
    }
    console.log(change);
    let response = await fetch("http://localhost:3000/updateFieldChanges", {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(change)
    });
}

async function loadField(){
    let response = await fetch("http://localhost:3000/getMarkersPosition");
    if (response.ok) { 
      let json = await response.json();
      for (var i = json.length - 1; i >= 0; i--) {
        AddMarkerToBoard(json[i].x,json[i].y,json[i].id,json[i].r);
      }
      changeCanv();
    } else {
      alert("Ошибка HTTP: " + response.status);
    }
 }

async function uploadFrontGridImg(){
    var backs = document.getElementsByClassName("flip-card-back");
    for (var i = backs.length - 1; i >= 0; i--) {
        backs[i].style.display = 'none'
    }
    html2canvas(document.getElementById("gridFront")).then(async function(canvas) {
        let response = await fetch("http://localhost:3000/uploadFrontImg", {
        method: 'POST',
        'Content-Type':'text/plain;charset=utf-8',
        body: canvas.toDataURL('image/png',1.0)
        });
    });
    for (var i = backs.length - 1; i >= 0; i--) {
        backs[i].style.display = 'block';
    }
}

loadField();


// функции для получения данных с сервера


async function f0(){
    let response = await fetch("http://localhost:3000/getMarkersPosition");
    if (response.ok) { 
      let json = await response.json();
      console.log(response.status);
      console.log(json);
    } else {
      alert("Ошибка HTTP: " + response.status);
    }
 }

async function f1(){
    console.log(0);
    let response = await fetch("http://localhost:3000/getFrontGridImg");
    if (response.ok) {
      console.log(response.status);
      console.log(response);
      var res = await response.blob();
      var objectURL = URL.createObjectURL(res);
      var link = document.createElement('a');
      link.download = 'FrontGrid.png';
      link.href = objectURL;
      link.click();
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

 async function f4(){
     let response = await fetch("http://localhost:3000/getRecentChanges");
    if (response.ok) { 
      let json = await response.json();
      console.log(response.status);
      console.log(json);
    } else {
      alert("Ошибка HTTP: " + response.status);
    }
 }

  function f5(){
    

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



// привязываем функции к кнопкам
 var effects = [e0,e1,e2,e3,e4,e5,e6]

  var ebuttons = document.querySelectorAll(".effBtn a");

  for (var i = ebuttons.length - 1; i >= 0; i--) {
     ebuttons[i].addEventListener("click", effects[i]);
 }


function showEffectsMenu() {
  document.getElementById("myDropdown").classList.toggle("show");
}


 function e0(){
    // canvCont.resetTransform();
    var deg = document.getElementById("i0").value;
    canvCont.clearRect(0,0,472,378);
    canvCont.translate(236,189);
    canvCont.rotate(deg * Math.PI / 180);
    // canvCont.scale(0.78,0.78)
    canvCont.translate(-236,-189);
    changeCanv();
}

 function e1(){
    var x = document.getElementById("i1").value;
    var y = document.getElementById("i11").value;
    // canvCont.resetTransform();
    canvCont.clearRect(0,0,472,378);
    canvCont.scale(x,y)
    changeCanv();
}
 function e2(){
    // canvCont.resetTransform();
    canvCont.clearRect(0,0,472,378);
    var x = document.getElementById("i2").value;
    var y = document.getElementById("i22").value;
    canvCont.setTransform(1,y,x,1,0,0);
    changeCanv();
}
 function e3(){
    var x = document.getElementById("i3").value;
    // canvCont.resetTransform();
    canvCont.clearRect(0,0,472,378);
    canvCont.filter = "blur("+x+"px)";
    changeCanv();
}
 function e4(){
    var a1 = document.getElementById("i40").value;
    var a2 = document.getElementById("i41").value;
    var a3 = document.getElementById("i42").value;
    var a4 = document.getElementById("i43").value;
    var a5 = document.getElementById("i44").value;
    var a6 = document.getElementById("i45").value;
    canvCont.clearRect(0,0,472,378);
    canvCont.setTransform(a1,a2,a3,a4,a5,a6);
    changeCanv();

}
 function e5(){
    var a1 = document.getElementById("i50").value;
    var a2 = document.getElementById("i51").value;
    var canvas = document.getElementById("canvas");
    canvas.style.transformStyle = 'preserve-3d';
    canvas.style.transform = "perspective("+a1+"px) rotateX("+a2+"deg)";
}
 function e6(){
    canv.style.filter = "blur(1px)";
}


// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn') && event.target.tagName != "A" && event.target.tagName != "INPUT") {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}