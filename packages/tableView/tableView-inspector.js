"use strict";

Vue.component(
    "zp-tableView",
    {
        template: `<ui-prop v-prop="target.target"></ui-prop>
        
        <ui-prop name = "scrollView"></ui-prop>
            <div class="child">
                <ui-prop indent=1 v-prop="target.content"></ui-prop>

                <ui-prop indent=1 v-prop="target.horizontal"></ui-prop>

                <ui-prop indent=1 v-prop="target.vertical"></ui-prop>

                <ui-prop indent=1 v-prop="target.inertia"></ui-prop>

                <ui-prop indent=1 v-prop="target.breake"></ui-prop>

                <ui-prop indent=1 v-prop="target.elastic"></ui-prop>

                <ui-prop indent=1 v-prop="target.bounceDuration"></ui-prop>

                <ui-prop indent=1 v-prop="target.horizontalScrollBar"></ui-prop>

                <ui-prop indent=1 v-prop="target.verticalScrollBar"></ui-prop>

                <ui-prop indent=1 v-prop="target.scrollEvents"></ui-prop>
            </div>
        </ui-prop>
        <ui-prop name = "tableView"></ui-prop>
            <div class="child">
                <ui-prop indent=1 v-prop="target.cell"></ui-prop>
                <ui-prop indent=1 v-prop="target.touchLayer"></ui-prop>
                <ui-prop indent=1 v-prop="target.viewType"></ui-prop>
                <ui-prop indent=1 v-prop="target.Type"></ui-prop>
                <ui-prop indent=1 v-prop="target.isFill"></ui-prop>
            </div>
        </ui-prop>
        `,
        props: {
            target: {
                twoWay: !0,
                type:Object
            }
        },
        methods: {
            T:Editor.T,
        }
    }
)