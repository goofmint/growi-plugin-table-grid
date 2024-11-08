// 読み込み必須
import { Grid } from 'gridjs';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import 'gridjs/dist/theme/mermaid.css';
import './tableGrid.css';

// 足りないプロパティを追加
interface GrowiNode extends Node {
  tagName: string;
  type: string;
  id: string;
  attributes: {[key: string]: string}
  children: GrowiNode[];
  properties: {
    className: string;
    'data-line': number;
    id: string;
  };
  value: string;
}

// プラグインの関数を定義
export const plugin: Plugin = function() {
  return (tree) => {
    visit(tree, (node) => {
      const n = node as unknown as GrowiNode;
      try {
        if (n.type !== 'element' || n.tagName !== 'table') {
          return;
        }
        const [thead, tbody] = n.children;
        const columns = thead.children[0].children.map(c => c.children[0].value);
        const data = tbody.children.map(row => row.children
          .map(cell => cell.children[0].value));
        const grid = new Grid({
          columns,
          data,
          pagination: true,
          search: true,
          sort: true,
          resizable: true,
          style: {
            table: {
              border: '2px solid var(--bs-secondary-bg)',
            },
            th: {
              color: 'var(--bs-body-color)',
              backgroundColor: 'var(--bs-body-bg)',
            },
            td: {
              color: 'var(--bs-body-color)',
              backgroundColor: 'var(--bs-body-bg)',
            },
            footer: {
              backgroundColor: 'var(--bs-secondary-bg)',
            },
          },
        });
        const className = `table-grid-${Math.random().toString(36).slice(2)}`;
        n.properties.className = `${n.properties.className} ${className}`;
        const id = setInterval(() => {
          const el = document.querySelector(`.${className}`);
          if (el) {
            clearInterval(id);
            el.innerHTML = '';
            grid.render(el);
          }
        }, 1000);
      }
      catch (e) {
        n.type = 'html';
        n.value = `<div style="color: red;">Error: ${(e as Error).message}</div>`;
      }
    });
  };
};
