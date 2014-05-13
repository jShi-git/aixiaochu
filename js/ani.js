/**
 * 系列动画
 * @author stuart.shi
 * @link http://www.shizuwu.cn
 * @time 2014.5
 */
(function() {

    var Ani = {
        opt : {},
        game : null,
        images : [],
        animations : [{
            "framerate": 10,
            "animations": {
                "run": [0, 9]
            },
            "frames": [
                //大猫
                [0, 0, 145, 195, 0],
                [145, 0, 149, 220, 0],
                [295, 0, 158, 208, 0],
                [452, 0, 164, 195, 0],
                [616, 0, 147, 190, 0],
                [763, 0, 141, 202, 0],
                [0, 195, 145, 210, 0],
                [145, 220, 164, 208, 0],
                [307, 208, 145, 208, 0],
                [450, 195, 154, 195, 0],
            ],
            "shadow": false,
            "scale": true,
            "offsetX": 37,
            "offsetY": 270
        }, {
            "framerate": 2,
            "animations": {
                "run": [0, 1]
            },
            "frames": [
                //小草
                [285, 595, 45, 28, 0],
                [284, 628, 45, 30, 0]
            ],
            "shadow": false,
            "scale": true,
            "offsetX": 14,
            "offsetY": 365
        }, {
            "framerate": 5,
            "animations": {
                "run": [0, 1]
            },
            "frames": [
                //蝴蝶
                [207, 606, 30, 30, 0, 20, 0],
                [236, 606, 30, 30, 0, 10, 5],
                [236, 606, 30, 30, 0, 0, 10],
                [236, 606, 30, 30, 0, 10, 5],
                [236, 606, 30, 30, 0, 20, 0],
            ],
            "shadow": false,
            "scale": true,
            "offsetX": 24,
            "offsetY": 355
        }, {
            "framerate": 10,
            "animations": {
                "run": [0, 2]
            },
            "frames": [
                //小熊
                [750, 202, 74, 95, 0],
                [676, 287, 75, 97, 0],
                [750, 295, 74, 94, 0]
            ],
            "shadow": false,
            "scale": true,
            "offsetX": 165,
            "offsetY": 314
        }, {
            "framerate": 10,
            "animations": {
                "run": [0, 5]
            },
            "frames": [
                //熊猫
                [603, 191, 75, 97, 0],
                [678, 191, 73, 97, 0],
                [603, 288, 74, 95, 0],
                [460, 389, 74, 95, 0],
                [533, 389, 73, 95, 0],
                [606, 382, 75, 97, 0]
            ],
            "shadow": false,
            "scale": true,
            "offsetX": 125,
            "offsetY": 314
        }, {
            "framerate": 10,
            "animations": {
                "run": [0,5]
            },
            "frames": [
                //小猫
                [824, 292, 69, 92, 0],
                [894, 271, 70, 89, 0],
                [900, 175, 75, 90, 0],
                [904, 86, 68, 89, 0],
                [903, 0, 67, 86, 0],
                [824, 202, 68, 88, 0]
            ],
            "shadow": false,
            "scale": true,
            "offsetX": 205,
            "offsetY": 321
        }, {
            "framerate": 10,
            "animations": {
                "run": [0, 5]
            },
            "frames": [
                //狐狸
                [0, 408, 70, 84, 0],
                [70, 428, 80, 90, 0],
                [149, 428, 76, 88, 0],
                [230, 428, 74, 88, 0],
                [310, 417, 75, 88, 0],
                [384, 417, 76, 88, 0]
            ],
            "shadow": false,
            "scale": true,
            "offsetX": 240,
            "offsetY": 328
        }, {
            "framerate": 6,
            "animations": {
                "run": [0,15]
            },
            "frames": [
                //兔子
                [0, 492, 60, 76, 0, 320, 70],
                [60, 518, 62, 76, 0, 260, 70],
                [122, 514, 60, 86, 0, 200, 80],
                [181, 520, 63, 76, 0, 150, 60],
                [244, 519, 71, 64, 0, 110, 45],
                [315, 506, 65, 70, 0, 50, 40],

                [383, 521, 60, 133, 0, 40, 100],
                [461, 487, 85, 206, 0, 40, 160],

                [546, 486, 58, 74, 0, 60, 200],
                [604, 486, 52, 80, 0, 120, 240],
                [657, 486, 57, 78, 0, 160, 280],
                [713, 486, 65, 80, 0, 220, 240],
                [778, 486, 74, 95, 0, 260, 200],
                [852, 483, 52, 95, 0, 300, 160],
                [904, 481, 55, 90, 0, 340, 100],
                [960, 475, 54, 80, 0, 340, 70],
            ],
            "shadow": false,
            "scale": true,
            "offsetX": 278,
            "offsetY": 360
        }, {
            "framerate": 6,
            "animations": {
                "run": [0,15]
            },
            "frames": [
                //兔子跳起的灰尘
                [],
                [],
                [],
                [],
                [],
                [],
                [],

                [546, 568, 74, 52, 0,40,15],
                [620, 568, 71, 53, 0,40,15],
                [691, 568, 81, 53, 0,40,15],
                [774, 581, 65, 48, 0,40,15],
                [839, 581, 67, 50, 0,40,15],
                [909, 581, 62, 46, 0,40,15],
                [],
                [],
                []
            ],
            "shadow": false,
            "scale": true,
            "offsetX": 278,
            "offsetY": 360
        }, {
            "framerate": 10,
            "animations": {
                "run": [0,4]
            },
            "frames": [
                //老鼠
                [681, 386, 69, 64, 0],
                [753, 391, 65, 57, 0],
                [554, 632, 63, 55, 0],
                [621, 633, 71, 51, 0],
                [698, 632, 61, 58, 0],
            ],
            "shadow": false,
            "scale": true,
            "offsetX": 290,
            "offsetY": 360
        }],

        init: function(images, gameObject, aniOpt) {
            this.images = [images];
            this.game = gameObject;
            this.opt = $.extend(this.opt, aniOpt);

            for(var i = 0; i< this.animations.length; i++) {
                this.loadAnimate(this.animations[i]);
            }
        },

        loadAnimate: function(config) {
            config.images = this.images;

            var ss = new createjs.SpriteSheet(config);
            var grant = new createjs.Sprite(ss, "run");

            grant.x = config.offsetX;
            grant.y = config.offsetY;

            if (config.shadow) {
                grant.shadow = new createjs.Shadow("#fde988", 2, 1, 15);
            }

            if (config.scale) {
                grant.scaleX = 0.5;
                grant.scaleY = 0.5;
            }

            this.game.stage.addChild(grant);
            this.game.stage.update();
        }

    };

    window.Ani = Ani;
})();