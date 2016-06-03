Game.FIELD_SIZE = [20, 15];
Game.CUBES_COLORS = ['#16a085', '#27ae60', '#2c3e50', '#f39c12', '#e74c3c'];
Game.GAME_FIELD_ELEMENT_ID = 'game-field';

function Game(FieldRenderer) {
    this.events = new Emitter();

    this.view = new GameView(
        this.events,
        new FieldRenderer({
            fieldSize: Game.FIELD_SIZE,
            cubesColors: Game.CUBES_COLORS,
            elementId: Game.GAME_FIELD_ELEMENT_ID
        })
    );

    this.init();

    this.listen();
}

Game.prototype.init = function () {

    this.field = new Field(Game.FIELD_SIZE, Game.CUBES_COLORS);

    this.totalScore = 0;

    this.over = false;

    this.view.render({
        field: this.field,
        totalScore: this.totalScore,
        blockScore: 0,
        cubesCounters: this.field.getCubesCounters(),
        over: this.over
    });
};


Game.prototype.listen = function () {
    this.events.on('block:select', this.blockSelect.bind(this));
    this.events.on('block:remove', this.blockRemove.bind(this));
    this.events.on('field:out', this.fieldOut.bind(this));
    this.events.on('game:restart', this.restart.bind(this));
};

Game.prototype.blockSelect = function (pos) {
    this.field.unselectAll();

    var blockSize = this.field.blockSize(pos);
    var blockCost = this.calcBlockCost(blockSize);

    this.view.updateBlockScore(blockCost);

    this.field.selectBlock(pos);

    this.view.renderField(this.field);
};

Game.prototype.blockRemove = function (pos) {
    var removedCount = this.field.removeBlock(pos);

    if (!removedCount) return;

    this.totalScore += this.calcBlockCost(removedCount);
    this.view.updateTotalScore(this.totalScore);
    
    this.field.fallAndStick();

    this.view.updateCubesCounters(this.field.getCubesCounters());
    this.view.renderField(this.field);

    this.checkOver();
};

Game.prototype.fieldOut = function () {
    this.field.unselectAll();
    this.view.updateBlockScore(0);
};

Game.prototype.checkOver = function () {
    this.over = !this.field.hasAvailableBlocks();
    if (this.over) {
        this.view.showOverMessage();
    }
};

Game.prototype.restart = function () {
    this.init();
};

Game.prototype.calcBlockCost = function (n) {
    return (n > 1) ? (n*n - 3*n + 4) : 0;
};