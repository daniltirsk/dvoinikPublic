var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var background_color = "#001531";

function draw_background() {
    ctx.fillStyle = background_color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
draw_background();

var im_size = 70;
var data;
var level = 0;
var field = [];
var docers = [];
var docs = {
    "f1_doc": [],
    "f2_doc": [],
    "m_doc": [],
};
var path = [];
var utils = {
    "lamps": [],
    "guns": [],
    "gears": [],
    "battaries": [],
};
var selected_doc;
var start_button;
var repeat_button;

var gears_quantity = 3;

var block_start_button = false;

var gears = [];

for (var i = 0; i < 10; i++) {
    gears.push(new Image());
}

var Cell = function (type) {
    this.type = type;
    //this.start=null;
    this.x = null;
    this.y = null;
};

Cell.prototype = {
    draw: function (starting_point, i, j, padding) {
        if (padding) {
            var x = starting_point[0] + i * im_size + padding * i;
            var y = starting_point[1] + j * im_size + padding * j;
        } else {
            var x = starting_point[0] + i * im_size;
            var y = starting_point[1] + j * im_size;
        }
        //		this.start=starting_point;
        this.x = x;
        this.y = y;
        ctx.drawImage(images[this.type], x, y, im_size, im_size);
    },
    stroke: function (color) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = color;
        ctx.strokeRect(this.x + ctx.lineWidth / 2, this.y + ctx.lineWidth / 2, im_size - ctx.lineWidth, im_size - ctx.lineWidth);
    },
    restore: function () {
        ctx.drawImage(images[this.type], this.x, this.y, im_size, im_size);
    }
};

var Button = function (type) {
    this.type = type;
    //this.start=null;
    this.x = null;
    this.y = null;
};

Button.prototype = {
    draw: function (x, y) {
        this.x = x;
        this.y = y;
        ctx.drawImage(buttons[this.type], x, y, im_size, im_size);
    },
    stroke: function (color) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = color;
        ctx.strokeRect(this.x + ctx.lineWidth / 2, this.y + ctx.lineWidth / 2, im_size - ctx.lineWidth, im_size - ctx.lineWidth);
    },
    restore: function (color) {
        ctx.drawImage(buttons[this.type], this.x, this.y, im_size, im_size);
    }
};

var docers_coords = [100, 100];
var field_coords = [500, 100];

var images = {
    "cell": new Image(),
    "cell_f": new Image(),
    "cell_m": new Image(),
    "cell_start": new Image(),
    "m": new Image(),
    "f1": new Image(),
    "f2": new Image(),
    "road": new Image(),
    "bot_0": new Image(),
    "bot_1": new Image(),
    "bot_2": new Image(),
    "bot_3": new Image(),
    "finish": new Image(),
    "lamp": new Image(),
    "left": new Image(),
    "right": new Image(),
    "jump": new Image(),
    "forward": new Image(),
    "lamp_glow": new Image(),
    "gun_0": new Image(),
    "gun_1": new Image(),
    "gun_2": new Image(),
    "gun_3": new Image(),
    "ray_h": new Image(),
    "ray_v": new Image(),
    "finish_lock": new Image(),
    "gear": new Image(),
    "battary": new Image(),
    "level_completed": new Image(),
    "level_failed": new Image(),
};

var buttons = {
    "start": new Image(),
    "repeat": new Image(),
};

var buttons = {
    "start": new Image(),
    "pause": new Image(),
    "repeat": new Image(),
};

load_images();
load_buttons();


var timer_i = 0;
var lapms_quantity = 0;
var lamps_check = {};


var stack_count = [0, 0];


function main() {
    draw_decorations();
    draw_field();
    draw_bot();
    update_level_count();
    update_gears();
}

function clear_all() {
    field = [];
    docers = [];
    path = [];
    docs = {
        "f1_doc": [],
        "f2_doc": [],
        "m_doc": [],
    };
    selected_doc = null;
    placed = false;
    restore_cell = null;
    bot = {
        "cell": new Cell("bot_0"),
        "coords": [],
        "direction": 0
    };

    utils = {
        "lamps": [],
        "guns": [],
        "gears": [],
        "battaries": [],
    };

    update_gears();
    block_start_button = false;
}

var count_loaded_images = 0;

function load_images() {
    for (var i = 0; i < 10; i++) {
        gears[i].src = "../resources/try_" + i + ".png";
        gears[i].onload = function () {
            count_loaded_images++;
        }
    }

    for (key in images) {
        images[key].src = "../resources/" + key + ".png";
        images[key].onload = function () {
            count_loaded_images++;
            if (count_loaded_images == (Object.keys(images).length + gears.length)) {
                if (sessionStorage.getItem("level")) {
                    level = parseInt(sessionStorage.getItem("level"));
                }
                data = levels[level];
                main();
            }
        }
    }
}

function load_buttons() {
    for (key in buttons) {
        buttons[key].src = "../resources/" + key + ".png";
    }
}


