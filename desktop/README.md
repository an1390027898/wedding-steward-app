# 婚礼管家桌面版

桌面版与手机版使用同一套业务界面，数据保存在当前电脑本机。

## 本地预览

```bash
npm run desktop:dev
```

## 生成安装包

```bash
npm run desktop:dist:win
npm run desktop:dist:mac
```

也可以在 GitHub 仓库的 Actions 页面手动运行 `Build desktop installers`，分别下载 Windows 安装程序和 macOS DMG。

更换电脑前，请先在客户首页使用“导出全部数据”；新电脑安装后使用“导入备份”恢复。
