/**
 * 积分
 * @author stuart.shi
 * @link http://www.shizuwu.cn
 * @time 2014.4
 */
$(function() {

    var Score = {
        opts: {},
        currentScore: 0,
        recordScore: 0,
        weekScore: 0,
        title: null,
        track: null,
        stage: null,

        init: function(stage, opt) {
            this.opts = $.extend(this.opts, opt);
            this.stage = stage;
            this.title = new createjs.Text("Score:", "20px Arial", "#fff");
            this.track = new createjs.Text("0", "20px Arial", "#fff");

            this.stage.addChild(this.title);
            this.stage.addChild(this.track);

            this.title.x = 10;
            this.title.y = 15;

            this.track.x = 70;
            this.track.y = 15;

            this.record();

            return this;
        },

        /**
         * 游戏单局session
         * @return {[type]} [description]
         */
        getSession:function() {

        },

        /**
         * 获取排行榜
         * @return {[type]} [description]
         */
        getTop: function() {
            var This = this;
            var data = {
                "mod": "top"
            };

            $("#model").fadeIn();
            $(".bang").css({
                "position": "absolute",
                "top": "-480px"
            }).show().animate({
                "top": 40
            }, 300);

            $.ajaxGet(Util.API_HOST, data, function(respons) {
                if (respons) {
                    var items = respons['top'];
                    //组装排行榜数据
                    $("#toplist").empty();
                    for (var i in items) {
                        if (items[i].uid) {
                            if (i < 3) {
                                $("#toplist").append(This.getTopItem("horno", i, items));
                            } else {
                                $("#toplist").append(This.getTopItem("other", i, items));
                            }
                        }
                    }
                }
            });
        },

        /**
         * 生成排行榜的html代码
         * @param  {[type]} type  [description]
         * @param  {[type]} index [description]
         * @param  {[type]} items [description]
         * @return {[type]}       [description]
         */
        getTopItem: function(type, index, items) {
            var tpls = {
                'horno': '<li class="horno"><div class="num<%=num%> ico"></div><img src="<%=avatar%>" width="35" onerror="this.src=\''+Util.NO_AVATAR+'\'" /><span><%=username%>:<%=record%></span></li>',
                'other': '<li><div class="num<%=num%> num ico"></div><img src="<%=avatar%>" width="35" onerror="this.src=\''+Util.NO_AVATAR+'\'" /><span><%=username%>:<%=record%></span></li>'
            };
            return $.renderTpl(tpls[type], {
                "num": parseInt(index) + 1,
                "username": items[index].username,
                "avatar": items[index].avatar,
                "record": items[index].week_score
            })
        },

        /**
         * 更新前端积分
         * @param  {[type]} score [description]
         * @return {[type]}       [description]
         */
        update: function(score) {
            this.currentScore += score;
            this.track.text = this.currentScore;
        },

        /**
         * 积分重置
         * @return {[type]} [description]
         */
        resetScore:function() {
            this.currentScore = 0;
            this.track.text = this.currentScore;
        },

        /**
         * 获取/更新记录
         * @return {[type]} [description]
         */
        record: function(score, obj) {

			//测试，直接返回
			return false;
            var This = this;
            var data = {
                "mod": "getrecord"
            };

            if (score) {
                data.func = "update";
                data.score = score;
                data.sess = obj.sessKey;
            }

            $.ajaxGet(Util.API_HOST, data, function(respons) {
                //更新前端记录
                This.recordScore = respons.recordScore;
                This.weekScore = respons.weekScore;
                obj.playCount = respons.playCount;
                obj.sessKey = respons.sess;
            });

        }
    }

    window.Score = Score;
});