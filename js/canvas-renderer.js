function CanvasRenderer(opts) {
    this.fieldSize = opts.fieldSize;

    this.spacing = opts.spacing || 2;

    this.cubesColors = opts.cubesColors;

    this.elementId = opts.elementId || 'game-field';
    this.$el = document.getElementById(this.elementId);
    this.ctx = this.$el.getContext('2d');

    this.cubeWidth = (this.$el.width - (this.fieldSize[0] - 1) * this.spacing) / this.fieldSize[0];
    this.cubeHeight = (this.$el.height - (this.fieldSize[1] - 1) * this.spacing) / this.fieldSize[1];
}

CanvasRenderer.prototype.render = function(field) {
    this.ctx.clearRect(0, 0, this.$el.width, this.$el.height);
    var self = this;
    field.forEachCube(function (cube) {
        if (cube) {
            self.ctx.save();
            self._drawCube(cube.x, cube.y, cube.color, cube.selected);
            self.ctx.restore();
        }
    });
};

CanvasRenderer.prototype._drawCube = function (x, y, color, selected) {
    this.ctx.fillStyle = color;

    if (selected) {
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#dfd8d8';
        this.ctx.globalAlpha = 0.6;
    }

    this.ctx.beginPath();
    this.ctx.rect((this.cubeWidth + this.spacing)*x, (this.cubeHeight + this.spacing)*y, this.cubeWidth, this.cubeHeight);
    this.ctx.fill();
    this.ctx.closePath();
};

CanvasRenderer.prototype.screenToCell = function (posx, posy) {
    var x = Math.ceil(posx/(this.cubeWidth + this.spacing));
    var y = Math.ceil(posy/(this.cubeHeight + this.spacing));

    return {x: x-1, y: y-1};
};