# 校园失物招领平台

基于 Vue 3 + Element Plus 的校园失物招领平台前端项目。

## 技术栈

- Vue 3
- Vue Router
- Pinia
- Element Plus
- Vite
- Axios

## 项目设置

### 安装依赖
```bash
npm install
```

### 开发环境运行
```bash
npm run dev
```

### 生产环境构建
```bash
npm run build
```

### 使用 Docker 部署

1. 构建镜像
```bash
docker build -t lost-found-frontend .
```

2. 运行容器
```bash
docker run -d -p 80:80 lost-found-frontend
```

## 项目结构

```
src/
├── assets/         # 静态资源
├── components/     # 公共组件
├── layouts/        # 布局组件
├── router/         # 路由配置
├── stores/         # 状态管理
├── utils/          # 工具函数
└── views/          # 页面组件
```

## 功能特性

- 用户认证（登录/注册）
- 物品管理（丢失/拾取）
- 认领申请
- 投诉处理
- 管理员功能
  - 认领审核
  - 投诉处理
  - 黑名单管理
  - 操作日志
