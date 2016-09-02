cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        _isCellInit_: false
    },

    //不可以重写
    _cellAddMethodToNode_: function () {
        this.node.clicked = this.clicked.bind(this);
        this.node.on = function () {
            cc.warn('cell不支持注册on事件，所有已注册on事件失效，请重写clicked方法');
        }
    },
    _cellInit_: function () {
        if (!this._isCellInit_) {
            this._cellAddMethodToNode_();
            this._isCellInit_ = true;
        }
    },

    //可以重写的方法

    //出现时调用
    reuse: function () {

    },

    //消失时调用
    unuse: function () {

    },

    //需要重写的方法

    //cell中的子节点可以使用on事件
    //被点击时相应的方法
    clicked: function () {

    },

    //加载需要初始化数据时调用
    init: function (index, data) {

    },



    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
