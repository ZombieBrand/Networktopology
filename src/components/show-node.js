 //显示所有隐藏节点
     export const showItems = (graph) => {
        graph.getNodes().forEach((node) => {
          if (!node.isVisible()) graph.showItem(node)
        })
        graph.getEdges().forEach((edge) => {
          if (!edge.isVisible()) edge.showItem(edge)
        })
        // hiddenItemIds = []
      }