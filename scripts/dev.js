// 值针对具体的某个包打包
// 把packages目录下的所有包都进行打包
const fs = require('fs');
const execa = require('execa'); // 开启子进程进行打包，最终还是使用rollup进行打包

// 拿到packages下的所有模块
const target = 'runtime-dom';
// console.log(targets);

// 对我们的目标进行依次打包 - 并行打包
async function build(target) {
    // 执行rollup命令  TARGET: shared 表示约定打包的目标是shared模块 w表示一直监控变化 自动打包
    await execa('rollup', ['-cw', '--environment', `TARGET:${target}`], { stdio: 'inherit' }); // { stdio: 'inherit' } 当前子进程打包的信息共享给父进程
}

build(target);