cc.Class({
    extends: require('viewCell'),

    properties: {
        label: cc.Label,
    },

    // use this for initialization
    onLoad: function () {

    },
    init: function (index, data, bigindex) {
        this._init(data.array[index], data.target, bigindex);
    },
    _init: function (data, target, bigindex) {
        this._target = target;
        if (!data) {
            this.label.string = '空';
            return;
        }

        this.label.string = bigindex;
    },
    clicked: function () {
        this._target.show(this.label.string);
    }
});
