## 1、安装依赖：
```
yarn add typescript rollup rollup-plugin-typescript2 @rollup/plugin-node-resolve @rollup/plugin-json execa
```
- 这样直接安装会报错，因为不知道给谁安装的，需要添加参数 --ignore-workspace-root-check 表示忽略工作空间，给根目录安装的插件
- 注意：如果网络不好，可能安装会失败，可以使用cnpm安装

## 2、在根目录的package.json中配置工作空间
```
"workspaces": [
   "packages/*"
]
意思就是工作空间是packages下的所有包
```

## 3、在根目录的package.json中配置打包脚本：
```
"scripts": {
    "dev": "node scripts/dev.js", // 开发模式
    "build": "node scripts/build.js" // 把packages下的所有模块都打包
  },
```

## 4、在packages目录下新建模块 - 先实现shared和reactivity模块
```
1、新建两个文件夹：reactivity和shared
2、分别进入两个文件夹，执行 yarn init -y 初始化一个package.json文件
3、配置reactivity和shared的package.json文件
{
    "name": "@vue/shared", // 命名包的名字
    "version": "1.0.0",
    "main": "index.js", // 这个是commonjs使用时的入口
    "module": "dist/shared.esm-bundler.js",  // 指定当用ES6引入这个模块时的 引入模块的路径
    "license": "MIT",
    "buildOptions": { // 打包时的自定义的配置项 也就是构建时的配置项
        "name": "VueShared", // 全局模块的名字
        "formats": [ // 当前模块需要构建成什么样的模块
            "cjs", // commonjs模块
            "esm-bundler", // ES6模块
            "global" // global模块 shared不需要打包成global模块
        ]
    }
}
```

## 5、在shared和reactivity模块模块下分别新建index.ts模块入口

## 6、实现dev.js和build.js的逻辑

## 7、生成ts的配置文件
> npx tsc --init

## 8、修改ts的配置文件
```
"target": "ESNext",
"module": "ESNext", 
"strict": false, 
```

## 9、执行yarn install 命令，这个命令会将packages下的所有模块都放到node_modules下，并生成快捷方式
"moduleResolution": "node",

