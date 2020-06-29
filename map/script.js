// Убирает контекстное меню при нажатии правой кнопки мыши
document.oncontextmenu = function (){return false};

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

load_images();

function load_images() {
    for (key in images) {
        tileTypes.push(images[key]);
        console.log(tileTypes)
    }
}

// Вид сверху
var gridFront = clickableGrid(10, 8, "gridFront", [], function (el, row, col, i) {
    console.log("You clicked on element:", el);
    console.log("You clicked on row:", row);
    console.log("You clicked on col:", col);
    console.log("You clicked on item #:", i);

    el.className = 'clicked';
    if (lastClicked) {
        lastClicked.className = ''
        el.innerHTML = lastClicked.innerHTML;
        var backCell = document.getElementsByClassName(i - 1);
        for (var i = 0; i < backCell.length; i++) {
            if (backCell[i].parentNode.parentNode.classList.contains("gridBack")) {
                console.log(i)
                console.log(backCell[i].innerHTML)
                backCell[i].innerHTML = "<img src=." + lastClickedType.back + ">";
            }
        }
        console.log(backCell);
    };
    lastClicked = el;
});

document.body.appendChild(gridFront);

// Вид снизу
var gridBack = clickableGrid(10, 8, "gridBack", [], function (el, row, col, i) {
    console.log("You clicked on element:", el);
    console.log("You clicked on row:", row);
    console.log("You clicked on col:", col);
    console.log("You clicked on item #:", i);

    el.className = 'clicked';
    if (lastClicked) lastClicked.className = '';
    lastClicked = el;

});

document.body.appendChild(gridBack);


// Панель выбора маркеров
var gridSelect = clickableGrid(10, 2, "gridSelect", tileTypes, function (el, row, col, i) {
    console.log("You clicked on element:", el);
    console.log("You clicked on row:", row);
    console.log("You clicked on col:", col);
    console.log("You clicked on item #:", i);

    // Если в ячейке нету марке, то выходим
    if (el.getElementsByTagName("img").length === 0)
    {
        return 0;
    }

    el.className = 'clicked';
    if (lastClicked) lastClicked.className = '';
    lastClicked = el;
    lastClickedType = tileTypes[i - 1];
});

document.body.appendChild(gridSelect);


// Обработка клика
function clickableGrid(rows, cols, className, array, callback) {
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

            // Обрабатывает левую кнопкой мыши
            cell.addEventListener('click', (function (el, r, c, i) {
                return function () {
                    callback(el, r, c, i);
                }
            })(cell, r, c, i), false);

            // Обрабатывает правую кнопкой мыши
            cell.addEventListener('contextmenu', (function (el, r, c, i) {
                return function () {
                    callback(el, r, c, i);
                }
            })(cell, r, c, i), false);

        }
    }
    return grid;
}