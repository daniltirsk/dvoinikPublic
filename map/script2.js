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

var tileTypes = [];

// Класс маркеров (Картинка сверху, Картинка снизу)
class Tile {
    constructor(front, back, name, markerID) {
        this.front = front;
        this.back = back;
        this.name = name;
        this.markerID = markerID;
        // this.position = 0;
    }

    // rotate(){
    //     if (this.position > 3) {
    //         this.position = this.position%4;
    //     } else {
    //         this.position++;
    //     }
    // }

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

        if (flipped){
            el.firstChild.children[0].classList.add('flipped');
        }

        gridArr[el.className%gridY][Math.floor(el.className/gridY)] = [];
        gridArr[el.className%gridY][Math.floor(el.className/gridY)].push(lastClickedType,0);
        // console.log(el.className%gridY);
        // console.log(Math.floor(el.className/gridY));
        var backCellNumber = +el.className + gridY - 1 - el.className%gridY*2;
        var backCell = document.getElementsByClassName(backCellNumber);

        for (var i = 0; i < backCell.length; i++) {
            if (backCell[i].parentNode.parentNode.classList.contains("gridBack")) {
                backCell[i].innerHTML = "<img src=." + lastClickedType.back + ">";
                backCell[i].style.transform = 'rotate(0deg)';
            }
        }
    };
    console.log(gridArr);
};

// Удаление маркера из сетки
function gridFrontRemove(evt) {
    el = evt.target.parentElement.parentElement.parentElement.parentElement;

    var frontCell = document.getElementsByClassName(el.className);

    for (var i = frontCell.length - 1; i >= 0; i--) {
        if (frontCell[i].parentNode.parentNode.classList.contains("gridFront")) {
            frontCell[i].childNodes[0].remove();
        }
    }

    gridArr[el.className%gridY][Math.floor(el.className/gridY)] = null;

    var backCellNumber = +el.className + gridY - 1 - el.className%gridY*2;
    var backCell = document.getElementsByClassName(backCellNumber);

    for (var i = 0; i < backCell.length; i++) {
        if (backCell[i].parentNode.parentNode.classList.contains("gridBack")) {
            backCell[i].firstChild.remove();
        }
    }

}

// Поворот маркера
function gridFrontRotate(evt) {
    el = evt.target.parentElement.parentElement.parentElement;

    var backCellNumber = +el.parentElement.className + gridY - 1 - el.parentElement.className%gridY*2;
    var backCell = document.getElementsByClassName(backCellNumber);
    var targetBackCell;

    for (var i = 0; i < backCell.length; i++) {
        if (backCell[i].parentNode.parentNode.classList.contains("gridBack")) {
            targetBackCell = backCell[i];
        }
    }
    
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
    console.log(gridArr);
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

//кнопка отчистки

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
}