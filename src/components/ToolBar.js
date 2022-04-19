import G6 from "@antv/g6";
import insertCss from 'insert-css';
insertCss(`
  .g6-component-toolbar li {
    list-style-type: none !important;
  }
`);
export default () => {
    return new G6.ToolBar({
        position: {
            x: 10,
            y: 10
        },
    });
}