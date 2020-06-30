// Выключаем контекстное меню при нажатии правой кнопки мыши
document.oncontextmenu = function () {
    return false
};

// Размер основного поля
const gridX = 8
const gridY = 10

var lastClicked;
var lastClickedType;

var gridFrontArr = [];

for (var i = 0; i < gridY; i++) {
    nArr = [];
    for (var j = 0; j < gridX; j++) {
        nArr.push(null);
    }
    gridFrontArr.push(nArr);
}

var tileTypes = [];

// Класс маркеров (Картинка сверху, Картинка снизу)
class Tile {
    constructor(front, back) {
        this.front = front;
        this.back = back;
    }
}

// Маркеры
var images = {
    "lamp": new Tile("/png/lamp.png", "/png/QR-1.png"),
    "buzzer": new Tile("/png/buzzer.png", "/png/QR-2.png"),
    "battery": new Tile("/png/battery.png", "/png/QR-3.png"),
    "cell": new Tile("/png/cell.png", "/png/QR-4.png"),
    "fuse": new Tile("/png/fuse.png", "/png/QR-5.png"),
}

// Заполняем массив tileTypes
load_images();

function load_images() {
    for (key in images) {
        tileTypes.push(images[key]);
        console.log(tileTypes)
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
        el.innerHTML = lastClicked.innerHTML;
        el.firstChild.style.transform = 'rotate(0deg)'

        console.log(lastClickedType.back)

        var backCell = document.getElementsByClassName(el.className);
        console.log(el.className)
        for (var i = 0; i < backCell.length; i++) {
            if (backCell[i].parentNode.parentNode.classList.contains("gridBack")) {
                console.log(i)
                console.log(backCell[i].innerHTML)
                backCell[i].innerHTML = "<img src=." + lastClickedType.back + ">";
            }
        }
        console.log(backCell);
    };
};

// Удаление маркера из сетки
function gridFrontRemove(evt) {
    el = evt.target;

    var backCell = document.getElementsByClassName(el.parentNode.className);
    console.log(backCell);
    for (var i = 0; i < backCell.length; i++) {
        if (backCell[i].parentNode.parentNode.classList.contains("gridBack")) {
            console.log(i)
            console.log(backCell[i].innerHTML)
            backCell[i].firstChild.remove();
        }
    }

    evt.target.remove()
}

// Поворот маркера
function gridFrontRotate(evt) {
    el = evt.target;
    console.log(el)
    console.log(el.style.transform)

    switch (el.style.transform) {
        case 'rotate(0deg)':
            el.style.transform = 'rotate(90deg)';
            break;
        case 'rotate(90deg)':
            el.style.transform = 'rotate(180deg)';
            break;
        case 'rotate(180deg)':
            el.style.transform = 'rotate(270deg)';
            break;
        default:
            el.style.transform = 'rotate(0deg)';
    }
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
    if (evt.target.tagName === "IMG") {
        var lol = evt.target.parentElement.parentElement.parentElement.className;

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
        var lol = evt.target.parentElement.parentElement.parentElement.className;

        if (lol === "gridFront") {
            window[lol + "Remove"](evt);
        }
    }
});