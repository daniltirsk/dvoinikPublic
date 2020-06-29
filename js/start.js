var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var background_color = "#001531";

function draw_background() {
    ctx.fillStyle = background_color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}