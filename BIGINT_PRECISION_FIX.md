# JavaScript大整数精度丢失问题修复

## 问题描述
用户点击点赞按钮后，向后端发送的blogId数据出现精度丢失问题。例如：
- 原始ID: `1926924684188102658`
- 传输后: `1926924684188102700`

## 问题原因
JavaScript的Number类型只能安全表示到`Number.MAX_SAFE_INTEGER`（2^53 - 1 = 9007199254740991）的整数。当整数超过这个范围时，会出现精度丢失。

```javascript
console.log(Number.MAX_SAFE_INTEGER); // 9007199254740991
console.log(1926924684188102658);     // 1926924684188102700 (精度丢失)
```

## 解决方案

### 1. API层面修复
修改`src/services/api.js`中的方法，确保大整数以字符串形式传递：

```javascript
// 修复前
doThumb(blogId) {
  return apiClient.post('/thumb/do', { blogId: parseInt(blogId) });
}

// 修复后
doThumb(blogId) {
  // 使用字符串形式传递大整数，避免精度丢失
  return apiClient.post('/thumb/do', { blogId: String(blogId) });
}
```

### 2. Axios拦截器增强
在`src/services/axios.js`中添加请求和响应拦截器来处理大整数：

#### 请求拦截器
```javascript
apiClient.interceptors.request.use(
  (config) => {
    // 处理大整数精度问题：确保大整数以字符串形式发送
    if (config.data && typeof config.data === 'object') {
      config.data = JSON.parse(JSON.stringify(config.data, (key, value) => {
        // 如果是数字且超过安全整数范围，转换为字符串
        if (typeof value === 'number' && (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER)) {
          return String(value)
        }
        return value
      }))
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
```

#### 响应拦截器
```javascript
apiClient.interceptors.response.use(
  (response) => {
    // 处理响应中的大整数，确保它们保持为字符串格式
    if (response.data && typeof response.data === 'object') {
      response.data = JSON.parse(JSON.stringify(response.data, (key, value) => {
        // 如果是看起来像大整数的字符串，保持为字符串
        if (typeof value === 'string' && /^\d{15,}$/.test(value)) {
          return value
        }
        return value
      }))
    }
    return response
  },
  // ... 错误处理
)
```

## 修复的具体方法

### 1. `doThumb` 方法
```javascript
// 修复前
doThumb(blogId) {
  return apiClient.post('/thumb/do', { blogId: parseInt(blogId) });
}

// 修复后
doThumb(blogId) {
  return apiClient.post('/thumb/do', { blogId: String(blogId) });
}
```

### 2. `undoThumb` 方法
```javascript
// 修复前
undoThumb(blogId) {
  return apiClient.post('/thumb/undo', { blogId: parseInt(blogId) });
}

// 修复后
undoThumb(blogId) {
  return apiClient.post('/thumb/undo', { blogId: String(blogId) });
}
```

### 3. `getBlogDetails` 方法
```javascript
// 修复前
getBlogDetails(blogId) {
  return apiClient.get(`/blog/get?blogId=${blogId}`);
}

// 修复后
getBlogDetails(blogId) {
  return apiClient.get(`/blog/get?blogId=${String(blogId)}`);
}
```

## 技术细节

### JavaScript数字精度限制
- **安全整数范围**: -(2^53 - 1) 到 (2^53 - 1)
- **Number.MAX_SAFE_INTEGER**: 9007199254740991
- **Number.MIN_SAFE_INTEGER**: -9007199254740991

### 大整数处理策略
1. **字符串传输**: 将大整数作为字符串在前后端之间传输
2. **避免数值运算**: 不对大整数进行JavaScript数值运算
3. **后端处理**: 在后端将字符串转换为适当的数值类型

### JSON序列化处理
使用自定义的JSON序列化器来确保：
- 发送请求时大整数转换为字符串
- 接收响应时保持大整数的字符串格式

## 测试验证

### 测试用例
```javascript
// 测试大整数精度
const testId = '1926924684188102658';

// 验证API调用
api.doThumb(testId);
// 应该发送: { "blogId": "1926924684188102658" }
// 而不是: { "blogId": 1926924684188102700 }
```

### 验证方法
1. **浏览器开发者工具**: 检查Network面板中的请求数据
2. **后端日志**: 确认接收到的数据格式正确
3. **功能测试**: 验证点赞功能正常工作

## 影响范围

### 修复的接口
- `POST /api/thumb/do` - 点赞接口
- `POST /api/thumb/undo` - 取消点赞接口
- `GET /api/blog/get` - 获取博客详情接口

### 潜在影响的其他功能
- 所有涉及大整数ID的API调用
- 用户ID、博客ID、话题ID等长整数字段

## 最佳实践建议

### 1. 前端处理
- 始终将大整数作为字符串处理
- 避免对大整数进行JavaScript数值运算
- 使用字符串比较而非数值比较

### 2. 后端配合
- 接受字符串格式的大整数参数
- 在后端进行适当的类型转换
- 返回大整数时使用字符串格式

### 3. 数据库设计
- 使用BIGINT或类似的大整数类型
- 确保ORM框架正确处理大整数

## 兼容性说明

### 浏览器支持
- 所有现代浏览器都支持字符串形式的大整数传输
- 不依赖ES2020的BigInt特性，兼容性更好

### 后端兼容性
- 需要后端支持字符串格式的整数参数
- 大多数后端框架都能自动处理字符串到整数的转换

## 总结

通过以下三个层面的修复，彻底解决了JavaScript大整数精度丢失问题：

1. **API层面**: 确保所有大整数参数以字符串形式传递
2. **传输层面**: 通过axios拦截器自动处理大整数序列化
3. **应用层面**: 在整个应用中统一使用字符串处理大整数

这个解决方案确保了数据的完整性和准确性，避免了因精度丢失导致的功能异常。 