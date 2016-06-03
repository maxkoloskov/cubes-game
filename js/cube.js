function Cube(pos, color) {
    this.x = pos.x;
    this.y = pos.y;
    this.color = color;
    this.selected = false;
}

Cube.prototype.position = function () {
    return {
        x: this.x,
        y: this.y
    };
};

Cube.prototype.updatePosition = function (pos) {
    this.x = pos.x;
    this.y = pos.y;
};

Cube.prototype.setSelected = function (on) {
    this.selected = on;
};