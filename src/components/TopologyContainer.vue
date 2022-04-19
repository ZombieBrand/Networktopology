<template>
  <div id="topologyContainer"></div>
</template>

<script>
import G6 from "@antv/g6";
import { collapseIcon, expandIcon } from "./fold-icon";
import menu from "./menu";
import toolbar from "./ToolBar";
import tooltip from "./tooltip";
import mockData from "../mockData/data";

export default {
  name: "TopologyContainer",
  data() {
    return {
      graphData: {},
      graph: null,
      layoutOptions: {},
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      // 获取并初始化数据
      this.graphData = this.initData();
      // 创建自定义连接线样式和数据
      this.initEdge();
      // 创建群组样式和数据
      this.initComboStyle();
      // 使用自动边线布局,相同节点多条线重叠
      G6.Util.processParallelEdges(this.graphData.edges);
      const container = document.getElementById("topologyContainer");
      this.graph = new G6.Graph({
        container: "topologyContainer",
        fitView: true,
        linkCenter: true,
        fitViewPadding: 40,
        groupByTypes: false,
        defaultCombo: {
          type: "cRect",
        },
        defaultNode: {
          size: 70,
          color: "#5B8FF9",
          style: {
            lineWidth: 2,
            fill: "#C6E5FF",
          },
          labelCfg: {
            style: {
              fontSize: 12,
            },
          },
        },
        defaultEdge: {
          type: "quadratic",
          style: {
            lineWidth: 2,
            stroke: "#bae7ff",
          },
          labelCfg: {
            autoRotate: true,
            style: {
              fontSize: 8,
              background: {
                fill: "#ffffff",
                stroke: "#9EC9FF",
                padding: [1, 1, 1, 1],
                radius: 2,
              },
            },
          },
        },
        comboStateStyles: {
          dragenter: {
            lineWidth: 4,
            stroke: "#FE9797",
          },
        },
        modes: {
          default: [
            "drag-combo",
            "drag-node",
            "collapse-expand-combo",
            "drag-canvas",
            "click-select",
          ],
        },
        layout: this.layoutOptions,
        plugins: [menu(this), tooltip, toolbar()],
      });
      this.graph.edge((edge) => {
        return {
          ...edge,
          type: "line-growth",
        };
      });
      this.graph.read(this.graphData);
      this.initEvent();
      // 需要延迟设置视图否则无效
      setTimeout(() => {
        this.graph.fitView(20);
      }, 500);
      if (typeof window !== "undefined")
        window.onresize = () => {
          if (!this.graph || this.graph.get("destroyed")) return;
          if (!container || !container.scrollWidth || !container.scrollHeight)
            return;
          this.graph.changeSize(
            container.scrollWidth,
            container.scrollHeight - 20
          );
        };
      this.$once("hook:beforeDestroy", () => {
        this.graph.destroy();
      });
    },
    initComboStyle() {
      const _this = this;
      G6.registerCombo(
        "cRect",
        {
          drawShape: function drawShape(cfg, group) {
            const self = this;
            // 从配置中获取填充
            cfg.padding = cfg.padding || [50, 20, 20, 20];
            // 获取形状的样式，样式在哪里。宽度和样式。高度对应于内建矩形组合图中的宽度和高度
            const style = self.getShapeStyle(cfg);
            // 添加一个矩形形状作为keyShape，这是相同的扩展矩形组合
            const rect = group.addShape("rect", {
              attrs: {
                ...style,
                x: -style.width / 2 - (cfg.padding[3] - cfg.padding[1]) / 2,
                y: -style.height / 2 - (cfg.padding[0] - cfg.padding[2]) / 2,
                width: style.width,
                height: style.height,
              },
              draggable: true,
              name: "combo-keyShape",
            });
            // 在右边添加圆圈
            group.addShape("marker", {
              attrs: {
                ...style,
                fill: "#fff",
                opacity: 1,
                // cfg.style.width和cfg.style. height对应于内置矩形组合图中的innerWidth和innerHeight
                x: cfg.style.width / 2 + cfg.padding[1],
                y: (cfg.padding[2] - cfg.padding[0]) / 2,
                r: 10,
                symbol: collapseIcon,
              },
              draggable: true,
              name: "combo-marker-shape",
            });

             // 增加统计设备信息
            const unitLabel = _this.addComboUnitLabel(cfg);
            group.addShape("text", {
              attrs: {
                ...style,
                text: unitLabel,
                x: style.width / 2 - unitLabel.length * 12,
                y: -style.height / 2,
                fontSize: 12,
                textAlign: "left",
                textBaseline: "middle",
                fill: "rgba(0,0,0,0.65)",
              },
              name: "type-text-shape",
            });
            return rect;
          },
          // 定义右圆的更新逻辑
          afterUpdate: function afterUpdate(cfg, combo) {
            const self = this;
            const group = combo.get("group");
            // 根据名称在组合的图形组中找到圆形
            const marker = group.find(
              (ele) => ele.get("name") === "combo-marker-shape"
            );
            const text = group.find(
              (ele) => ele.get("name") === "type-text-shape"
            );
            // 更新右圆的位置
            marker.attr({
              // cfg.style.width和cfg.style. height对应于内置矩形组合图中的innerWidth和innerHeight
              x: cfg.style.width / 2 + cfg.padding[1],
              y: (cfg.padding[2] - cfg.padding[0]) / 2,
              // 组合数据中的属性“collapse”表示组合的折叠状态
              // 根据“collapse”更新符号
              symbol: cfg.collapsed ? expandIcon : collapseIcon,
            });
            const style = self.getShapeStyle(cfg);

            // 更新统计设备信息
            const unitLabel = _this.addComboUnitLabel(cfg);
            text.attr({
              x: style.width / 2 - unitLabel.length * 12,
              y: -style.height / 2,
            });
          },
        },
        "rect"
      );
    },
    initEdge() {
      G6.registerEdge(
        "line-growth",
        {
          afterDraw(cfg, group) {
            // 获取连接节点模型信息
            const targetModel = cfg.targetNode.getModel();
            const sourceModel = cfg.sourceNode.getModel();
            //  非不是折叠状态设置edge label
            if (!targetModel.collapsed && !sourceModel.collapsed) {
              cfg.label = `${targetModel.deviceData.ip}->${sourceModel.deviceData.ip}`;
            }
            // 动画效果
            const shape = group.get("children")[0];
            let index = 0;
            const lineDash = [4, 2, 1, 2];
            shape.animate(
              () => {
                index++;
                if (index > 9) {
                  index = 0;
                }
                const res = {
                  lineDash,
                  lineDashOffset: -index,
                };
                return res;
              },
              {
                repeat: true, // 是否重复执行动画
                duration: 5000, //执行一次的持续时间
              }
            );
          },
        },
        "quadratic"
      );
    },
    initEvent() {
      // 当单击标记时折叠/展开
      this.graph.on("combo:click", (e) => {
        if (e.target.get("name") === "combo-marker-shape") {
          this.graph.collapseExpandCombo(e.item.getModel().id);
          // this.graph.collapseExpandCombo(e.item);
          if (this.graph.get("layout")) this.graph.layout();
          else this.graph.refreshPositions();
        }
      });

      this.graph.on("combo:dragend", (e) => {
        console.log(
          "🚀 ~ file: TopologyContainer.vue ~ line 64 ~ this.graph.on ~ e",
          e
        );
        this.graph.getCombos().forEach((combo) => {
          this.graph.setItemState(combo, "dragenter", false);
        });
      });

      this.graph.on("node:dragend", (e) => {
        console.log(
          "🚀 ~ file: TopologyContainer.vue ~ line 71 ~ this.graph.on ~ e",
          e
        );
        this.graph.getCombos().forEach((combo) => {
          this.graph.setItemState(combo, "dragenter", false);
        });
      });

      this.graph.on("combo:dragenter", (e) => {
        this.graph.setItemState(e.item, "dragenter", true);
      });
      this.graph.on("combo:dragleave", (e) => {
        this.graph.setItemState(e.item, "dragenter", false);
      });

      this.graph.on("combo:mouseenter", (evt) => {
        const { item } = evt;
        this.graph.setItemState(item, "active", true);
      });

      this.graph.on("combo:mouseleave", (evt) => {
        const { item } = evt;
        this.graph.setItemState(item, "active", false);
      });
    },
    // 初始化数据
    initData() {
      // 获取缓存数据
      const saveData = localStorage.getItem("saveData");
      if (saveData) {
        // 如果用户保存过布局和数据,返回数据并且布局不自动画处理
        return JSON.parse(saveData);
      }
      // 获取服务端接口数据
      let data = mockData();
      // 生成combos信息
      let combos = [];
      // 生成设备分类combos信息
      let deviceCombos = [];
      data.nodes.forEach((item) => {
        // combos数据处理
        let findItemToCombos = combos.findIndex((combosItem) => {
          return combosItem.id === item.comboId;
        });
        if (findItemToCombos === -1) {
          let comboData = {
            id: item.comboId,
            label: item.comboName,
          };
          combos.push(comboData);
        }
        // deviceCombos数据处理
        let findItemToDeviceCombos = deviceCombos.findIndex((combosItem) => {
          return combosItem.id === `deviceComboId-${item.deviceType}`;
        });
        if (findItemToDeviceCombos === -1) {
          let deviceCombosData = {
            id: `deviceComboId-${item.deviceType}`,
            label: item.deviceName,
            parentId: item.comboId,
          };
          deviceCombos.push(deviceCombosData);
        }
        if (typeof item.deviceType === "number") {
          item.comboId = `deviceComboId-${item.deviceType}`;
        }
      });
      const graphData = {
        nodes: data.nodes,
        edges: data.edges,
        combos: [...deviceCombos, ...combos],
      };
      console.log(graphData);
      // 如果没有用户没有保存过布局和数据, 自动布局
      this.layoutOptions = {
        type: "comboCombined",
        comboPadding: 50,
        spacing: (d) => {
          console.log(d, "layout");
          if (d.itemType === "node") {
            return 50;
          }
          return 100;
        },
        onLayoutEnd: () => {
          console.log("布局渲染完成后");
        },
      };
      return JSON.parse(JSON.stringify(graphData));
    },
    // 查看节点是否有统计描述属性,没有添加, 群组显示统计设备数量  暂时废弃
    addComboUnitLabel(cfg) {
      return cfg.parentId
        ? cfg.children.length + "台"
        : cfg.children.length + "种设备";
    },
  },
};
</script>

<style scoped>
#topologyContainer {
  height: 100vh;
  width: 100vw;
}
</style>
