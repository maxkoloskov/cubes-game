function GameView (events, fieldRenderer) {
    this.events = events;

    this.fieldRenderer = fieldRenderer;

    this.cache();
    this.listen();
}

GameView.prototype.$ = function (id) {
    return document.getElementById(id);
};

GameView.prototype.cache = function () {
    this.$messageOver = this.$('message-over');
    this.$blockScore = this.$('block-score');
    this.$totalScore = this.$('total-score');
    this.$field = this.$(this.fieldRenderer.elementId);
    this.$btnRestart = this.$('btn-restart');
    this.$btnStepBack = this.$('btn-stepback');
    this.$stepsBackCounter = this.$('stepback-count');
    this.$cubesCounters = [];
    for (var i = 0, len = this.fieldRenderer.cubesColors.length; i < len; ++i) {
        this.$cubesCounters[i] = this.$('cc' + (i + 1));
    }
};

GameView.prototype.listen = function () {
    var self = this;

    this.$field.addEventListener('mousemove', function (e) {
        self.events.emit('block:select', self.fieldRenderer.screenToCell(e.offsetX, e.offsetY));
    });

    this.$field.addEventListener('click', function (e) {
        self.events.emit('block:remove', self.fieldRenderer.screenToCell(e.offsetX, e.offsetY));
    });

    this.$field.addEventListener('mouseout', function (e) {
        self.events.emit('field:out');
    });

    this.$btnRestart.addEventListener('click', function () {
        self.events.emit('game:restart');
    });

    this.$btnStepBack.addEventListener('click', function () {
        self.events.emit('game:stepback');
    });
};

GameView.prototype.updateCubesCounters = function (values) {
    var len = Math.min(values.length, this.$cubesCounters.length);
    for (var i = 0; i < len; ++i) {
        this.$cubesCounters[i].innerHTML = values[i];
    }
};

GameView.prototype.updateBlockScore = function (score) {
    this.$blockScore.innerHTML = score;
};

GameView.prototype.updateTotalScore = function (score) {
    this.$totalScore.innerHTML = score;
};

GameView.prototype.renderField = function (field) {
    this.fieldRenderer.render(field);
};

GameView.prototype.toggleOverMessage = function (on) {
    if (on) {
        this.$messageOver.classList.remove('hide');
    } else {
        this.$messageOver.classList.add('hide');
    }
};

GameView.prototype.toggleStepBackButton = function (on) {
    if (on) {
        this.$btnStepBack.classList.remove('hide');
    } else {
        this.$btnStepBack.classList.add('hide');
    }
};

GameView.prototype.updateStepsBackCounter = function (count) {
    this.$stepsBackCounter.innerHTML = count;
};

GameView.prototype.render = function (data) {
    this.fieldRenderer.render(data.field);
    this.updateBlockScore(data.blockScore);
    this.updateTotalScore(data.totalScore);
    this.updateCubesCounters(data.cubesCounters);
    this.toggleOverMessage(data.over);
    this.updateStepsBackCounter(data.stepsBack);
    this.toggleStepBackButton(data.stepsBack > 0);
};
