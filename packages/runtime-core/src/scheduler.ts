let queue = [];
/**
 * @description 去重收集被trigger的effect
 * @param job 被trigger的effect
 */
export function queueJob(job) {
  // 收集未被收集的effect  
  if (!queue.includes(job)) {
    // 收集effect
    queue.push(job);
    // 创建微任务 批量执行effect
    queueFlush();
  }
}

// 创建微任务 执行刷新effect队列函数
let isFlushPending = false;
function queueFlush() {
    if(!isFlushPending) {
        isFlushPending  = true;
        Promise.resolve().then(flushJobs)
    }
}

// 排序后执行queue队列
function flushJobs() {
    isFlushPending = false;
    // 清空时 我们需要根据调用的顺序依次刷新 保证先刷新父再刷新子
    queue.sort((a,b)=> {
        return a.id - b.id
    })
    // 执行queue中的所有effect
    for (let i = 0; i < queue.length; i++) {
        const job = queue[i];
        job();
    }
    // 清空队列
    queue.length = 0;
}