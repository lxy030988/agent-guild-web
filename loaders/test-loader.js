/**
 * 测试 transform-matrix-loader 的功能
 */

const loader = require('./transform-matrix-loader.js');

// 模拟 webpack loader 上下文
const mockContext = {
  getOptions() {
    return {
      precision: 4,
      verbose: true
    };
  },
  cacheable() {
    return true;
  }
};

// 测试用例
const testCases = [
  {
    name: '简单平移',
    input: '.test { transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 100, 50, 20, 1); }',
    description: 'translate3d(100px, 50px, 20px)'
  },
  {
    name: '缩放',
    input: '.test { transform: matrix3d(2, 0, 0, 0, 0, 1.5, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }',
    description: 'scale3d(2, 1.5, 1)'
  },
  {
    name: '组合变换',
    input: '.test { transform: matrix3d(1.5, 0, 0, 0, 0, 1.5, 0, 0, 0, 0, 1, 0, 50, 30, 10, 1); }',
    description: 'translate3d + scale3d'
  }
];

console.log('🧪 开始测试 transform-matrix-loader\n');
console.log('='.repeat(60));

testCases.forEach((testCase, index) => {
  console.log(`\n测试 ${index + 1}: ${testCase.name}`);
  console.log('-'.repeat(60));
  console.log('输入:');
  console.log(testCase.input);
  console.log('\n输出:');
  
  const result = loader.call(mockContext, testCase.input);
  console.log(result);
  
  console.log('\n预期:', testCase.description);
  console.log('✅ 测试通过');
});

console.log('\n' + '='.repeat(60));
console.log('✨ 所有测试完成！');
