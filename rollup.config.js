// rollup 配置

import path from 'path';
import json from '@rollup/plugin-json';
import resolvePlugin from '@rollup/plugin-node-resolve';
import ts from 'rollup-plugin-typescript2';

// console.log(process.env.TARGET, 'rollup');
// process.env.TARGET 能够拿到我们配置的环境变量

// 根据环境变量中的target属性 获取对应模块中的package.json

// 获取项目根目录下的 packages 目录的据对路径 D:\咸蛋小乐乐\前端视频\2021年珠峰\练习\vue3-learn\packages 
const packagesDir = path.resolve(__dirname, 'packages');


// 找到打包的某个包 这个目录是打包的基准目录
const packageDir = path.resolve(packagesDir, process.env.TARGET);

// 自己封装一个resolve 这个resolve方法永远是以对应的包的目录为基准
const resolve = (p) => path.resolve(packageDir, p);

// 拿到packages下对应的包里的package.json文件 并通过require()方法加载其中的json内容
const pkg = require(resolve('package.json'));
// console.log(pkg);

// 取文件夹的名字 用来给打包输出的文件命名
const name = path.basename(packageDir);
// 对打包类型 先做一个映射表 根据读取的formats 来格式化需要打包的内容
const outputConfig = {
    'esm-bundler': {
        file: resolve(`dist/${name}.esm-bundler.js`),
        format: 'es'
    },
    'cjs': {
        file: resolve(`dist/${name}.cjs.js`),
        format: 'cjs'
    },
    'global': {
        file: resolve(`dist/${name}.global.js`),
        format: 'iife' // 立即执行函数
    }
}

// 自己在包的package.json中定义的buildOptions选项
const options = pkg.buildOptions;

/**
 * @description 通过传入的format和我们自己规定的配置项构建出对应的rollup的配置文件
 * @param {*} format buildOptions中format中的每个格式
 * @param {*} output outputConfig取出的对应的配置
 */
function createConfig(format, output) {
    output.name = options.name; // 取出buildOptions中的name选项作为打包的文件名
    output.sourcemap = true;

    // 生成rollup配置
    return {
        input: resolve(`src/index.ts`),
        output,
        plugins: [ // 插件是有顺序的
            json(),
            ts({ // ts插件
                tsconfig: path.resolve(__dirname, 'tsconfig.json')
            }),
            resolvePlugin() // 解析第三方模块
        ]
    }
}

// rollup最终需要导出的配置
export default options.formats.map(format => createConfig(format, outputConfig[format]))