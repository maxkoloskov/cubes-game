Game.FIELD_SIZE = [20, 15];
Game.CUBES_COLORS = ['#16a085', '#27ae60', '#2c3e50', '#f39c12', '#e74c3c'];
Game.GAME_FIELD_ELEMENT_ID = 'game-field';
Game.MAX_STATE_STACK_LENGTH = 5;

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

    this.stateStack = [];

    this.totalScore = 0;
    this.over = false;

    this.renderView();
};

Game.prototype.renderView = function () {
    this.view.render({
        field: this.field,
        totalScore: this.totalScore,
        blockScore: 0,
        cubesCounters: this.field.getCubesCounters(),
        stepsBack: this.stateStack.length,
        over: this.over
    });
};

Game.prototype.listen = function () {
    this.events.on('block:select', this.blockSelect.bind(this));
    this.events.on('block:remove', this.blockRemove.bind(this));
    this.events.on('field:out', this.fieldOut.bind(this));
    this.events.on('game:restart', this.restart.bind(this));
    this.events.on('game:stepback', this.restoreState.bind(this));
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
    this.saveState();

    var removedCount = this.field.removeBlock(pos);

    if (!removedCount) {
        this.restoreState();
        return;
    }

    this.totalScore += this.calcBlockCost(removedCount);
    this.field.fallAndStick();
    this.checkOver();

    this.renderView();
};

Game.prototype.fieldOut = function () {
    this.field.unselectAll();
    this.view.updateBlockScore(0);
};

Game.prototype.checkOver = function () {
    this.over = !this.field.hasAvailableBlocks();
    if (this.over) {
        this.stateStack = [];
    }
};

Game.prototype.saveState = function () {
    var state = {
        fieldCode: this.field.save(),
        totalScore: this.totalScore
    };

    if (this.stateStack.length >= Game.MAX_STATE_STACK_LENGTH) {
        this.stateStack.shift();
    }

    this.stateStack.push(state);
}

Game.prototype.restoreState = function () {
    if (!this.stateStack.length) return;

    var state = this.stateStack.pop();

    this.totalScore = state.totalScore;
    this.field.restore(state.fieldCode);

    this.renderView();
}

Game.prototype.restart = function () {
    this.init();
};

Game.prototype.calcBlockCost = function (n) {
    return (n > 1) ? (n*n - 3*n + 4) : 0;
};
