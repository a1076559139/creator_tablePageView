cc.Class({
    extends: require('viewCell'),

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
        label: cc.Label,

    },

    // use this for initialization
    onLoad: function () {
        this.node.on('touchstart', function (event) {
            cc.log('touchstart');
        }.bind(this));
        this.node.on('touchmove', function (params) {
            cc.log('touchmove');
        });
    },
    init: function (index) {
        // if (index > 110){
        //     this.label.string = '空';
        // } else {
        //     this.label.string = index;
        // }
        this.label.string = index;
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
