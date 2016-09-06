Vue.component('tableview-inspector', {
  template: `
  
    <ui-prop v-prop="target.cell"></ui-prop>
    <ui-prop v-prop="target.touchLayer"></ui-prop>
    <ui-prop id="viewType" v-prop="target.viewType" onchange="Editor.log({{target.viewType.value}})"></ui-prop>

    <ui-prop v-prop="target.Type"></ui-prop>
    <ui-prop v-prop="target.isFill"></ui-prop>

    <DIV style="BORDER-TOP: #00686b 1px dashed; OVERFLOW: hidden; HEIGHT: 1px"></DIV>
    <span>以下仅当viewType为pageview有效</span>
    
    <div id="pageview" style="display:block;">
        <ui-prop v-prop="target.Direction"></ui-prop>
        <cc-array-prop :target.sync="target.pageChangeEvents"></cc-array-prop>
    </div>

    <DIV style="BORDER-TOP: #00686b 1px dashed; OVERFLOW: hidden; HEIGHT: 1px"></DIV>
  `,
  props: {
    target: {
      twoWay: true,
      type: Object,
    },
  },
});