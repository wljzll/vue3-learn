const arr = [2, 3, 1, 5, 6, 8, 7, 9, 4];
// 求当前列表中最大递增的个数
// 贪心 + 二分查找
function getSequence(arr) {
  // 最终的结果是索引
  const len = arr.length; // 9
  const result = [0]; // 索引 这个0 是arr第一项的索引
  const p = arr.slice(0); // 复制一份数组[2, 3, 1, 5, 6, 8, 7, 9, 4]
  let resultLastIndex; // result的项是arr对应项的索引 存储的是索引 不是值
  
  let start;
  let end;
  let middle = 0;

  for (let i = 0; i < len; i++) {// O(n)  i = 6  
    const arrI = arr[i]; // arr的当前项 arrI = 7
    if (arrI != 0) {
      resultLastIndex = result[result.length - 1] // 取result最后一项 这个值是arr的索引 resultLastIndex = 5 arr[resultLastIndex] = 8
      if (arr[resultLastIndex] < arrI) { // result对应的值的最后一项比arrI小 说明arrI最大 插到最后即可  8 < 7 
        // 因为是插入到result最后 因此当前 i 的前一项就是result的最后一项
        p[i] = resultLastIndex; // 记录当前元素的前一项是谁 用索引来记录
        result.push(i); // 将当前项的索引push到result中,用来代表当前项
        continue;
      }

      start = 0; // result索引数组第一项 start = 0
      end = result.length - 1; // result索引数组最后一项 end = 4
      while (start < end) {
        // 最终start = end 二分查找比当前arrI大的那一项 最终会将start和end共同指向result中第一个比arrI大的那一项
        middle = ((start + end) / 2) | 0; // 平均值取整 找result数组的中间项 比如 1.2 | 0 = 1   middle = 3
        // middle是 result这个索引数组的中间项的索引 比如 result的length为3 (0 + 2) / 2 = 1 middle也就是1
        // result[middle] result本身存储的也是arr的每一项的索引
        // arr[result[middle]] 取的就是arr对应的数组项 也就是 用result存放的对应的索引 映射出arr中对应的值
        // 对比result的索引对应的值和arrI的值的大小
        if (arr[result[middle]] < arrI) { // 6 < 7
          // 如果二分后 result数组中间项对应的arr的值小与当前项 说明比当前项大的在result另一个半区 将start指向另一个半区开头
          start = middle + 1; // start = 4
        } else {
          // 二分中间的值大于当前项 将end指向另一个半区的结尾
          end = middle; // end = 4
        }
      }

      if (arrI < arr[result[start]]) {// arrI 小于 最终start指向的那一项 说明要用 arrI 替换掉 arr[result[start]]这一项  7 < 8
        
        if (start > 0) { // 当要替换的项的索引大于0才需要记录
          // start不是指向arr的第一项
          // 记录上一次  p数组和arr数组长度相同 p[i] 对应的是arr[i] result[start - 1] 是指 result数组 索引为start的前一项  不过这个值result[start - 1]对应的是arr数组的某一项的索引
          // p记录的是 arr中的某一项 按照递增排序后 这一项的前一项的索引
          p[i] = result[start - 1]; // i = 6 (start - 1 = 3) result[3] = 4
        }
        result[start] = i; // 将result中 start这一项的索引值替换成当前的arr的i索引
      }
    }

    let len1 = result.length // result索引数组的长度 len1 = 5
    let last = result[len1 - 1] // result的最后一项 6 
    console.log(start);
    // start = 4 result = [2, 1, 3, 4, 6]
    while (start-- > 0) { // 倒序追溯 根据前驱节点 一个个向前查找
        result[start] = last
        last = p[last]
    }
  } // end for loop
  return result;
} //  O(n logn) 所以比 O(n^2)的性能高

console.log(getSequence(arr));

// i = 0; 第一轮循环  p = [2, 3, 1, 5, 6, 8, 7, 9, 4] result = [0]
// i = 1; 第二轮循环  p = [2, 0, 1, 5, 6, 8, 7, 9, 4] result = [0, 1]
// i = 2; 第三轮循环  p = [2, 0, 1, 5, 6, 8, 7, 9, 4] result = [2, 1]
// i = 3; 第四轮循环  p = [2, 0, 1, 1, 6, 8, 7, 9, 4] result = [2, 1, 3]                对应的实际值数组 [1, 3, 5]
// i = 4; 第五轮循环  p = [2, 0, 1, 1, 3, 8, 7, 9, 4] result = [2, 1, 3, 4]             对应的实际值数组 [1, 3, 5, 6]
// i = 5; 第六轮循环  p = [2, 0, 1, 1, 3, 4, 7, 9, 4] result = [2, 1, 3, 4, 5]          对应的实际值数组 [1, 3, 5, 6, 8]

// i = 6; 第七轮循环  p = [2, 0, 1, 1, 3, 4, 4, 9, 4] result = [2, 1, 3, 4, 6]          对应的实际值数组 [1, 3, 5, 6, 7]


// i = 7; 第八轮循环  p = [2, 0, 1, 1, 3, 4, 6, 9, 4] result = [2, 1, 3, 4, 6, 7]       对应的实际值数组 [1, 3, 5, 6, 7, 9]
// i = 8; 第九轮循环  p = [2, 0, 1, 1, 3, 4, 6, 9, 1] result = [2, 1, 8, 4, 6, 7]       对应的实际值数组 [1, 3, 4, 6, 7, 9]

// 在查找中 如果当前值的比已经排好的数组项的最后一个大，直接插入
// 如果当前这个比最后一个小，采用二分查找的方式 找到已经排好的列表 找到比当前数大的那一项 将其替换掉


// 二分法的过程: 值数组arr: [2,3,1,5,6,8,7,9,4] ,目前对应的索引数组result:[2,1,3,4,5] 找比 7大的那一项
// middle =  (start + end) => (0 + 4) =( 4 / 2) = ( 2 | 0) = 2 => 这个2指的是result中索引为2的项
// 对应的result的索引为2的项是 result[2] = 3 => 这个3是result的项,但是这个项的值是arr数组的索引
// arr中索引为3的项的值是 5
// 7 和 5 比, 比5大, 说明result中 0 - 2这个索引区间不符合要求,继续二分,二分3 - 4这个半区

// start = middle + 1 = 3, end = 4
// middle = (3 + 4) / 2 = 3.5 (3.5 | 0 = 3)
// result[3] = 4
// arr[4] = 6
// 7 大于 6, 继续二分

// start = middle + 1 = 4
// end = 4
// start < end 不成立

// 2
// 2 3
// 1 3
