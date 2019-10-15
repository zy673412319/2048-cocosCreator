cc.Class({
    extends: cc.Component,

    properties: {
        // block  2048，预制
        block: cc.Prefab,
        // 游戏开始部分全部
        bg: cc.Sprite,
        // 当前分数：currentScoreLabel
        currentScoreLabel: cc.Label,
        // 最高分数：bestScoreLabel
        bestScoreLabel: cc.Label,
        // 两个分数值
        currentScore: 0,
        bestScore: 0,
        // 游戏完成，显示分数和重新开始部分
        gameOverMenu: cc.Node,
        // 是否进行游戏
        moving: false
    },

    // use this for initialization
    onLoad: function () {
        this.creatBgBlocks();
        // 添加手势： addTouchEvents
        this.addTouchEvents();
        this.initColor();
    },
    //start 在 onLoad后执行
    // onLoad >>> start >>> update >>> lateUpdate
    start: function () {
        // 初始化数据方法
        this.initData();
        this.gameOverMenu.getComponent('GameOverMenu').init(this);
        // cc.sys.localStorage 接口来进行用户数据存储和读取的操作。 setItem，getItem
        this.bestScore = cc.sys.localStorage.getItem('bestScore');
        if (!this.bestScore) {
            this.bestScore = 0;
        }
        // 设置Label节点的string值
        this.bestScoreLabel.getComponent(cc.Label).string = "最高分数: " + this.bestScore;
    },
    restart: function () {
        this.initData();
        this.currentScore = 0;
        this.updateSocreLabel();
    },
    // 生成block预制，方块
    creatBgBlocks: function () {
        var betweenWidth = 20;
        // cc.winSize 为当前的游戏窗口的大小。 width，height
        var size = (cc.winSize.width - betweenWidth * 5) / 4;
        this.blockSize = size;
        var x = betweenWidth + size / 2;
        var y = size;
        var s = 0;
        // 用来存储坐标点位置
        this.positions = [];
        for (var i = 0; i < 4; i++) {
            this.positions.push([]);
            for (var j = 0; j < 4; j++) {
                var b = cc.instantiate(this.block);
                // 获取预制里的label(2048)，并先隐藏掉
                b.getChildByName('label').active = false;
                // 设置预制的宽高，位置
                b.attr({
                    x: x,
                    y: y,
                    width: size,
                    height: size
                });
                this.positions[i].push(cc.p(x, y));
                // b.setPosition(cc.p(x, y));
                x += (size + betweenWidth);
                this.bg.node.addChild(b);
            }
            // 每次设置不同的位置
            y += (size + betweenWidth);
            x = betweenWidth + size / 2;
        }
    },
    /// 初始化数据
    initData: function () {
        if (this.blocks) {
            // blocks：行、列
            for (var i = 0; i < this.blocks.length; i++) {
                for (var j = 0; j < this.blocks[i].length; j++) {
                    if (this.blocks[i][j]) {
                        this.blocks[i][j].destroy();
                    }
                }
            }
        }
        this.data = [];
        this.blocks = [];
        for (var i = 0; i < 4; i++) {
            this.data.push([0, 0, 0, 0]);
            this.blocks.push([null, null, null, null]);
        }
        // addBlock(x轴，y轴，num)
        // x: 水平(0,1,2,3从下到上)， y：纵轴(0,1,2,3从右到左), num: 预制上的值[2*(num+1)]
        // var setData = [][];
        var setData = new Array()
        for (var i = 0; i < 4; i++) {
            setData[i] = new Array();
            for (var j = 0; j < 2; j++) {
                setData[i][j] = Math.floor(Math.random() * 3);
            }
        }
        this.addBlock(setData[0][0], setData[0][1], 0);
        this.addBlock(setData[1][0], setData[1][1], 0);
        this.addBlock(setData[2][0], setData[2][1], 1);
        cc.log(this.data);
    },
    getEmptyLocations: function () {
        // 空闲的位置
        var emptyLocations = [];
        for (var i = 0; i < this.data.length; i++) {
            for (var j = 0; j < this.data[i].length; j++) {
                if (this.data[i][j] == 0) {
                    // push，方法可向数组的末尾添加一个或多个元素，并返回新的长度。
                    emptyLocations.push(i * 4 + j);
                }
            }
        }
        return emptyLocations;
    },

    addBlock: function (x1, y1, num) {
        // 空闲的位置
        var emptyLocations = this.getEmptyLocations();
        console.log(emptyLocations);
        // 没有空位了
        if (emptyLocations.length == 0) {
            return false;
        }
        // Math.floor “向下取整”，或者说“向下舍入”
        var p1 = Math.floor(cc.random0To1() * emptyLocations.length);
        p1 = emptyLocations[p1];
        var x = Math.floor(p1 / 4);  //  横排位置
        var y = Math.floor(p1 % 4);  //  纵排位置
        // x,y 设置新生成预制的坐标位置
        x = x1 || x;
        y = y1 || y;
        var numbers = [2, 4];
        var n = Math.floor(cc.random0To1() * numbers.length);  // n：设置预制内容的值
        if (num != undefined) {
            n = num;
        }
        var b = cc.instantiate(this.block);
        b.attr({
            width: this.blockSize,
            height: this.blockSize,
        });
        b.setColor(this.colors[numbers[n]]);    // 根据内容值设置颜色
        b.setPosition(this.positions[x][y]);    // 设置生成预制的位置（x,y）水平，垂直
        b.getChildByName('label').getComponent(cc.Label).string = numbers[n];   // 内容值为2/4
        this.bg.node.addChild(b);
        this.blocks[x][y] = b;
        b.scaleX = 0;
        b.scaleY = 0;
        var show = cc.scaleTo(0.1, 1, 1);
        b.runAction(show);
        this.data[x][y] = numbers[n];
        return true;
    },
    /// 颜色数据
    initColor: function () {
        this.colors = [];
        this.colors[2] = cc.color(237, 241, 21, 255);
        this.colors[4] = cc.color(241, 180, 21, 255);
        this.colors[8] = cc.color(171, 241, 21, 255);
        this.colors[16] = cc.color(149, 160, 216, 255);
        this.colors[32] = cc.color(187, 149, 216, 255);
        this.colors[64] = cc.color(216, 149, 209, 255);
        this.colors[128] = cc.color(28, 118, 156, 255);
        this.colors[256] = cc.color(16, 74, 99, 255);
        this.colors[512] = cc.color(168, 85, 25, 255);
        this.colors[1024] = cc.color(236, 122, 38, 255);
        this.colors[2048] = cc.color(236, 86, 33, 255);
    },
    /// 添加手势控制
    addTouchEvents: function () {
        var self = this;
        this.node.on('touchstart', function (event) {
            this.touchStartTime = Date.now();
            // 滑动开始时获得位置
            this.touchStartPoint = event.getLocation();
            return true;
        });

        this.node.on('touchend', function (event) {
            this.touchEndTime = Date.now();
            // 结束时获得位置
            this.touchEndPoint = event.getLocation();
            // 获取水平方向，垂直方向，分别移动的位置差
            var vec = cc.p(this.touchEndPoint.x - this.touchStartPoint.x, this.touchEndPoint.y - this.touchStartPoint.y);
            var duration = this.touchEndTime - this.touchStartTime;
            /// 少于200ms才判断上下左右滑动
            if (duration < 400) {
                // console.log("moving");
                if (this.moving) {
                    // console.log("return moving");
                    return;
                }
                // x比y大，左右滑动
                var startMoveDis = 50;
                // Math.abs()：方法可返回数的绝对值。
                if (Math.abs(vec.x) > Math.abs(vec.y)) {
                    if (vec.x > startMoveDis) {
                        // cc.log("右滑");
                        self.moving = true;
                        self.moveRight();
                    } else if (vec.x < -startMoveDis) {
                        // cc.log("左滑");
                        self.moving = true;
                        self.moveLeft();
                    }
                } else { // 上下滑动
                    if (vec.y > startMoveDis) {
                        // cc.log("上滑");
                        self.moving = true;
                        self.moveUp();
                    } else if (vec.y < -startMoveDis) {
                        // cc.log("下滑");
                        self.moving = true;
                        self.moveDown();
                    }
                }
            } else {
                // console.log("> 400");
            }
        });
    },
    /**
     * 移动操作
     */
    moveAction: function (block, pos, callback) {
        var m = cc.moveTo(0.08, pos);
        var finished = cc.callFunc(function () {
            callback();
        });
        block.runAction(cc.sequence(m, finished));
    },

    /**
     * 合并操作
     */
    mergeAction: function (b1, b2, num, callback) {
        var self = this;
        b1.destroy(); // 合并后销毁
        var scale1 = cc.scaleTo(0.1, 1.1);
        var scale2 = cc.scaleTo(0.1, 1);
        var mid = cc.callFunc(function () {
            b2.setColor(self.colors[num]);
            b2.getChildByName('label').getComponent(cc.Label).string = num;
        });
        var finished = cc.callFunc(function () {
            callback();
        });
        b2.runAction(cc.sequence(scale1, mid, scale2, finished));
    },
    // 水平方向移动，从左到右，y 到 y-1
    moveLeft: function () {
        var self = this;
        var isMoved = false;   // 递归移动操作
        var merged = [];
        for (var i = 0; i < 4; i++) {
            merged.push([0, 0, 0, 0]);
        }
        var Leftmove = function (x, y, callback) {
            if (y == 0) {
                if (callback) { callback(); }
                return;
            }
            // 右边的不为0空  但是 右边的不等于当前的
            else if (self.data[x][y - 1] != 0 && self.data[x][y - 1] != self.data[x][y]) {
                if (callback) { callback(); }
                return;
            }
            // 右边的等于当前的，满足条件
            else if (self.data[x][y - 1] == self.data[x][y] && !merged[x][y - 1]) {
                merged[x][y - 1] = 1;
                self.data[x][y - 1] *= 2;   // 右边的更新为：原有值的2倍
                self.data[x][y] = 0;        // 原有的更新为：0
                var b2 = self.blocks[x][y - 1];
                var b1 = self.blocks[x][y];
                var p = self.positions[x][y - 1];
                self.blocks[x][y] = null;
                self.moveAction(b1, p, function () {
                    // b1：原有的，销毁
                    // b2：右边的，更新颜色，和值( self.data[x][y - 1] )
                    self.mergeAction(b1, b2, self.data[x][y - 1], callback);
                });
                isMoved = true;
            }
            // 右边的为空，右移
            else if (self.data[x][y - 1] == 0) {
                self.data[x][y - 1] = self.data[x][y];
                self.data[x][y] = 0;
                var b = self.blocks[x][y];
                var p = self.positions[x][y - 1];
                self.blocks[x][y - 1] = b;
                self.blocks[x][y] = null;
                self.moveAction(b, p, function () {
                    // 再次执行Leftmove方法
                    Leftmove(x, y - 1, callback);
                });
                isMoved = true;
            } else {
                callback();
            }
        };
        var total = 0;
        var counter = 0;
        var willMove = [];
        for (var y = 1; y < 4; y++) {
            for (var x = 0; x < 4; x++) {
                var n = this.data[x][y];
                if (n != 0) {
                    total += 1;
                    willMove.push({ x: x, y: y });
                }
            }
        }
        for (var i = 0; i < willMove.length; i++) {
            var x = willMove[i].x;
            var y = willMove[i].y;
            Leftmove(x, y, function () {
                counter += 1;
                if (counter == total) {
                    console.log('counter: ' + counter + " total: " + total);
                    self.afterMove(isMoved);
                }
            });
        }
    },
    // 水平方向移动，从右到左，y 到 y+1
    moveRight: function () {
        var self = this;
        var isMoved = false;   // 递归移动操作
        var merged = [];
        for (var i = 0; i < 4; i++) {
            merged.push([0, 0, 0, 0]);
        }
        var Rightmove = function (x, y, callback) {
            if (y == 3) {
                if (callback) { callback(); }
                return;
            }
            // movrRight(从右向左)， 判断x[y+1],左边一个的值，并且和当前的值不相等，就return
            else if (self.data[x][y + 1] != 0 && self.data[x][y + 1] != self.data[x][y]) {
                if (callback) { callback(); }
                return;
            }
            // 左边的值和当前值相等，
            else if (self.data[x][y + 1] == self.data[x][y] && !merged[x][y + 1]) {
                merged[x][y + 1] = 1;
                self.data[x][y + 1] *= 2;   // 左边一个的值更新， 变成原有值的2倍
                self.data[x][y] = 0;        // 清空当前值
                var b1 = self.blocks[x][y + 1];
                var b = self.blocks[x][y];
                var p = self.positions[x][y + 1];
                self.blocks[x][y] = null;
                // moveAction移动动画
                self.moveAction(b, p, function () {
                    // b：销毁
                    // b1：新预制，设置颜色和值(self.data[x][y + 1])
                    self.mergeAction(b, b1, self.data[x][y + 1], callback);
                });
                isMoved = true;
            }
            // 左边为空的情况
            else if (self.data[x][y + 1] == 0) {
                // 左边的变为当前的 并 清空当前的
                self.data[x][y + 1] = self.data[x][y];
                self.data[x][y] = 0;
                var b = self.blocks[x][y];
                var p = self.positions[x][y + 1];
                self.blocks[x][y + 1] = b;
                self.blocks[x][y] = null;
                self.moveAction(b, p, function () {
                    // y轴左移一位，再次执行Rightmove方法
                    Rightmove(x, y + 1, callback);
                    isMoved = true;
                });
            } else {
                callback();
            }
        };
        var total = 0;
        var counter = 0;
        var willMove = [];
        // 汇总0,1,2列不为0的数值
        for (var y = 2; y >= 0; y--) {
            for (var x = 0; x < 4; x++) {
                var n = this.data[x][y];
                if (n != 0) {
                    total += 1;
                    willMove.push({ x: x, y: y });
                }
            }
        }
        for (var i = 0; i < willMove.length; i++) {
            var x = willMove[i].x;
            var y = willMove[i].y;
            Rightmove(x, y, function () {
                counter += 1;
                if (counter == total) {
                    console.log('counter: ' + counter + " total: " + total);
                    self.afterMove(isMoved);
                }
            });
        }
    },
    // 垂直方向移动，从下到上，x 到 x+1
    moveUp: function () {
        var self = this;
        var isMoved = false;    // 递归移动操作
        var merged = [];
        for (var i = 0; i < 4; i++) {
            merged.push([0, 0, 0, 0]);
        }
        var Upmove = function (x, y, callback) {
            if (x == 3) {
                if (callback) { callback(); }
                return;
            }
            // 上面的值不为空，但是上面的值和当前值不相等
            else if (self.data[x + 1][y] != 0 && self.data[x + 1][y] != self.data[x][y]) {
                if (callback) { callback(); }
                return;
            }
            // 上面的值与当前值相等
            else if (self.data[x + 1][y] == self.data[x][y] && !merged[x + 1][y]) {
                merged[x + 1][y] = 1;
                self.data[x + 1][y] *= 2;   // 上方的值为原来值的2倍
                self.data[x][y] = 0;        // 清空原来的值
                var b1 = self.blocks[x + 1][y];
                var b = self.blocks[x][y];
                var p = self.positions[x + 1][y];
                self.blocks[x][y] = null;
                self.moveAction(b, p, function () {
                    // b ：销毁当前[x][y]
                    // b1：修改上面内容的颜色 和 值(self.data[x + 1][y])
                    self.mergeAction(b, b1, self.data[x + 1][y], callback);
                });
                isMoved = true;
            }
            // 上面的值为空，表示上移
            else if (self.data[x + 1][y] == 0) {
                self.data[x + 1][y] = self.data[x][y];
                self.data[x][y] = 0;
                var b = self.blocks[x][y];
                var p = self.positions[x + 1][y];
                self.blocks[x + 1][y] = b;
                self.blocks[x][y] = null;
                self.moveAction(b, p, function () {
                    // 再次执行Upmove方法
                    Upmove(x + 1, y, callback);
                    isMoved = true;
                });
            } else {
                callback();
            }

        };

        var total = 0;
        var counter = 0;
        var willMove = [];
        for (var x = 2; x >= 0; x--) {
            for (var y = 0; y < 4; y++) {
                var n = this.data[x][y];
                if (n != 0) {
                    total += 1;
                    willMove.push({ x: x, y: y });
                }
            }
        }
        for (var i = 0; i < willMove.length; i++) {
            var x = willMove[i].x;
            var y = willMove[i].y;
            Upmove(x, y, function () {
                counter += 1;
                if (counter == total) {
                    console.log('counter: ' + counter + " total: " + total);
                    self.afterMove(isMoved);
                }
            });
        }
    },
    // 垂直方法移动，从上到下。x 到 x-1
    moveDown: function () {
        var self = this;
        var isMoved = false;   // 递归移动操作
        var merged = [];
        for (var i = 0; i < 4; i++) {
            merged.push([0, 0, 0, 0]);
        }
        var move = function (x, y, callback) {
            if (x == 0) {
                if (callback) { callback(); }
                return;
            }
            // 下面的值不为空， 但是和当前值不相等
            else if (self.data[x - 1][y] != 0 && self.data[x - 1][y] != self.data[x][y]) {
                if (callback) { callback(); }
                return;
            }
            // 下面的值和当前原有的值相等
            else if (self.data[x - 1][y] == self.data[x][y] && !merged[x - 1][y]) {
                merged[x - 1][y] = 1;
                self.data[x - 1][y] *= 2;   // 下面值变为原有的2倍
                self.data[x][y] = 0;        // 清空当前的值
                var b1 = self.blocks[x - 1][y];
                var b = self.blocks[x][y];
                var p = self.positions[x - 1][y];
                self.blocks[x][y] = null;
                self.moveAction(b, p, function () {
                    self.mergeAction(b, b1, self.data[x - 1][y], callback);
                });
                isMoved = true;
            }
            else if (self.data[x - 1][y] == 0) {
                self.data[x - 1][y] = self.data[x][y];
                self.data[x][y] = 0;
                var b = self.blocks[x][y];
                var p = self.positions[x - 1][y];
                self.blocks[x - 1][y] = b;
                self.blocks[x][y] = null;

                self.moveAction(b, p, function () {
                    move(x - 1, y, callback);
                    isMoved = true;
                });
            } else {
                callback();
            }

        };

        var total = 0;
        var counter = 0;
        var willMove = [];
        for (var x = 1; x < 4; x++) {
            for (var y = 0; y < 4; y++) {
                var n = this.data[x][y];
                if (n != 0) {
                    total += 1;
                    willMove.push({ x: x, y: y });
                }
            }
        }
        for (var i = 0; i < willMove.length; i++) {
            var x = willMove[i].x;
            var y = willMove[i].y;
            move(x, y, function () {
                counter += 1;
                if (counter == total) {
                    console.log('counter: ' + counter + " total: " + total);
                    self.afterMove(isMoved);
                }
            });
        }
    },

    updateSocreLabel: function () {
        this.currentScoreLabel.getComponent(cc.Label).string = "分数: " + this.currentScore;
    },
    // 滑动完后
    afterMove: function (moved) {
        console.log('afterMove');
        if (moved) {
            this.currentScore += 1;
            this.updateSocreLabel();
            this.addBlock();
        }
        if (this.isGameOver()) {
            this.gameOver();
        }
        this.moving = false;
    },
    isGameOver: function () {
        for (var x = 0; x < 4; x++) {
            for (var y = 0; y < 4; y++) {
                var n = this.data[x][y];
                if (n == 0) {
                    return false;
                }
                if (x - 1 >= 0) {
                    if (this.data[x - 1][y] == n) {
                        return false;
                    }
                }
                if (x + 1 < 4) {
                    if (this.data[x + 1][y] == n) {
                        return false;
                    }
                }
                if (y - 1 >= 0) {
                    if (this.data[x][y - 1] == n) {
                        return false;
                    }
                }
                if (y + 1 < 4) {
                    if (this.data[x][y + 1] == n) {
                        return false;
                    }
                }
            }
        }
        return true;
    },

    gameOver: function () {
        this.gameOverMenu.getComponent('GameOverMenu').show();
        this.updateBestScore();
    }

});
