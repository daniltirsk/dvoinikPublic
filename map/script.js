var lastClicked;

var gridFrontArr = [];

for (var i = 0; i < 10; i++) {
    nArr = [];
    for (var j = 0; j < 8; j++) {
        nArr.push(null);
    }
    gridFrontArr.push(nArr);
}

var tileTypes = [];

class tile {
    constructor(front,back) {
        this.front = front;
        this.back = back;
    }
}

var lamp = new tile("/png/lamp.png","");
tileTypes.push(lamp);

var buzzer = new tile("/png/buzzer.png","");
tileTypes.push(buzzer);

var battery = new tile("/png/battery.png","");
tileTypes.push(battery);

var cell = new tile("/png/cell.png","");
tileTypes.push(cell);

var fuse = new tile("/png/fuse.png","");
tileTypes.push(fuse);




var gridFront = clickableGrid(10,8,"gridFront",[],function(el,row,col,i){
    console.log("You clicked on element:",el);
    console.log("You clicked on row:",row);
    console.log("You clicked on col:",col);
    console.log("You clicked on item #:",i);

    el.className='clicked';
    if (lastClicked) lastClicked.className='';
    lastClicked = el;
});

document.body.appendChild(gridFront);

var gridBack = clickableGrid(10,8,"gridBack",[],function(el,row,col,i){
    console.log("You clicked on element:",el);
    console.log("You clicked on row:",row);
    console.log("You clicked on col:",col);
    console.log("You clicked on item #:",i);

    el.className='clicked';
    if (lastClicked) {
        lastClicked.className=''
        el.innerHTML = lastClicked.innerHTML;
    };
    lastClicked = el;
});

document.body.appendChild(gridBack);



var gridSelect = clickableGrid(10,2,"gridSelect", tileTypes,function(el,row,col,i){
    console.log("You clicked on element:",el);
    console.log("You clicked on row:",row);
    console.log("You clicked on col:",col);
    console.log("You clicked on item #:",i);

    el.className='clicked';
    if (lastClicked) lastClicked.className='';
    lastClicked = el;
});

document.body.appendChild(gridSelect);


     
function clickableGrid( rows, cols, className, array, callback){
    var i=0;
    var ar = 0;
    var grid = document.createElement('table');
    grid.className = className;
    for (var r=0;r<rows;++r){
        var tr = grid.appendChild(document.createElement('tr'));
        for (var c=0;c<cols;++c){
            var cell = tr.appendChild(document.createElement('td'));
            cell.innerHTML = "";
            cell.id = i++;
            if (ar < array.length) {
                console.log(1);
                console.log("<img src="+array[ar].front +">");
                cell.innerHTML = "<img src=."+array[ar].front +">";
                ar++;
            }
            cell.addEventListener('click',(function(el,r,c,i){
                return function(){
                    callback(el,r,c,i);
                }
            })(cell,r,c,i),false);
        }
    }
    return grid;
}
