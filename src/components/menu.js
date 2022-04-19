import G6 from "@antv/g6";
//menu菜单
export default (_this) => {
  return new G6.Menu({
    getContent(evt) {
      if (evt.target && evt.target.isCanvas && evt.target.isCanvas()) {
        return `<ul>
          <li id='save'>保存</li>
        </ul>`;
      }
    },
      /**
         * @description: 点击右键菜单
         * @param {Node} target 当前节点数据
         * @param {Node} item 图表对象
         */
    handleMenuClick: (target, item) => {
      console.log( _this.graph.save())
      console.log(item)
      const handleAssemble = {
        save: () => {
          localStorage.setItem('saveData', JSON.stringify(_this.graph.save()))
        }
      }
      handleAssemble[target.id]()
    },
    // offsetX and offsetY include the padding of the parent container
    // 需要加上父级容器的 padding-left 16 与自身偏移量 10
    offsetX: 16 + 10,
    // 需要加上父级容器的 padding-top 24 、画布兄弟元素高度、与自身偏移量 10
    offsetY: 0,
    // the types of items that allow the menu show up
    // 在哪些类型的元素上响应
    itemTypes: ["node", "edge", "canvas", "combo"],
  });
};
