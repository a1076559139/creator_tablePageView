cc.Class({
    extends: require('viewCell'),

    properties: {
        label: cc.Label,
    },

    // use this for initialization
    onLoad: function () {

    },
    init: function (index, data) {
        this._init(data.array[index], data.target);
    },
    _init: function (data, target) {
        this._target = target;
        if (!data){
            this.label.string = '空';
            return;
        }

        this.label.string = data.name;
    },
    clicked: function () {
        this._target.show(this.label.string);
    }
});
