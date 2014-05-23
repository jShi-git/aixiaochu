/**
 * 爱消除
 * @author stuart.shi
 * @link http://www.shizuwu.cn
 * @time 2014.4
 */
$(function() {
    var Game = {
        opts: {
            "theme": "default",
            "canvasID": "demoCanvas"
        },
        debug: true,
        sound: true,
        assets: {}, //缓存数据
        score: null, //积分元素
        canvas: null, //画布
        stage: null, //舞台
        timeBtn: true, //是否在移动
        needReset: false, //是否需要还原
        reset: false, //是否还原
        needMove: [], //需删除的元素
        remove: false,
        dir: 0, //移动方向(1→,2←,3↓,4↑)
        dirThis: null, //目标对象
        startThis: null, //拖动对象
        countAvatar: 6, //默认头像总数
        colNum: 5, //默认列数
        rowNum: 6, //默认行数
        frameArr: [], //数据矩阵
        moveCount: 0, //待消除个数
        dropCount: 0, //待下落个数
        dropArr: [],
        check: false,
        loading: null,
        loadAni: null,
        initTime: 10,
        timeCount: 10,
        timer: null,
        playCount:0, //剩余游戏次数
        sessKey:"",

        /**
         * 初始化
         * @param  {[type]} opt [description]
         * @return {[type]}     [description]
         */
        init: function(opt) {
            this.opts = $.extend(this.opts, opt);

            this.theme = this.opts.theme;
            this.canvas = document.getElementById(this.opts.canvasID);
            this.stage = new createjs.Stage(this.canvas);

            //根据页面尺寸判断画布大小(暂无)
            this.stage.width = this.canvas.width;
            this.stage.height = this.canvas.height;

            this.assets = {};

            this.playCounter();

            return this;
        },

        playCounter:function() {
            var This = this;
            var data = {
                "mod": "start"
            };
            if(This.debug) {
                This.playCount = 3;
                This.sessKey = "";
                //载入loading
                This.getAssets(Util.loading[This.theme], "loading");
            } else {
                $.ajaxGet(Util.API_HOST, data, function(respons) {
                    This.playCount = respons.playCount;
                    This.sessKey = respons.sess;

                    //载入loading
                    This.getAssets(Util.loading[This.theme], "loading");
                });
            }
        },

        createTimer: function(time) {
            if (this.timer) {
                clearInterval(this.timer);
            }
            this.timeCount = time;

            var This = this;

            $("#over").hide();
            $("#timeBar").show();
            $("#timeBar span").css({
                "width": "100%"
            });

            this.timer = setInterval(function() {
                This.timeCount--;
                var per = (This.timeCount / This.initTime) * 100;
                if (per <= 30) {
                    var color = "#e24a60";
                    $("#over").show();
                } else {
                    var color = "#2187E7";
                }
                $("#timeBar span").css({
                    "width": per + "%"
                });
                if (This.timeCount == 0) {
                    $("#over").hide();
                    This.timeUP(This);
                }
            }, 1000);
        },

        /**
         * loading
         * @return {[type]} [description]
         */
        createLoading: function() {
            //loading背景
            this.addImg(this.assets["bg"]);

            //loading动画
            //载入跑动的小猫
            this.loadAni = this.loadAnimate({
                "framerate": 10,
                "animations": {
                    "run": [0, 4]
                },
                "images": [this.assets['loading'].result],
                "frames": {
                    "height": 60,
                    "width": 75,
                    "regX": 0,
                    "regY": 0,
                    "count": 5
                },
                "shadow": true,
                "scale": false
            }, (this.stage.width - 55) / 2, (this.stage.height - 50) / 2);

            //播放登录页面背景音乐
            createjs.Sound.play("login", createjs.Sound.INTERRUPT_NONE, 0, 0, -1, 1);

            //载入排队
            Ani.init(this.assets['team'].result, this);

            //loading文字
            this.loading = new createjs.Text("0%", "bold 12px Arial", "#999");
            this.loading.maxWidth = 320;
            this.loading.textAlign = "center";
            this.loading.x = this.stage.width / 2;
            this.loading.y = this.stage.height / 2;
            this.stage.addChild(this.loading);
            this.stage.update();

            createjs.Ticker.timingMode = createjs.Ticker.RAF;
            createjs.Ticker.setFPS(10);
            createjs.Ticker.addEventListener("tick", this.stage);

            this.getAssets(Util.themes[this.theme]);

            // this.addMask();
        },

        /**
         * 载入动画
         * @param  {[type]} config  [description]
         * @param  {[type]} offsetX [description]
         * @param  {[type]} offsetY [description]
         * @return {[type]}         [description]
         */
        loadAnimate: function(config, offsetX, offsetY) {
            var ss = new createjs.SpriteSheet(config);
            var grant = new createjs.Sprite(ss, "run");

            grant.x = offsetX;
            grant.y = offsetY;

            if (config.shadow) {
                grant.shadow = new createjs.Shadow("#fde988", 2, 1, 15);
            }

            if (config.scale) {
                grant.scaleX = 0.5;
                grant.scaleY = 0.5;
            }

            this.stage.addChild(grant);
            return grant;
        },

        /**
         * 开始游戏
         * @return {[type]} [description]
         */
        startGame: function(time, type) {
            //限制次数
            if(this.playCount <= 0) {
                if(typeof type == "undefined") {
                } else {
                }
                alert("您剩余的游戏次数为0");
                return false;
            }

            createjs.Touch.enable(this.stage);

            //背景
            this.setBg(this.assets["bg"]);

            //积分
            this.makeScore();

            //头像矩阵
            this.creatMatrix();

            if(typeof type == "undefined") {
                
                //设置时间轴
                this.setTick();
            }

            //设置计时器
            this.createTimer(time);
        },

        clearStage: function() {
            console.log(this.stage);
        },

        /**
         * loading
         * @param  {[type]} event [description]
         * @return {[type]}       [description]
         */
        progressHandler: function(event) {
            // console.log(Math.floor(event.progress * 100) + "%");
            if (this.loading != null) {
                this.loading.text = Math.floor(event.progress * 100) + "%";
                this.stage.update();
            }
        },

        /**
         * 获取游戏元素
         * @param  {[type]} manifest [description]
         * @return {[type]}          [description]
         */
        getAssets: function(manifest, type) {

            var que = new createjs.LoadQueue(true);

            this.assets = {};
            que.setMaxConnections(5);
            que.on('fileload', this.handleFileLoad, this);

            if (type == "loading") {
                que.on('complete', this.createLoading, this);
            } else {
                que.on('complete', this.gameReady, this);
                que.on("progress", this.progressHandler, this);
            }

            que.installPlugin(createjs.Sound);
            createjs.Sound.alternateExtensions = ["mp3"];

            que.loadManifest(manifest);
            que.load();
        },

        /**
         * 元素载入后的处理
         * @param  {[type]} event [description]
         * @return {[type]}       [description]
         */
        handleFileLoad: function(event) {
            this.assets[event.item.id] = event;
        },

        /**
         * 素材载入完成处理
         * @return {[type]} [description]
         */
        gameReady: function() {
            this.loading.alpha = 0;
            //this.loadAni = null;
            this.stage.removeChild(this.loadAni);
            if(this.playCount > 0) {
                this.addImg(this.assets['start']);
            } else {
                this.addImg(this.assets['qzone']);
            }
            this.addImg(this.assets['myhome']);
        },

        /**
         * 设置背景
         * @param {[type]} result [description]
         */
        setBg: function(result) {
            var This = this;

            this.addImg(result);

            createjs.Sound.stop();
            createjs.Sound.play("ready", createjs.Sound.INTERRUPT_NONE, 0, 0, false, 1);

            setTimeout(function() {
                This.loadSound("bgsound", -1);
            }, 2500);
        },

        addImg: function(img) {
            var This = this;
            var result = img.result;
            var gamebg = new createjs.Shape();
            var g = gamebg.graphics;

            g.bf(result);
            g.dr(0, 0, result.width, result.height);

            if (img.item.id == "bg") {
                gamebg.scaleX = this.stage.width / result.width;
                gamebg.scaleY = this.stage.height / result.height;
            }

            if (img.item.id == 'top') {
                gamebg.x = this.stage.width - result.width - 20;
                gamebg.y = 15;

                gamebg.cursor = "pointer";
                gamebg.on("click", function() {
                    Score.getTop();
                })
            }

            if (img.item.id == "start") {
                gamebg.x = (this.stage.width - result.width) / 2 - 70;
                gamebg.y = this.stage.height - 80;

                gamebg.scaleX = gamebg.scaleY = 0.9;

                gamebg.cursor = "pointer";
                gamebg.on("click", function() {
                    This.startGame(This.initTime);
                })
            }

            if (img.item.id == "myhome") {
                gamebg.x = (this.stage.width - result.width) / 2 + 70;
                gamebg.y = this.stage.height - 105;

                gamebg.scaleX = gamebg.scaleY = 0.9;

                gamebg.cursor = "pointer";
                gamebg.on("click", function() {
                    This.goHome();
                })
            }

            if (img.item.id == "qzone") {
                gamebg.x = (this.stage.width - result.width) / 2 - 70;
                gamebg.y = this.stage.height - 80;

                gamebg.scaleX = gamebg.scaleY = 0.9;

                gamebg.cursor = "pointer";
                gamebg.on("click", function() {
                    $.shareSNS();
                })
                //gamebg.onclick = this.startGame();
            }

            this.stage.addChild(gamebg);
            this.stage.update();
        },

        /**
         * 显示个人主页
         * @return {[type]} [description]
         */
        goHome:function() {
            //获取最新的个人数据
            $.ajaxGet(Util.API_HOST, {"mod": "getrecord"}, function(respons) {
                //更新前端记录
                $("#myrecord").html("历史最高：" + $.formatNumber(respons.recordScore));
                $("#mynum").html("本周最高：" + $.formatNumber(respons.weekScore));

                $("#myItem").fadeIn();
            });
            
        },

        /**
         * 创建阵列
         * @return {[type]} [description]
         */
        creatMatrix: function() {
            this.frameArr = [];
            //初始化矩阵
            this.frameArr = this.createArr(this.rowNum, this.colNum);

            for (var c = 0; c < this.colNum; c++) {
                this.dropArr[c] = 0;
            }

            //显示图片
            this.showMatrix();
        },

        /**
         * 按阵列显示头像
         * @return {[type]} [description]
         */
        showMatrix: function() {
            for (var y = 0; y < this.frameArr.length; y++) {
                for (var x = 0; x < this.frameArr[y].length; x++) {
                    this.makeAvatar(x, y, "init");
                }
            }
        },

        /**
         * 按行列数创建数组
         * @param  {[type]} rowNum [description]
         * @param  {[type]} colNum [description]
         * @return {[type]}        [description]
         */
        createArr: function(rowNum, colNum) {
            var newArr = [];
            for (var k = 0; k < rowNum; k++) {
                newArr[k] = new Array();
                for (var j = 0; j < colNum; j++) {
                    newArr[k][j] = {};
                }
            }
            return newArr;
        },

        /**
         * 获取随机数(获取介于1-头像总数之间的随机数)
         * @return {[type]} [description]
         */
        getRandom: function() {
            return Math.ceil(Math.random() * this.countAvatar);
        },

        /**
         * 单格
         * @param  {[type]} x     [description]
         * @param  {[type]} y     [description]
         * @param  {[type]} frame [description]
         * @return {[type]}       [description]
         */
        makeAvatar: function(x, y, isnew) {
            var This = this;
            var square = new Avatar(this.assets["icons"].result, this, {
                "frame": this.getRandom(),
                "row": y,
                "col": x
            });
            if (typeof isnew == "undefined" || isnew == "init") {
                square.x = x * square.w;
                square.y = -((this.rowNum - y) * square.h + 32);
            } else {
                square.x = x * square.w;
                square.y = -(square.h * (this.rowNum - y - isnew));
            }

            if (typeof isnew != "undefined" && isnew == "init") {
                this.frameArr[y][x] = square;
                while (this.inLine(y, x)) {
                    this.makeAvatar(x, y, 'init');
                }
                this.stage.addChild(this.frameArr[y][x]);
            } else {
                square.isnew = true;
                this.frameArr[y][x] = square;
                this.stage.addChild(square);
            }

        },

        /**
         * 判断行列
         * @param  {[type]} row [description]
         * @param  {[type]} col [description]
         * @return {[type]}     [description]
         */
        inLine: function(row, col, setArr) {
            if (typeof setArr == 'undefined') {
                return this.inX(row, col) || this.inY(row, col);
            } else {
                return this.inX(row, col, setArr) || this.inY(row, col, setArr);
            }
        },

        /**
         * 判断行
         * @param  {[type]} row [description]
         * @param  {[type]} col [description]
         * @return {[type]}     [description]
         */
        inX: function(row, col, setArr) {
            if (typeof setArr == 'undefined') {
                var setArr = this.frameArr;
            }
            var frame = setArr[row][col].frame;
            var removeX = [];
            var inXCount = 0;

            for (var x = 0; x < this.colNum; x++) {
                if (typeof setArr[row][x].frame != 'undefined' && setArr[row][x].frame != '' && setArr[row][x].frame == frame) {
                    inXCount++;
                    removeX.push([row, x]);
                } else if (inXCount < 3) {
                    inXCount = 0;
                    removeX = [];
                } else {
                    break;
                }
            }

            if (inXCount >= 3) {
                return removeX;
            }

            return false;
        },

        /**
         * 判断列
         * @param  {[type]} row [description]
         * @param  {[type]} col [description]
         * @return {[type]}     [description]
         */
        inY: function(row, col, setArr) {
            if (typeof setArr == 'undefined') {
                var setArr = this.frameArr;
            }
            var frame = setArr[row][col].frame;
            var removeY = [];
            var inYCount = 0;

            for (var y = 0; y < this.rowNum; y++) {
                if (typeof setArr[y][col].frame != 'undefined' && setArr[y][col].frame != '' && setArr[y][col].frame == frame) {
                    inYCount++;
                    removeY.push([y, col]);
                } else if (inYCount < 3) {
                    inYCount = 0;
                    removeY = [];
                } else {
                    break;
                }
            }

            if (inYCount >= 3) {
                return removeY;
            }


            return false;
        },

        /**
         * 校验全局，检查是否死局或需要自动消除
         * @return {[type]} [description]
         */
        checkAll: function() {
            this.check = false;
            var hasLine = false;
            for (var y = 0; y < this.rowNum; y++) {
                for (var x = 0; x < this.colNum; x++) {
                    var remove = [];
                    var tmpArr = [];
                    tmpArr.push(this.inX(y, x));
                    tmpArr.push(this.inY(y, x));

                    for (var i = 0; i < tmpArr.length; i++) {

                        if (tmpArr[i] && $.isArray(tmpArr[i])) {

                            remove = $.merge(remove, tmpArr[i]);
                        }
                    }
                    remove = $.unique(remove);

                    if (remove.length > 0) {
                        // this.log("x:" + x + "y:" + y + ">>remove");
                        // this.log(remove);
                        this.needMove = $.merge(this.needMove, remove);

                        hasLine = true;
                        break;
                    }
                }
            }
            // hasLine = true;
            //自动消除
            if (hasLine) {
                // this.needMove = [[2,2],[2,3],[2,4],[3,2],[4,2]];
                this.needMove = this.uniqueRemove(this.needMove);

                this.remove = true;
            } else { //判断是否死局
                // if (!this.checkIsLive()) {
                //     this.log("死局");
                //     //this.creatMatrix();
                // }
            }
        },

        /**
         * 二维数组去重
         * @param  {[type]} arr [description]
         * @return {[type]}     [description]
         */
        uniqueRemove: function(arr) {
            var arrnew = [];
            for (var i = 0; i < arr.length; i++) {
                arrnew.push(arr[i].join(""));
            }
            arrnew = arrnew.unique();

            var newarr = [];
            for (var i = 0; i < arrnew.length; i++) {
                newarr.push(arrnew[i].split(""));
            }
            return newarr;
        },

        /**
         * 校验是否死局
         * @return {[type]} [description]
         */
        checkIsLive: function() {
            var cloneFrameArr = this.frameArr.clone();

            for (var y = 0; y < this.rowNum; y++) {
                for (var x = 0; x < this.colNum; x++) {
                    if (y > 0) {
                        cloneFrameArr = this.exchange(cloneFrameArr, x, y, x, y - 1);
                        if (this.inLine(y, x, cloneFrameArr)) return true;
                        cloneFrameArr = this.exchange(cloneFrameArr, x, y - 1, x, y);
                    }

                    if (y < this.rowNum - 1) {
                        cloneFrameArr = this.exchange(cloneFrameArr, x, y, x, y + 1);
                        if (this.inLine(y, x, cloneFrameArr)) return true;
                        cloneFrameArr = this.exchange(cloneFrameArr, x, y + 1, x, y);
                    }


                    if (x > 0) {
                        cloneFrameArr = this.exchange(cloneFrameArr, x, y, x - 1, y);
                        if (this.inLine(y, x, cloneFrameArr)) return true;
                        cloneFrameArr = this.exchange(cloneFrameArr, x - 1, y, x, y);
                    }

                    if (x < this.colNum - 1) {
                        cloneFrameArr = this.exchange(cloneFrameArr, x, y, x + 1, y);
                        if (this.inLine(y, x, cloneFrameArr)) return true;
                        cloneFrameArr = this.exchange(cloneFrameArr, x + 1, y, x, y);
                    }
                }
            }
            return false;
        },

        /**
         * 数组交换指定元素
         * @param  {[type]} arr  [description]
         * @param  {[type]} col1 [description]
         * @param  {[type]} row1 [description]
         * @param  {[type]} col2 [description]
         * @param  {[type]} row2 [description]
         * @return {[type]}      [description]
         */
        exchange: function(arr, x1, y1, x2, y2) {
            var tmp = arr[y1][x1];
            arr[y1][x1] = arr[y2][x2];
            arr[y2][x2] = tmp;
            return arr;
        },

        /**
         * 自动提示
         * @return {[type]} [description]
         */
        autoTip: function() {
            var cloneFrameArr = this.frameArr.clone();

        },

        /**
         * 标记要消除的块
         * @return {[type]} [description]
         */
        markDisapear: function() {
            var markCount = 0;
            var remove = [];
            var tmpArr = [];
            //获取被操作的元素相关的坐标
            tmpArr.push(this.inX(this.startThis.row, this.startThis.col));
            tmpArr.push(this.inY(this.startThis.row, this.startThis.col));
            tmpArr.push(this.inX(this.dirThis.row, this.dirThis.col));
            tmpArr.push(this.inY(this.dirThis.row, this.dirThis.col));

            for (var i = 0; i < tmpArr.length; i++) {
                if (tmpArr[i] && $.isArray(tmpArr[i])) {
                    remove = $.merge(remove, tmpArr[i]);
                }
            }
            remove = $.unique(remove);

            if (remove.length > 0) {
                //标记消除
                this.needMove = this.uniqueRemove(remove);
            } else {
                //标记还原
                this.needReset = true;
            }
        },

        /**
         * 删除元素
         * @param  {[type]} removeArr [description]
         * @return {[type]}           [description]
         */
        moveItems: function(removeArr) {
            var cols = [];
            var colCount = 0;
            var minRow = 0;
            this.moveCount = removeArr.length;

            for (var i = 0; i < removeArr.length; i++) {
                var item = this.frameArr[removeArr[i][0]][removeArr[i][1]];
                var col = removeArr[i][1];
                var row = removeArr[i][0]
                var tmpDrop = [];

                //一列只判断一次
                if ($.inArray(col, cols) == -1) {
                    minRow = removeArr[i][0];
                    colCount = 0;
                    cols.push(col);

                    //判断同列消除个数
                    for (var j = 0; j < removeArr.length; j++) {
                        if (removeArr[j][1] == col) {
                            colCount++;
                            if (removeArr[j][0] < minRow) {
                                minRow = removeArr[j][0];
                            }
                        }
                    }

                    //同列上面的元素下落
                    // console.log("第:" + (item.row + 1) + "行   第:" + (col + 1) + "列   消除" + colCount + "个   minRow:" + minRow);

                    if (minRow > 0) {
                        for (var x = 0; x < minRow; x++) {
                            var dropitem = this.frameArr[x][col];
                            tmpDrop.push(dropitem);
                            dropitem.row = x + colCount;
                            this.dropCount++;
                        }
                    }
                    this.dropArr[col] = tmpDrop.length;
                    this.log("含消除项的列")
                    this.log(cols);
                    this.log("第" + col + "列，消除" + colCount + "个");
                }

                item.disapear = true;
            }
            if (removeArr.length < 4) {
                this.loadSound("level3");
            } else if (removeArr.length > 4) {
                this.loadSound("level5");
            } else {
                this.loadSound("level4");
            }

            this.needMove = [];
        },

        /**
         * 对象按字符串输出
         * @return {[type]} [description]
         */
        showAllArr: function(arr) {
            for (var y = 0; y < this.frameArr.length; y++) {
                console.log(" >> 第" + y + "行");
                for (var x = 0; x < this.frameArr[y].length; x++) {
                    this.log(this.frameArr[y][x].toString());
                }
            }
        },


        /**
         * 对象按字符串输出
         * @return {[type]} [description]
         */
        showArr: function(arr) {
            for (var x = 0; x < arr.length; x++) {
                this.log("  ===> " + arr[x].toString());
            }
        },

        /**
         * 更新item
         * @param  {[type]} x [description]
         * @param  {[type]} y [description]
         * @param  {[type]} i [description]
         * @return {[type]}   [description]
         */
        updateItem: function(x, y, i) {
            this.frameArr[y][x] = i;
        },

        /**
         * 更新数组
         * @return {[type]} [description]
         */
        updateArr: function(x, y) {
            if (typeof this.frameArr[y][x].frame == "undefined" || this.frameArr[y][x].frame == "") {
                var newY = y - this.dropArr[x];
                this.makeAvatar(x, newY, this.dropArr[x]);

                this.dropCount++;
                this.moveCount--;
            }

            //消除并全部更新后，自动判断一次
            if (this.moveCount <= 0) {
                this.check = true;
            }

        },

        animate: function(obj, direction, distance) {
            obj.move = true;
            obj.direct = direction;
        },

        /**
         * 移动
         * @param  {[type]} dir     [description]
         * @param  {[type]} thisObj [description]
         * @return {[type]}         [description]
         */
        changeItem: function(dir, thisObj, type) {
            var This = thisObj;
            switch (dir) {
                case 1:
                    this.dir = 1;
                    var next = this.frameArr[This.row][This.col + 1];

                    this.animate(This, "right");
                    this.animate(next, "left");

                    this.frameArr[This.row][This.col] = next;
                    this.frameArr[This.row][This.col + 1] = This;

                    This.col += 1;
                    next.col -= 1;

                    this.dirThis = next;
                    this.startThis = This;

                    break;
                case 2:

                    this.dir = 2;

                    var prev = this.frameArr[This.row][This.col - 1];

                    this.animate(This, "left");
                    this.animate(prev, "right");

                    this.frameArr[This.row][This.col] = prev;
                    this.frameArr[This.row][This.col - 1] = This;

                    This.col -= 1;
                    prev.col += 1;

                    this.dirThis = prev;
                    this.startThis = This;

                    break;
                case 3:

                    this.dir = 3;

                    var down = this.frameArr[This.row + 1][This.col];

                    this.animate(This, "down");
                    this.animate(down, "up");

                    this.frameArr[This.row][This.col] = down;
                    this.frameArr[This.row + 1][This.col] = This;

                    This.row += 1;
                    down.row -= 1;

                    this.dirThis = down;
                    this.startThis = This;

                    break;
                case 4:

                    this.dir = 4;

                    var up = this.frameArr[This.row - 1][This.col];

                    this.animate(This, "up");
                    this.animate(up, "down");

                    this.frameArr[This.row][This.col] = up;
                    this.frameArr[This.row - 1][This.col] = This;

                    This.row -= 1;
                    up.row += 1;

                    this.dirThis = up;
                    this.startThis = This;

                    break;
            }
            if (type != "reset") {
                this.markDisapear();
            }
        },

        /**
         * 创建积分元素
         * @return {[type]} [description]
         */
        makeScore: function() {
            this.score = Score.init(this.stage);

            this.addImg(this.assets['top']);
        },

        /**
         * 播放声音
         * @return {[type]} [description]
         */
        loadSound: function(id, loop, volume) {
            //Play the sound: play (src, interrupt, delay, offset, loop, volume, pan)
            if (typeof loop == "undefined") {
                var loop = false;
            }
            if (typeof volume == "undefined") {
                var volume = 1
            }

            //声音添加全局开关
            if (this.sound) {
                var instance = createjs.Sound.play(id, createjs.Sound.INTERRUPT_NONE, 0, 0, loop, volume);
                if (instance == null || instance.playState == createjs.Sound.PLAY_FAILED) {
                    return;
                }

                instance.addEventListener("complete", function(instance) {

                });
            }
        },

        /**
         * 时间到
         * @return {[type]}
         */
        timeUP: function(This) {
            if (This.timer) {
                clearInterval(This.timer);
            }
            //显示结束动画
            // this.addMask();

            setTimeout(function() {
                $("#scorenum").css({
                    "fontSize": "24px",
                    "bottom": "205px"
                })
                $(".recordC,.weekC,#subnum").hide();

                //前端操作
                $("#scorenum").html($.formatNumber(This.score.currentScore));
                $("#subnum").html("历史最高：" + $.formatNumber(This.score.recordScore));

                //更新记录
                This.score.record(This.score.currentScore, This);
                if (This.score.currentScore > This.score.weekScore) {
                    
                    if (This.score.currentScore > This.score.recordScore) {
                        $("#scorenum").css({
                            "fontSize": "30px",
                            "bottom": "194px"
                        });
                        $(".recordC").show();
                    } else {
                        $("#subnum").show();
                        $(".weekC").show();
                    }
                } else {
                    $("#subnum").show();
                }

                $("#scoreItem").fadeIn();

                $("body").delegate(".return", "click", function() {
                    //$("#scoreItem").fadeOut();
                    This.score.resetScore();
                    $.shareSNS();
                });
            }, 1500);
        },

        /**
         * 设置模糊遮罩
         */
        // addMask:function() {
        //     var dataURL = this.canvas.toDataURL();
        //     var img = new Image();
        //     img.src = dataURL;

        //     var blur = new createjs.Bitmap(img);
        //     blur.filters = [new createjs.BlurFilter(10, 10, 1)];
        //     blur.cache(0, 0, this.stage.width, this.stage.height);
        //     blur.alpha = 0.9;

        //     this.stage.addChild(blur);
        //     //updateCacheImage(false);
        // },

        /**
         * 设置舞台tick
         * @param {[type]} duration [description]
         */
        setTick: function(duration) {
            var _this = this;
            if (typeof duration == "undefined") {
                duration = 20;
            }

            //createjs.Ticker.reset();
            createjs.Ticker.removeEventListener('tick');

            // createjs.Ticker.setInterval(duration);
            createjs.Ticker.setFPS(52);

            createjs.Ticker.addEventListener('tick', function() {
                //还原
                if (_this.reset) {
                    _this.reset = false;
                    _this.changeItem(_this.dir, _this.dirThis, "reset");
                }

                if (_this.dropCount < 0) {
                    _this.dropCount = 0;
                }

                //删除
                if (_this.remove && _this.needMove.length > 0) {
                    _this.remove = false;
                    _this.moveItems(_this.needMove);
                }

                if (_this.check && _this.dropCount == 0) {
                    _this.checkAll();
                }

                _this.stage.update();
            });
        },

        log: function(msg) {
            if (this.debug) {
                console.log(msg);
            }
        }

    }

    window.Game = Game;
});