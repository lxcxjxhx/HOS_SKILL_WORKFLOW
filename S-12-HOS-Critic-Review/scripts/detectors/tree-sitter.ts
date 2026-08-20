/**
 * tree-sitter 边界检测器插件（可选工具）。
 * 对应 docs/04 §4.3 BoundaryDetector 接口。依赖 npm 包 tree-sitter + tree-sitter-typescript；
 * 未安装时 available() 返回 false，管线自动走内置 indent 启发式（干什么事调用什么工具）。
 */
import { createRequire } from 'node:module';
import type { BoundaryDetector } from '../chunker.ts';

const require = createRequire(import.meta.url);

export const treeSitterDetector: BoundaryDetector = {
  id: 'tree-sitter',
  available: () => {
    try {
      require.resolve('tree-sitter');
      require.resolve('tree-sitter-typescript');
      return true;
    } catch {
      return false;
    }
  },
  detect: async (ctx) => {
    const Parser = (await import('tree-sitter')).default;
    const tsMod = await import('tree-sitter-typescript');
    const parser = new Parser();
    parser.setLanguage(tsMod.default.typescript);
    const tree = parser.parse(ctx.text);
    const blocks: Array<{ kind: string; title: string; startLine: number; endLine: number }> = [];

    // 顶层声明收集：展开 export/export default 包装层，只取函数/类/变量声明
    const topLevel: unknown[] = [];
    const collect = (node: { type: string; namedChildren: unknown[] }) => {
      if (node.type === 'export_statement' || node.type === 'export_default_declaration') {
        if (node.namedChildren.length >= 1) collect(node.namedChildren[0] as never);
        return;
      }
      if (['function_declaration', 'class_declaration', 'lexical_declaration', 'variable_declaration'].includes(node.type)) {
        topLevel.push(node);
      }
    };
    for (const child of tree.rootNode.namedChildren) collect(child as never);

    for (const n of topLevel as Array<{ type: string; childForFieldName: (f: string) => { text?: string } | null; namedChildren: unknown[]; text: string; startPosition: { row: number }; endPosition: { row: number } }>) {
      if (n.type === 'function_declaration') {
        blocks.push({
          kind: 'code-function',
          title: n.childForFieldName('name')?.text ?? n.text.slice(0, 30),
          startLine: n.startPosition.row,
          endLine: n.endPosition.row,
        });
      } else if (n.type === 'class_declaration') {
        blocks.push({
          kind: 'code-class',
          title: n.childForFieldName('name')?.text ?? n.text.slice(0, 30),
          startLine: n.startPosition.row,
          endLine: n.endPosition.row,
        });
      } else {
        // lexical/variable_declaration：const fn = () => {} 形式
        for (const decl of n.namedChildren as Array<{ childForFieldName: (f: string) => { text?: string } | null; type: string; startPosition: { row: number }; endPosition: { row: number } }>) {
          const val = decl.childForFieldName('value');
          if (val && /arrow_function|function_expression/.test((val as { type: string }).type)) {
            blocks.push({
              kind: 'code-function',
              title: decl.childForFieldName('name')?.text ?? 'fn',
              startLine: decl.startPosition.row,
              endLine: decl.endPosition.row,
            });
          }
        }
      }
    }

    blocks.sort((a, b) => a.startLine - b.startLine);
    return blocks;
  },
};