function draw_decorations() {

    if (docers.length == 0) {
        for (var i in data["actions"]) {
            docers.push(new Cell(data["actions"][i]));
        }
        var count = 0;
        for (var i = 0; i < docers.length; i++) {
            docers[i].draw(docers_coords, Math.abs(i % 2), count, 5);
            docers[i].stroke("#82f9ff");
            if (i % 2 == 1) count++;
        }
        start_button = new Button("start");
        start_button.draw(500, 20);
        repeat_button = new Button("repeat");
        repeat_button.draw(field_coords[0] - im_size, field_coords[1] + im_size * 3);
    } else {
        for (var i = 0; i < docers.length; i++) {
            docers[i].restore();
            docers[i].stroke("#82f9ff");
        }
    }
}

function draw_field() {
    console.log(data);
    if (field.length == 0) {
        for (var i = 0; i < data['w_cells']; i++) {
            field[i] = new Array();
            for (var j = 0; j < data['h_cells']; j++) {
                field[i][j] = null;
            }
        }
        for (var i = 0; i < data['w_cells']; i++) {
            for (var j = 0; j < data['h_cells']; j++) {
                if (j == 0) {
                    field[i][j] = new Cell("cell_f");
                    docs["f1_doc"].push(field[i][j]);
                } else if (j == 1) {
                    field[i][j] = new Cell("cell_f");
                    docs["f2_doc"].push(field[i][j]);
                } else if (j == 2) {
                    field[i][j] = new Cell("cell_m");
                    docs["m_doc"].push(field[i][j]);
                } else {
                    field[i][j] = new Cell("cell");
                }
            }
        }

        var temp_path = [];
       

      

        for (var i = 0; i < data['w_cells']; i++) {
            for (var j = 0; j < data['h_cells']; j++) {
                field[i][j].draw(field_coords, i, j);
            }
        }
    } else {
        for (var i = 0; i < data['w_cells']; i++) {
            for (var j = 0; j < data['h_cells']; j++) {
                field[i][j].restore();
            }
        }
    }
}


var mouse = {
    x: 0,
    y: 0,
    down: false
};

function getMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
};

function is_mouse_in_rect(docer) {
    var x = docer.x;
    var y = docer.y;
    if (mouse.x > x && mouse.y > y && mouse.x < (x + im_size) && mouse.y < (y + im_size)) {
        return true;
    } else return false;
};

var placed = false;
var restore_type;
var restore_cell;
var copy_doc;
var selected_doc_field;



window.onmousedown = function (e) {
    if (e.button == 0) {
        mouse.x = getMousePos(e).x;
        mouse.y = getMousePos(e).y;
        if (is_mouse_in_rect(repeat_button)) {
            next_level(0);
        }
        if (block_start_button == false && is_mouse_in_rect(start_button)) {
            start_bot();
            start_button.type = "pause";
            start_button.restore();
        }
        for (var i in docers) {
            if (is_mouse_in_rect(docers[i])) {
                if (docers[i] != selected_doc) {
                    docers[i].stroke("rgb(255, 0, 0)");
                    selected_doc = new Cell(docers[i].type);
                } else {
                    docers[i].restore();
                    docers[i].stroke("#82f9ff");
                    selected_doc = null;
                }

            } else {
                docers[i].restore();
                docers[i].stroke("#82f9ff");
            }
        }
        if (selected_doc) {
            for (var i in docs) {
                for (var j in docs[i]) {
                    if (is_mouse_in_rect(docs[i][j])) {
                        apply_cell(selected_doc, docs[i][j]);
                    }
                }
            }
        }


        for (var i in docs) {
            for (var j in docs[i]) {
                if (is_mouse_in_rect(docs[i][j])) {
                    if (selected_doc) {
                        selected_doc = null;
                    } else {
                        if (selected_doc_field) {
                            if (selected_doc_field == docs[i][j]) {
                                selected_doc_field.restore();
                                selected_doc_field = null;
                            } else if (docs[i][j].type == "cell_f" || docs[i][j].type == "cell_m") {
                                apply_cell(selected_doc_field, docs[i][j]);
                                switch ((selected_doc_field.y - field_coords[1]) / im_size) {
                                    case 0:
                                        selected_doc_field.type = "cell_f";
                                        break;
                                    case 1:
                                        selected_doc_field.type = "cell_f";
                                        break;
                                    case 2:
                                        selected_doc_field.type = "cell_m";
                                        break;
                                }
                            } else if (docs[i][j].type != "cell_f" && docs[i][j].type != "cell_m") {
                                var temp_doc = docs[i][j].type;
                                docs[i][j].type = selected_doc_field.type;
                                selected_doc_field.type = temp_doc;
                                docs[i][j].restore();
                            }
                            selected_doc_field.restore();
                            selected_doc_field = null;
                        } else if (docs[i][j].type != "cell_f" && docs[i][j].type != "cell_m") {
                            selected_doc_field = docs[i][j];
                            selected_doc_field.stroke("rgb(255, 0, 0)");
                        }
                    }
                }
            }
        }
    }
}


// Важное
function apply_cell(from_cell, to_cell) {
    var tx, ty;
    tx = to_cell.x;
    ty = to_cell.y;
    to_cell.type = from_cell.type;
    to_cell.x = tx;
    to_cell.y = ty;
    to_cell.restore();
}