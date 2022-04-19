import G6 from "@antv/g6";
export default new G6.Tooltip({
  offsetX: 10,
  offsetY: 10,
  // 允许出现 tooltip 的 item 类型
  itemTypes: ["node", "edge",'combo'],
  // 自定义 tooltip 内容
  getContent: (e) => {
    const outDiv = document.createElement("div");
    outDiv.style.width = "fit-content";
    const currentType = e.item.getType()
    const modelData = e.item.getModel()
    console.log(modelData)
    if (currentType === "node") {
      outDiv.innerHTML = `<p>设备类型：${modelData.deviceName}</p>
                        <p>设备名称：${modelData.label}</p>
                        <p>IP地址：${modelData.deviceData.ip}</p>
                        <p>MAC地址：${modelData.deviceData.mac}</p>`;
    }
    if (currentType === "edge") {
      outDiv.innerHTML = `<p>设备关系：${modelData.label}</p>`;
    }
    if(currentType === 'combo'){
      const unitLabel = modelData.parentId
      ? modelData.children.length + "台"
      : modelData.children.length + "种设备";
      const getNodes =e.item.getNodes()
      console.log({getNodes})
      outDiv.innerHTML = `<p>区域信息：${unitLabel}</p>`;
    }
    return outDiv;
  },
});
