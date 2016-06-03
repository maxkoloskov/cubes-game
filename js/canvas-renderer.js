function CanvasRenderer(opts) {
    this.fieldSize = opts.fieldSize;

    this.cubesColors = opts.cubesColors;

    this.elementId = opts.elementId || 'game-field';
    this.$el = document.getElementById(this.elementId);
    this.ctx = this.$el.getContext('2d');

    this.cubeWidth = this.$el.width / this.fieldSize[0];
    this.cubeHeight = this.$el.height / this.fieldSize[1];
}

CanvasRenderer.prototype.render = function(field) {
    this.ctx.clearRect(0, 0, this.$el.width, this.$el.height);
    var self = this;
    field.forEachCube(function (cube) {
        if (cube) {
            self.ctx.save();
            if (cube.selected) self.ctx.globalAlpha = 0.7;
            self._drawCube(cube.x, cube.y, cube.color);
            self.ctx.restore();
        }
    });
};

CanvasRenderer.prototype._drawCube = function (x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = '#cdc0b0';
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    this.ctx.rect(this.cubeWidth*x, this.cubeHeight*y, this.cubeWidth, this.cubeHeight);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.closePath();
};

CanvasRenderer.prototype.screenToCell = function (posx, posy) {
    var x = Math.ceil(posx/this.cubeWidth);
    var y = Math.ceil(posy/this.cubeHeight);

    return {x: x-1, y: y-1};
};