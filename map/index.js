const http = require('http');
const fs = require("fs");
const path = require("path");



const gridX = 8
const gridY = 10

var gridArr = [];


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

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}



const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {

  if (req.url === "/"){
  	// fs.readFile(path.join(__dirname,'main.html'), (err,data) => {
  	// 	if (err) {
  	// 		throw err;
  	// 	}
  	// 	res.statusCode = 200;
  	// 	res.setHeader('Content-Type', 'text/html');
  	// 	  res.end("hello");
  	// });
  	
  		res.statusCode = 200;
  		res.setHeader("Access-Control-Allow-Origin", "*");
  		res.setHeader('Content-Type', 'text/plain');
  		res.end("hello");
  }

  if (req.url === "/getMarkersPosition"){
  	res.statusCode = 200;
  	res.setHeader("Access-Control-Allow-Origin", "*");
  	res.setHeader('Content-Type', 'text/json');
  	var filledCells = []
  	var cellsNum = getRandomInt(80);

  	for (var i = 0; i < gridY; i++) {
	    for (var j = 0; j < gridX; j++) {
	        gridArr[i][j] = null;
	    }
	}

  	for (var i = cellsNum - 1; i >= 0; i--) {
  		var newCell = getRandomInt(80);
  		gridArr[newCell%gridY][Math.floor(newCell/gridY)] = [];
        gridArr[newCell%gridY][Math.floor(newCell/gridY)].push(getRandomInt(6),0);
  	}

  	var response = [];
    for (var i = 0; i < gridY; i++) {
        for (var j = 0; j < gridX; j++) {
            if(gridArr[i][j]){
                response.push({
                    x: j,
                    y: i,
                    id: gridArr[i][j][0]
                });
            }
        }
    }
    response = JSON.stringify(response);

  	res.end(response);
  }



  });

server.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});