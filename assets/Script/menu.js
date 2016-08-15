cc.Class({
    extends: cc.Component,

    properties: {
        tableView: require('tableview')
    },

    // use this for initialization
    onLoad: function () {

    },
    show: function (text) {
        cc.log(text);
    },
    _getdata: function (num) {
        var array = [];
        for (var i = 0; i < num; ++i) {
            var obj = {};
            obj.name = 'a' + i;
            array.push(obj);
        }
        return array;
    },
    initView: function () {
        var data = this._getdata(100);
        this.tableView.initTableView(data.length, { array: data, target: this });
    },
    nextPage: function () {
        this.tableView.scrollToNextPage();
    },
    lastPage: function () {
        this.tableView.scrollToLastPage();
    }
});
