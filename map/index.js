const http = require('http');
const fs = require("fs");
const path = require("path");
const express = require('express');
const cors = require('cors');
var bodyParser = require('body-parser');
var multer  = require('multer')
const app = express();
const port = 3000;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "uploadTileImg"));
    },
    filename: function (req, file, cb) {
        cb(null, 'new' + '.png')
  }
})

var upload = multer({ storage: storage })

var grid = fs.readFileSync("field.json");
grid = JSON.parse(grid);
var gridChanges = fs.readFileSync("fieldChanges.json");
gridChanges = JSON.parse(gridChanges);

app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.text())

var rawParser = bodyParser.raw();

const gridX = 8;
const gridY = 10;

// Массив хронящий изменения основного поля


function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}


app.get('/', (req, res) => {
    res.send('Hello from Express!')
})

app.get('/getMarkersPosition', (req, res) => {
  	res.json(grid);
  }
 )

app.get('/getRecentChanges', (req, res) => {
  	res.json(gridChanges);
  	gridChanges = [];
  	fs.writeFileSync('fieldChanges.json', JSON.stringify(gridChanges), 'utf8');
  }
 )

app.get('/getFrontGridImg', (req, res) => {
    res.sendFile(path.join(__dirname, "out.png"));
})


app.post("/updateFieldAdd",(req, res) => {
	console.log('add',req.body);
	if (req.body.x != null && req.body.y != null && req.body.id != null && req.body.r != null){
		var add = {
	    	x:req.body.x,
	    	y:req.body.y,
	    	id:req.body.id,
	    	r:req.body.r
	    }
	    grid.push(add);
	    fs.writeFileSync('field.json', JSON.stringify(grid), 'utf8');
	    res.status(200).send();
	} else {
		res.status(400).send("Wrong request, provide x,y,id,r");
	}
})

app.post("/updateFieldRemove",(req, res) => {
	console.log('deletion',req.body);
	if (req.body.x != null && req.body.y != null){
		var del = {
	    	x:req.body.x,
	    	y:req.body.y
	    }

	    grid = grid.filter(obj => obj.x != del.x || obj.y != del.y);

	    fs.writeFileSync('field.json', JSON.stringify(grid), 'utf8');

	    res.status(200).send();
	} else {
		res.status(400).send("Wrong request, provide x,y");
	}
})

app.post("/updateFieldRotate",(req, res) => {
	console.log('rotation',req.body);
	if (req.body.x != null && req.body.y != null && req.body.r != null){
		var rot = {
	    	x:req.body.x,
	    	y:req.body.y,
	    	r:req.body.r
	    }
	    grid.find(obj => obj.x == rot.x && obj.y == rot.y).r = rot.r;
	    fs.writeFileSync('field.json', JSON.stringify(grid), 'utf8');
	    res.status(200).send();
	} else {
		res.status(400).send("Wrong request, provide x,y,r");
	}
})

app.post("/updateFieldChanges",(req, res) => {
	console.log('change',req.body);
	if (req.body.x != null && req.body.y != null && req.body.typeOfChange != null){
		var change = {
	    	x:req.body.x,
	    	y:req.body.y,
	    	typeOfChange:req.body.typeOfChange
	    }

	    var oldChange = gridChanges.find(obj => obj.x == change.x && obj.y == change.y);

	    if (oldChange){
	    	gridChanges.find(obj => obj.x == change.x && obj.y == change.y).typeOfChange = change.typeOfChange;
	    } else {
	    	gridChanges.push(change);
	    }

	    fs.writeFileSync('fieldChanges.json', JSON.stringify(gridChanges), 'utf8');

	    res.status(200).send();
	} else {
		res.status(400).send("Wrong request, provide x,y,typeOfChange");
	}
})

app.post("/uploadFrontImg",(req, res) => {
	console.log('img');
	if (req.body){
		var base64Data = req.body.replace('data:image/png;base64,','');
		fs.writeFile("out.png", base64Data, 'base64', function(err) {
		  console.log(err);
		});
		res.status(200).send();
	} else {
		res.status(400).send("Wrong request, provide x,y,typeOfChange");
	}
})

app.post('/uploadTileImg', upload.array('pic',2), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  res.status(200).send();
  if(fs.existsSync(path.join(__dirname, "uploadTileImg",req.body.markerId + '.png'))){
  	fs.unlinkSync(path.join(__dirname, "uploadTileImg",req.body.markerId + '.png'));
  }
  fs.renameSync(path.join(__dirname, "uploadTileImg",'new.png'), path.join(__dirname, "uploadTileImg",req.body.markerId + '.png'));


})

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
})