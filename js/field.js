Field.CODE_SEQ_SEP   = ';';
Field.CODE_PARTS_SEP = '.';

function Field(size, cubesColors) {
    this.sizeX = size[0];
    this.sizeY = size[1];
    this.cubesColors = cubesColors;

    this.cubesCounters = [];

    this.cubes = [];

    this.build();
}

Field.prototype.build = function () {
    var cubesColorsNumber = this.cubesColors.length;
    this.cubesCounters = new Array(cubesColorsNumber + 1).join('0').split('');
    for (var x = 0; x < this.sizeX; ++x) {
        this.cubes[x] = [];
        for (var y = 0; y < this.sizeY; ++y) {
            var cubesColorsIndex = Math.floor(Math.random() * cubesColorsNumber);
            this.cubes[x][y] = new Cube({x: x, y: y}, this.cubesColors[cubesColorsIndex]);
            ++this.cubesCounters[cubesColorsIndex];
        }
    }
};

Field.prototype.save = function () {
    var fieldCode = "";

    var seqColorIndex = -1;
    var seqLength = 0;

    var self = this;

    this.forEachCube(function (cube) {
        var colorIndex = cube ? self.cubesColors.indexOf(cube.color) : -1

        if (!seqLength) {
            seqColorIndex = colorIndex;
            seqLength = 1;
            return;
        }

        if (colorIndex == seqColorIndex) {
            ++seqLength;
        } else {
            fieldCode += seqColorIndex + Field.CODE_PARTS_SEP + seqLength + Field.CODE_SEQ_SEP;
            seqColorIndex = colorIndex;
            seqLength = 1;
        }
    });

    fieldCode += seqColorIndex + Field.CODE_PARTS_SEP + seqLength;

    return fieldCode;
};

Field.prototype.restore = function (fieldCode) {
    var sequences = fieldCode.split(Field.CODE_SEQ_SEP);

    this.cubesCounters = this.cubesCounters.map(function () {
        return 0;
    });

    var cubeIndex = 0;
    var self = this;

    sequences.forEach(function (seq) {
        var parts = seq.split(Field.CODE_PARTS_SEP);
        var colorIndex = parts[0];
        var count = parts[1];

        while (count--) {
            var x = Math.floor(cubeIndex / self.sizeY);
            var y = cubeIndex % self.sizeY;

            if (colorIndex == -1) {
                self.cubes[x][y] = null;
            } else {
                self.cubes[x][y] = new Cube({x: x, y: y}, self.cubesColors[colorIndex]);
                ++self.cubesCounters[colorIndex];
            }
            ++cubeIndex;
        }
    });
};

Field.prototype.unselectAll = function () {
    this.forEachCube(function (cube) {
        if (cube) {
            cube.setSelected(false);
        }
    });
};

Field.prototype.removeBlock = function (pos) {
    var block = this._getBlock(pos);
    var size = block.length;

    if (!size) return size;

    var color = block[0].color;

    var self = this;
    block.forEach(function (cube) {
        self.removeCube(cube.position());
    });

    var colorIndex = this.cubesColors.indexOf(color);
    if (colorIndex != -1) {
        this.cubesCounters[colorIndex] -= size;
    }

    return size;
};

Field.prototype.selectBlock = function (pos) {
    var block = this._getBlock(pos);

    var self = this;
    block.forEach(function (cube) {
        self.selectCube(cube.position());
    });
};

Field.prototype.blockSize = function (pos) {
    var block = this._getBlock(pos);
    return block.length;
};

Field.prototype._getBlock = function (pos) {
    if (!this.withinBounds(pos)) return [];
    var targetCube = this.cubes[pos.x][pos.y];
    if (!targetCube) {
        return [];
    }

    var block = [];
    var hashTable = [];

    this._addToBlock(block, hashTable, targetCube, targetCube.color);

    return block.length > 1 ? block : [];
};

Field.prototype._addToBlock = function (block, hashTable, cube, color) {
    if (cube.color != color) return;

    var hash = JSON.stringify(cube);
    if (hashTable[hash]) return;

    block.push(cube);
    hashTable[hash] = true;

    var nearby = this._getNearbyCubes(cube.position());
    var self = this;
    nearby.forEach(function (nearbyCube) {
        self._addToBlock(block, hashTable, nearbyCube, color);
    });
};

Field.prototype._getNearbyCubes = function (pos) {
    var nearby = [];
    var nearbyPositions = [
        {x: pos.x-1, y: pos.y},
        {x: pos.x+1, y: pos.y},
        {x: pos.x,   y: pos.y-1},
        {x: pos.x,   y: pos.y+1}
    ];

    var self = this;
    nearbyPositions.forEach(function (np) {
        if (self.withinBounds(np)) {
            var cube = self.cubes[np.x][np.y];
            if (cube) nearby.push(cube);
        }
    });

    return nearby;
};

Field.prototype.forEachCube = function (fn) {
    for (var x = 0; x < this.sizeX; ++x) {
        for (var y = 0; y < this.sizeY; ++y) {
            fn(this.cubes[x][y]);
        }
    }
};

Field.prototype.removeCube = function (pos) {
    if (!this.withinBounds(pos)) return;
    this.cubes[pos.x][pos.y] = null;
};

Field.prototype.selectCube = function (pos) {
    if (!this.withinBounds(pos)) return;
    var cube = this.cubes[pos.x][pos.y];
    if (cube) {
        cube.setSelected(true);
    }
};

Field.prototype.withinBounds = function (pos) {
    return (pos.x >= 0 && pos.x < this.sizeX) &&
           (pos.y >= 0 && pos.y < this.sizeY);
};

Field.prototype.hasAvailableBlocks = function () {
    var that, left, bottom;
    for (var x = 0; x < this.sizeX; ++x) {
        for (var y = 0; y < this.sizeY; ++y) {
            that = this.cubes[x][y];
            left = this.withinBounds({x: x+1, y: y}) && this.cubes[x+1][y];
            bottom = this.withinBounds({x: x, y: y+1}) && this.cubes[x][y+1];
            if (that && ((left && left.color == that.color) || (bottom && bottom.color == that.color))) {
                return true;
            }
        }
    }
    return false;
};

Field.prototype.fallAndStick = function () {
    var yGapSize = 0;
    var xGapSize = 0;

    for (var x = 0; x < this.sizeX; ++x) {

        yGapSize = 0;
        for (var y = this.sizeY - 1; y >= 0; --y) {
            var cube = this.cubes[x][y];
            if (!cube) {
                ++yGapSize;
                continue;
            }
            if (xGapSize || yGapSize) {
                this.moveCube(cube, {
                    x: x - xGapSize,
                    y: y + yGapSize
                });
            }
        }

        if (yGapSize == this.sizeY) {
            ++xGapSize;
        }
    }
};

Field.prototype.moveCube = function (cube, newPos) {
    var prevPos = cube.position();
    if (prevPos.x == newPos.x && prevPos.y == newPos.y) return;
    this.cubes[newPos.x][newPos.y] = cube;
    this.removeCube(prevPos);
    cube.updatePosition(newPos);
};

Field.prototype.getCubesCounters = function () {
    return this.cubesCounters;
};
