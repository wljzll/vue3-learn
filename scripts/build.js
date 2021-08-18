// 把packages目录下的所有包都进行打包
const fs = require('fs');
const execa = require('execa'); // 开启子进程进行打包，最终还是使用rollup进行打包

// 拿到packages下的所有模块
const targets = fs.readdirSync('packages').filter(f => {
    // 有可能读取到的是packages下的文件，所以要判断下，排除文件选项
    if (!fs.statSync(`packages/${f}`).isDirectory()) {
        return false;
    }
    return true;
});

// console.log(targets);
// 对我们的目标进行依次打包 - 并行打包
async function build(target) {
    // 执行rollup命令  TARGET: shared 表示约定打包的目标是shared模块
    await execa('rollup', ['-c', '--environment', `TARGET:${target}`], { stdio: 'inherit' }); // { stdio: 'inherit' } 当前子进程打包的信息共享给父进程
}

function runParaller(targets, iteratorFn) {
    // 存放每次打包的promise
    let res = [];
    for (const item of targets) {
        const p = iteratorFn(item);
        res.push(p); // 将本次打包的这个promise放到res中
    }
    return Promise.all(res);
}


runParaller(targets, build);