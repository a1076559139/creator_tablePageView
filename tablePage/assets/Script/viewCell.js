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
        _tableView: null,
        touchLongTime: {
            default: 1,
            type: 'Float',
            range: [0, 2, 0.1],
            tooltip: '长按cell多少秒后调用touchlong'
        }
    },

    // use this for initialization
    onLoad: function () {
       
    },
    
    //出现时时调用
    reuse: function () {
        
    },

    //消失时调用
    unuse: function () {
        
    },

    //需要重写的方法

    //加载需要初始化数据时调用
    init: function (index,data) {

    },



    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
