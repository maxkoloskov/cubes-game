function Emitter() {
    this.listeners = {};
}

Emitter.prototype.emit = function (event, data) {
    if (this.listeners[event]) {
        this.listeners[event].forEach(function (cb) {
            cb(data);
        });
    }
};

Emitter.prototype.on = function (event, callback) {
    if (!this.listeners[event]) {
        this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
};