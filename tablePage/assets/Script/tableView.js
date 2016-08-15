var direction = cc.Enum({ None: 0, Up: 1, Down: 2, Left: 3, Rigth: 4 });
var viewType = cc.Enum({ tableView: 0, pageView: 1 });
var Type = cc.Enum({ NONE: 0, GRID: 1 });

var _searchMaskParent = function (node) {
    if (cc.Mask) {
        var index = 0;
        var mask = null;
        for (var curr = node; curr && curr instanceof cc.Node; curr = curr.parent, ++index) {
            mask = curr.getComponent(cc.Mask);
            if (mask) {
                return {
                    index: index,
                    node: curr
                };
            }
        }
    }

    return null;
};

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
        _data: null,
        _count: 0,//一共有多少cell
        _minCellIndex: 0,//cell的最小下标
        _maxCellIndex: 0,//cell的最大下标

        //对cell进行分组管理
        _groupTotalCount: null,//共有多少组
        _groupCellCount: null,//每组有几个节点
        _groupCount: null,//最多能显示多少组

        _scrollDirection: direction.None,

        _cellPool: null,
        _scrollView: null,
        _view: null,
        _content: null,
        _cellCount: 0,//scroll下共有多少节点

        _page: 0,
        _pageTotal: 0,

        cell: cc.Prefab,
        touchLayer: cc.Node,
        Padding: {
            default: 0,
            type: 'Float',
            tooltip: '节点距离上下或左右的边距',
            visible: false
        },
        Spacing: {
            default: 0,
            type: 'Float',
            tooltip: '节点间的边距',
            visible: false
        },
        viewType: {
            default: 0,
            type: viewType
        },
        Type: {
            default: 0,
            type: Type
        },

        _canUpdateCells: false,
    },

    // use this for initialization
    onLoad: function () {
        var self = this;
        this.initTableView(700, null);

        // 添加单点触摸事件监听器
        this._touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            ower: this.touchLayer,
            mask: _searchMaskParent(this.touchLayer),
            onTouchBegan: function (touch, event) {
                var pos = touch.getLocation();
                var node = this.ower;

                if (node._hitTest(pos, this)) {
                    self._touchstart(touch);
                    return true;
                }
                return false;
            },
            onTouchMoved: function (touch, event) {
                self._touchmove(touch);
            },
            onTouchEnded: function (touch, event) {
                self._touchend(touch);
            }
        });
        if (CC_JSB) {
            this._touchListener.retain();
        }
        cc.eventManager.addListener(this._touchListener, this.touchLayer);

        if (this.viewType == viewType.pageView) {
            var _scrollView = this.getComponent(cc.ScrollView);
            _scrollView.inertia = false;
        }
    },

    //***************************************************初始化方法*************************************************//
    //初始化cell
    _initCell: function (cell) {
        if (this.Type == Type.GRID) {
            var tag = cell.tag * cell.childrenCount;
            for (var index = 0; index < cell.childrenCount; ++index) {
                var node = cell.children[index];
                node.getComponent('viewCell').init(tag + index, this._data);
            }
        } else {
            cell.getComponent('viewCell').init(cell.tag, this._data);
        }
    },
    _setCellPosition: function (node, index) {
        if (this._scrollView.horizontal) {
            if (index == 0) {
                node.x = -this._content.width * this._content.anchorX + node.width * node.anchorX + this.Padding;
            } else {
                node.x = this._content.getChildByTag(index - 1).x + node.width + this.Spacing;
            }
        } else {
            if (index == 0) {
                node.y = this._content.height * (1 - this._content.anchorY) - node.height * (1 - node.anchorY) - this.Padding;
            } else {
                node.y = this._content.getChildByTag(index - 1).y - node.height - this.Spacing;
            }
        }
    },
    _addCell: function (index) {
        var cell = this._getCell();
        cell.tag = index;
        this._setCellPosition(cell, index);
        this._initCell(cell);
        cell.parent = this._content;
    },
    clear: function () {
        if (!this._count) {
            return;
        }
        for (var index = this._content.childrenCount - 1; index >= 0; --index) {
            this._cellPool.put(this._content.children[index]);
        }
    },
    _initCellToView: function () {
        this.clear();
        for (var index = 0; index <= this._maxCellIndex; ++index) {
            this._addCell(index);
        }
    },
    _getCell: function () {
        if (!this._cellPool) {
            this._cellPool = new cc.NodePool('viewCell');
        }
        if (this._cellPool.size() == 0) {
            if (this.Type == Type.GRID) {
                var cell = cc.instantiate(this.cell);

                var node = new cc.Node();
                node.anchorX = 0.5;
                node.anchorY = 0.5;

                var length = 0;
                if (this._scrollView.horizontal) {
                    node.width = cell.width;
                    if (this._groupCellCount == null) {
                        this._groupCellCount = Math.floor((this._view.height - 2 * this.Padding + this.Spacing) / (cell.height + this.Spacing));
                    }

                    var layout = node.addComponent(cc.Layout);
                    layout.type = cc.Layout.Type.VERTICAL;
                    layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
                    layout.padding = this.Padding;
                    layout.spacingX = this.Spacing;
                    layout.horizontalDirection = cc.Layout.VerticalDirection.TOP_TO_BOTTOM;

                    for (var index = 0; index < this._groupCellCount; ++index) {
                        if (!cell) {
                            cell = cc.instantiate(this.cell);
                        }
                        cell.parent = node;
                        cell = null;
                    }
                } else {
                    node.height = cell.height;
                    if (this._groupCellCount == null) {
                        this._groupCellCount = Math.floor((this._view.width - 2 * this.Padding + this.Spacing) / (cell.width + this.Spacing));
                    }

                    var layout = node.addComponent(cc.Layout);
                    layout.type = cc.Layout.Type.HORIZONTAL;
                    layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
                    layout.padding = this.Padding;
                    layout.spacingX = this.Spacing;
                    layout.horizontalDirection = cc.Layout.HorizontalDirection.LEFT_TO_RIGHT;

                    for (var index = 0; index < this._groupCellCount; ++index) {
                        if (!cell) {
                            cell = cc.instantiate(this.cell);
                        }
                        cell.parent = node;
                        cell = null;
                    }
                }
                this._cellPool.put(node);
            } else {
                var node = cc.instantiate(this.cell);
                this._cellPool.put(node);
            }

        }
        var cell = this._cellPool.get();
        return cell;
    },
    _getCellSize: function () {
        var cell = this._getCell();
        var cellSize = cell.getContentSize();
        this._cellPool.put(cell);
        return cellSize;
    },
    reload: function () {
        for (var index = this._content.childrenCount - 1; index >= 0; --index) {
            this._initCell(this._content.children[index]);
        }
    },
    //count:cell的总个数  data:要向cell传递的数据
    initTableView: function (count, data) {
        this.clear();
        this._count = count;
        this._data = data;

        this._scrollView = this.getComponent(cc.ScrollView);
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = this.node;
        eventHandler.component = "tableView";
        eventHandler.handler = "ScrollEvent";
        this._scrollView.scrollEvents.push(eventHandler);

        this._content = this._scrollView.content;
        this._view = this._content.parent;

        this._cellSize = this._getCellSize();

        if (this.Type == Type.GRID) {
            this._count = Math.ceil(this._count / this._groupCellCount);
        }


        if (this._scrollView.horizontal) {
            this._cellCount = Math.ceil(this._view.width / this._cellSize.width) + 1;
            if (this._cellCount > this._count) {
                this._cellCount = this._count;
                this._pageTotal = 1;
            } else if (this.viewType == viewType.pageView) {
                this._pageTotal = Math.ceil(this._count / (this._cellCount - 1));
                this._count = this._pageTotal * (this._cellCount - 1);
            }

            this._content.height = this._view.height;

            this._content.width = this._count * this._cellSize.width + (this._count - 1) * this.Spacing + 2 * this.Padding;
            if (this._content.width <= this._view.width) {
                this._content.width = this._view.width + 1;
            }

            this._scrollView.scrollToLeft();
        } else {
            this._cellCount = Math.ceil(this._view.height / this._cellSize.height) + 1;
            if (this._cellCount > this._count) {
                this._cellCount = this._count;
                this._pageTotal = 1;
            } else if (this.viewType == viewType.pageView) {
                this._pageTotal = Math.ceil(this._count / (this._cellCount - 1));
                this._count = this._pageTotal * (this._cellCount - 1);
            }

            this._content.width = this._view.width;

            this._content.height = this._count * this._cellSize.height + (this._count - 1) * this.Spacing + 2 * this.Padding;
            if (this._content.height <= this._view.height) {
                this._content.height = this._view.height + 1;
            }
            this._scrollView.scrollToTop();
        }

        this._page = 1;

        this._minCellIndex = 0;
        this._maxCellIndex = this._cellCount - 1;

        this._initCellToView();

        this._canUpdateCells = true;
    },

    //*********************************************************END*********************************************************//
    _changePageNum: function (num) {
        this._page += num;

        if (this._page <= 0) {
            this._page = 1;
        } else if (this._page > this._pageTotal) {
            this._page = this._pageTotal;
        }

        cc.log(this._page);
    },
    _touchstart: function (event) {
        if (this.viewType == viewType.pageView) {
            this._tempScrollDirection = this._scrollDirection;
            this._scrollDirection = direction.None;
        }
    },
    _turnPage: function () {
        var x = this._view.width;
        var y = this._view.height;

        if (this.viewType == viewType.pageView) {

        }
    },
    _touchmove: function (event) {
        var p = event.getDelta();
        var x = p.x;
        var y = p.y;
        if (this._scrollView.horizontal) {
            y = 0;
        } else {
            x = 0;
        }
        this._getScrollDirection(x, y);
        this._tempScrollDirection = this._scrollDirection;
    },
    _touchend: function (event) {
        if (this._pageTotal <= 1) {
            return;
        }
        this._pageMove();
    },
    _pageMove: function () {
        var x = this._view.width;
        var y = this._view.height;

        if (this.viewType == viewType.pageView) {
            if (this._scrollView.horizontal) {
                y = 0;
                if (this._scrollDirection == direction.Left) {
                    this._changePageNum(1);
                } else if (this._scrollDirection == direction.Rigth) {
                    this._changePageNum(-1);
                }
            } else {
                x = 0;
                if (this._scrollDirection == direction.Up) {
                    this._changePageNum(1);
                } else if (this._scrollDirection == direction.Down) {
                    this._changePageNum(-1);
                }
            }

            x = (this._page - 1) * x;
            y = (this._page - 1) * y;

            //防止page回滚出现问题
            var offset = this._scrollView.getScrollOffset();
            if (this._scrollView.horizontal) {
                if (this._scrollDirection == direction.Left) {
                    if (-offset.x > x) {
                        this._tempScrollDirection = direction.Rigth;
                    }
                } else if (this._scrollDirection == direction.Rigth) {
                    if (-offset.x < x) {
                        this._tempScrollDirection = direction.Left;
                    }
                }
            } else {
                if (this._scrollDirection == direction.Up) {
                    if (-offset.y > y) {
                        this._tempScrollDirection = direction.Down;
                    }
                } else if (this._scrollDirection == direction.Down) {
                    if (-offset.y < y) {
                        this._tempScrollDirection = direction.Up;
                    }
                }
            }

            this._scrollDirection = this._tempScrollDirection;
            this._scrollView.scrollToOffset({ x: x, y: y }, 0.3);
        }
    },
    _getBoundingBoxToWorld: function (node) {
        var p = node.convertToWorldSpaceAR(cc.v2(-node.width * node.anchorX, -node.height * node.anchorY));
        return cc.rect(p.x, p.y, node.width, node.height);
    },
    _updateCells: function () {
        if (this._scrollView.horizontal) {
            if (this._scrollDirection == direction.Left) {
                if (this._maxCellIndex < this._count - 1) {
                    do {
                        var node = this._content.getChildByTag(this._minCellIndex);

                        var nodeBox = this._getBoundingBoxToWorld(node);
                        var viewBox = this._getBoundingBoxToWorld(this._view);

                        if (nodeBox.xMax <= viewBox.xMin) {

                            node.x = this._content.getChildByTag(this._maxCellIndex).x + node.width + this.Spacing;
                            this._minCellIndex++;
                            this._maxCellIndex++;
                            node.tag = this._maxCellIndex;
                            this._initCell(node);
                        } else {
                            break;
                        }
                    } while (true);
                }

            } else if (this._scrollDirection == direction.Rigth) {
                if (this._minCellIndex > 0) {
                    do {
                        var node = this._content.getChildByTag(this._maxCellIndex);

                        var nodeBox = this._getBoundingBoxToWorld(node);
                        var viewBox = this._getBoundingBoxToWorld(this._view);

                        if (nodeBox.xMin >= viewBox.xMax) {
                            node.x = this._content.getChildByTag(this._minCellIndex).x - node.width - this.Spacing;
                            this._minCellIndex--;
                            this._maxCellIndex--;
                            node.tag = this._minCellIndex;
                            this._initCell(node);
                        } else {
                            break;
                        }
                    } while (true);

                }
            }
        } else {
            if (this._scrollDirection == direction.Up) {
                if (this._maxCellIndex < this._count - 1) {
                    do {
                        var node = this._content.getChildByTag(this._minCellIndex);

                        var nodeBox = this._getBoundingBoxToWorld(node);
                        var viewBox = this._getBoundingBoxToWorld(this._view);

                        if (nodeBox.yMin >= viewBox.yMax) {
                            node.y = this._content.getChildByTag(this._maxCellIndex).y - node.height - this.Spacing;
                            this._minCellIndex++;
                            this._maxCellIndex++;
                            node.tag = this._maxCellIndex;
                            this._initCell(node);
                        } else {
                            break;
                        }
                    } while (true);

                }
            } else if (this._scrollDirection == direction.Down) {
                if (this._minCellIndex > 0) {
                    do {
                        var node = this._content.getChildByTag(this._maxCellIndex);

                        var nodeBox = this._getBoundingBoxToWorld(node);
                        var viewBox = this._getBoundingBoxToWorld(this._view);

                        if (nodeBox.yMax <= viewBox.yMin) {
                            node.y = this._content.getChildByTag(this._minCellIndex).y + node.height + this.Spacing;
                            this._minCellIndex--;
                            this._maxCellIndex--;
                            node.tag = this._minCellIndex;
                            this._initCell(node);
                        } else {
                            break;
                        }
                    } while (true);

                }

            } else {
                //this._scrollDirection == direction.None
            }
        }
    },
    _getScrollDirection: function (x, y) {
        if (x < 0) {
            this._scrollDirection = direction.Left;
        } else if (x > 0) {
            this._scrollDirection = direction.Rigth;
        }

        if (y < 0) {
            this._scrollDirection = direction.Down;
        } else if (y > 0) {
            this._scrollDirection = direction.Up;
        }

    },
    ScrollEvent: function (a, b) {
        if (b == cc.ScrollView.EventType.AUTOSCROLL_ENDED) {
            this._scrollDirection = direction.None;
        }
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (!this._canUpdateCells || this._pageTotal == 1) {
            return;
        }

        this._updateCells();
    },
});