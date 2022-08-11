<h1 align="center">Grasscutter Web Tools</h1>
<p align="center">某除草机服务端管理工具Web版（React版本）</p>

## ✨ 特性

- ✅ 图形化圣遗物配置
- ✅ 支持在浏览器本地记住物品配置、怪物配置、常用命令等
- ✅ 控制台交互优化
- ✅ 更加美观的UI
- 🔲 更多...

## 🔨 开发

### 将本仓库`clone`到本地，执行：

- `yarn`  安装依赖

- `yarn start` 启动webpack开发环境

### 构建打包

- `yarn build`

## 📦 部分目录说明

### `/lab`目录

(用于生成数据，生成的文件请手动覆盖到`@/constants`目录下，部分代码因为无法直接在node执行，参考目录下`package.json`对应方式执行）

- `artifact_groups_generator.js` 生成圣遗物分组数据，对如：魔女、绝缘、追忆等等进行分类格式化。含有圣遗物名称以及对应的code，有新圣遗物的时候请加到这里并重新生成。

- `artifact_subattrs_generator.js` 副词条分类器(严格模式)，无需修改

- `artifact_subattrs_grouping.js` 副词条分类器(自由模式)，无需修改

- `weapons_map.js` 武器数据分组器

- `whosyourdaddy.js` 一键毕业指令转换成json

### 常量目录（`@/constants`）：

- `mona` 莫娜占卜铺的数据，用于显示圣遗物、武器、角色的图标。

    参考：[https://github.com/wormtql/genshin_artifact/tree/main/mona_generate/output](https://github.com/wormtql/genshin_artifact/tree/main/mona_generate/output)
    
    更新的话需要移除无用的import（图片资源尽量不要用放到目录下）

## 🔗 相关链接
    
- `Web控制台插件` [https://github.com/liujiaqi7998/GrasscuttersWebDashboard](https://github.com/liujiaqi7998/GrasscuttersWebDashboard)
- `Web UI参考` [https://github.com/wmn1525/grasscutterTools](https://github.com/wmn1525/grasscutterTools)
- `功能逻辑参考` [https://github.com/jie65535/GrasscutterCommandGenerator](https://github.com/jie65535/GrasscutterCommandGenerator)


(本项目基于兴趣开发，用于学习和熟悉React开发，功能随缘更新，代码完全开源，仅供学习交流，禁止用于商业用途！否则后果自负！)
