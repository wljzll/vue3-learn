const arr = [1,2,0,3,4,5,0];

// 1, 8, 5, 3, 4, 9, 7, 6, 0
// 求当前列表中最大递增的个数

// 贪心 + 二分查找

function getSequence(arr) { // 最终的结果是索引
    const len = arr.length;
    const result = [0]; // 索引 这个0 是arr第一项的索引
    let resultLastIndex = result[result.length - 1] // result是索引数组
    let start;
    let end;
    let middle = 0;

    for(let i = 0; i < len; i++) {
        const arrI = arr[i]
        if(arrI != 0) {
            
            if(arr[resultLastIndex] < arrI) { // 最后一项比arrI小 说明arrI最大 插到最后即可
                result.push(i)
                continue
            } 

            start = 0
            end = result.length - 1
            while(start < end) { // 最终start = end
                middle = ((start + end) / 2) | 0 // 平均值取整 比如 1.2 | 0 = 1
                // middle是 result这个索引数组的中间项的索引 比如 result的length为3 (0 + 2) / 2 = 1 middle也就是1 
                // result[middle] result本身存储的也是arr的每一项的索引
                // arr[result[middle]] 取的就是arr对应的数组项 也就是 用result存放的对应的索引 映射出arr中对应的值
                // 对比result的索引对应的值和arrI的值的大小
                if(arr[result[middle]] < arrI) { // 如果二分中间的值小与当前项 说明比当前项大的在另一个半区 将start指向另一个半区开头
                    start = middle + 1
                } else { // 二分中间的值大于当前项 将end指向另一个半区的结尾 直到
                    end = middle
                }
            }
        }
    }

    return result;
}

console.log(getSequence(arr));

// 在查找中 如果当前值的比已经排好的数组项的最后一个大，直接插入
// 如果当前这个比最后一个小，采用二分查找的方式 找到已经排好的列表 找到比当前数大的那一项 将其替换掉
// 1, 8, 5, 3, 4, 9, 7, 6, 0

// 1 
// 1 8
// 1 5 
// 1 3
// 1 3 4
// 1 3 4 9
// 1 3 4 7
// 1 3 4 6