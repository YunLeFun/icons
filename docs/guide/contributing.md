# 贡献图标

图标从 SVG 源文件单向生成，不直接编辑 `icons.json`。

## 流程

1. 确认图标来自 YunLeFun 品牌或应用仓库，并找到可追溯的 SVG 源文件。
2. 在 `packages/icons/metadata.json` 添加同名记录、检索标签和 GitHub 源链接。
3. 新仓库需要先在 `icons.config.ts` 登记本地 checkout，然后运行 `pnpm icons:collect` 收集规范 SVG。
4. 运行完整校验。

```bash
pnpm build
pnpm test
pnpm lint
pnpm typecheck
pnpm docs:build
```

构建链会执行 SVG 清理与 SVGO 优化，并检查 SVG 文件和元数据是否一一对应。

`pnpm icons:collect:check` 只比较各子应用源文件与仓库内 SVG 快照，不写文件。默认从本仓库的同级目录查找其他 YunLeFun 仓库，可通过 `YLF_REPOSITORIES_ROOT` 覆盖仓库根目录。普通构建不会访问这些仓库。

## 命名

- 仅使用小写 kebab-case。
- 产品优先使用稳定的产品短名，例如 `drive`、`support`。
- 不为同一图形创建重复文件；多个应用共用品牌标记时使用 `brand`。
- 不把来源不明或仅用于页面装饰的 SVG 收入应用图标集。
