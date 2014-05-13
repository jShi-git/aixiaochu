/**
 * 头像格子
 * @author stuart.shi
 * @link http://www.shizuwu.cn
 * @time 2014.4
 */
(function() {

    var Avatar = function(imagePath, gameObject, avatarOpt) {
        //private vars
        var opt = $.extend({
            "frame": "0",
            "width": 64,
            "height": 64,
        }, avatarOpt);
        var _this = sq = this;
        var stage = gameObject.stage;

        this.frame = opt.frame;
        this.w = opt.width;
        this.h = opt.height;
        this.startX = this.startY = 0;
        this.row = opt.row;
        this.col = opt.col;
        this.pointValue = 10;
        this.disapear = false;
        this.move = false;
        this.drop = 0;
        this.direct = "";
        this.distance = -1;
        this.delta = 10;
        this.isnew = false;
        this.sx = 50;
        this.toString = function() {
            return "     -- 帧:" + this.frame + "  列" + this.col + "  行：" + this.row + "  x:" + this.x + "  y:" + this.y + "  isnew:" + this.isnew;
        }

        //头像序列
        var spriteData = new createjs.SpriteSheet({
            images: [imagePath],
            frames: {
                width: _this.w,
                height: _this.h
            },
            animations: {
                "a1": [0],
                "a2": [1],
                "a3": [2],
                "a4": [3],
                "a5": [4],
                "a6": [5]
            }
        });

        sq.initialize(spriteData);
        sq.gotoAndStop("a" + avatarOpt.frame);

        //event listeners
        sq.addEventListener('tick', handleTick);
        sq.addEventListener('animationend', handleAnimationFinish);

        //
        sq.on("mousedown", function(evt) {
            this.parent.addChild(this);
            this.offset = {
                x: this.x - evt.stageX,
                y: this.y - evt.stageY
            };
            this.startX = evt.stageX;
            this.startY = evt.stageY;

            gameObject.log("down =>:   frame" + this.frame + "   col" + this.col + "   row:" + this.row + "  x:" + this.x + "  y:" + this.y + "  isnew:" + this.isnew);
            gameObject.log("dropCount:" + gameObject.dropCount + "  moveCount:" + gameObject.moveCount + "  timeBtn" + gameObject.timeBtn);
        });

        //任意拖动
        // sq.on("pressmove", function(evt) {
        //     this.x = evt.stageX + this.offset.x;
        //     this.y = evt.stageY + this.offset.y;
        // });

        //上下左右移动
        sq.on("pressup", function(evt) {
            var gameObj = gameObject;
            var This = this;

            if (gameObj.dropCount == 0 && gameObj.timeBtn && (Math.abs(This.startX - evt.stageX) > 10 || Math.abs(This.startY - evt.stageY) > 10)) {
                gameObj.loadSound("slide");
                gameObj.timeBtn = false;

                //  左右
                if (Math.abs(This.startX - evt.stageX) > Math.abs(This.startY - evt.stageY)) {
                    if (This.startX < evt.stageX) { //→

                        if (This.col != gameObj.colNum - 1) {
                            gameObj.changeItem(1, This);
                        }
                    } else { //←

                        if (This.col != 0) {
                            gameObj.changeItem(2, This);
                        }

                    }
                } else { //上下

                    if (This.startY < evt.stageY) { //↓
                        if (This.row != gameObj.rowNum - 1) {
                            gameObj.changeItem(3, This);
                        }

                    } else { //↑
                        if (This.row != 0) {
                            gameObj.changeItem(4, This);
                        }
                    }
                }
            }

            return false;
        });

        //handlers
        function handleTick(e) {
            var item = e.currentTarget;
            //消除动画
            if (item.disapear) {
                gameObject.score.update(sq.pointValue);

                if (item.alpha > 0) {
                    item.alpha -= 0.1;
                } else {
                    stage.removeChild(item);
                    gameObject.frameArr[item.row][item.col] = {};
                    gameObject.updateArr(item.col, item.row);
                }
            }

            //移动动画
            if (item.move) {
                var thisX = item.w * (item.col);
                var thisY = item.h * (item.row) + item.sx;

                //右移
                if (item.direct == "right") {
                    if (item.x < thisX) {
                        item.x += item.delta;
                    } else if (item.x > thisX) {
                        item.x = thisX;
                    } else {
                        resetStage(item)
                    }
                }
                //左移
                if (item.direct == "left") {
                    if (item.x > thisX) {
                        item.x -= item.delta;
                    } else if (item.x < thisX) {
                        item.x = thisX;
                    } else {
                        resetStage(item)
                    }
                }
                //上移
                if (item.direct == "up") {
                    if (item.y > thisY) {
                        item.y -= item.delta;
                    } else if (item.y < thisY) {
                        item.y = thisY;
                    } else {
                        resetStage(item)
                    }
                }
                //下移
                if (item.direct == "down") {
                    if (item.y < thisY) {
                        item.y += item.delta;
                    } else if (item.y > thisY) {
                        item.y = thisY;
                    } else {
                        resetStage(item);
                    }
                }

            } else {
                //判断是否要下落
                var thisY = item.h * (item.row) + item.sx;
                if (Math.ceil(item.y) != thisY) {
                    TweenMax.to(item, 0.4, {
                        y: Math.abs(thisY),
                        onComplete: function() {
                            // gameObject.log(item.row + "   " + item.col);
                            gameObject.frameArr[item.row][item.col] = item;
                            gameObject.dropCount--;
                        },
                        onReverseComplete: function() {}
                    });
                } else {
                    item.y = Math.ceil(item.y);
                }
            }
        }

        function resetStage(item) {
            item.move = false;

            if (gameObject.needReset) {
                gameObject.reset = true;
                gameObject.needReset = false;
            } else {
                gameObject.timeBtn = true;
            }

            if (gameObject.needMove.length > 0) {
                gameObject.remove = true;
            }
        }

        function handleAnimationFinish(e) {
            sq.stop();
        }

    }

    Avatar.prototype.constructor = Avatar;
    Avatar.prototype = new createjs.BitmapAnimation();

    window.Avatar = Avatar;
})();