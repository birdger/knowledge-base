# 企业知识库前端系统

基于 Vite + React 18 + TypeScript + Ant Design 5 构建的现代化企业知识库管理系统。

## 技术栈

- **构建工具**: Vite 5
- **框架**: React 18
- **语言**: TypeScript 5
- **UI组件库**: Ant Design 5
- **路由**: React Router 6
- **HTTP客户端**: Axios
- **状态管理**: Zustand 4
- **图表**: @ant-design/charts
- **Markdown**: react-markdown
- **日期处理**: dayjs

## 功能特性

### 用户认证
- 用户登录/注册
- JWT Token 认证
- 个人信息管理
- 头像上传

### 文档管理
- 文档列表查看
- 文档创建/编辑
- Markdown 编辑器（实时预览）
- 文档分类管理
- 标签管理
- 搜索筛选
- 文档导入（支持PDF、Word、Excel、PPT、TXT、MD）
- 文档导出
- 版本历史

### AI 助手
- 智能问答
- 流式响应
- 对话历史
- 上下文理解
- 知识引用显示
- 快捷问题

### 搜索功能
- 全文搜索
- 语义搜索
- 搜索建议
- 高级筛选
- 搜索历史

### 知识图谱
- 力导向图可视化
- 节点类型区分
- 图谱交互（拖拽、缩放、点击）
- 图谱搜索
- 类型筛选

### 管理中心
- 用户管理
- 角色管理
- 权限管理
- 分类管理
- 团队管理
- 系统配置

### 数据统计
- 文档统计
- 用户统计
- 趋势图表
- 分类分布

## 开始使用

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 `http://localhost:5173`

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 项目结构

```
knowledge-base-frontend/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 组件
│   │   ├── common/        # 通用组件
│   │   ├── layout/        # 布局组件
│   │   ├── documents/     # 文档组件
│   │   ├── auth/          # 认证组件
│   │   ├── dashboard/     # 仪表盘组件
│   │   ├── ai/            # AI组件
│   │   └── profile/       # 个人中心组件
│   ├── pages/             # 页面
│   │   ├── admin/         # 管理页面
│   │   │   ├── UsersPage.tsx
│   │   │   ├── CategoriesPage.tsx
│   │   │   ├── RolesPage.tsx
│   │   │   └── index.ts
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── DocumentsPage.tsx
│   │   ├── CreateDocumentPage.tsx
│   │   ├── EditDocumentPage.tsx
│   │   ├── DocumentDetailPage.tsx
│   │   ├── ImportDocumentPage.tsx
│   │   ├── SearchPage.tsx
│   │   ├── KnowledgeGraphPage.tsx
│   │   ├── AIAssistantPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── AdminCenterPage.tsx
│   │   └── index.tsx
│   ├── services/          # API服务
│   ├── stores/            # 状态管理
│   ├── types/             # 类型定义
│   ├── utils/             # 工具函数
│   ├── hooks/             # 自定义Hooks
│   ├── router/            # 路由配置
│   ├── styles/            # 全局样式
│   ├── App.tsx            # 应用入口
│   └── main.tsx           # 主文件
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 环境变量

创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=Enterprise Knowledge Base
VITE_APP_VERSION=1.0.0
```

## 设计系统

项目采用企业级设计系统，包括：

- **色彩系统**: 基于 blue (#2563eb) 的主题色
- **字体**: 系统字体栈
- **间距**: 4px 基础单位
- **圆角**: 8px / 12px / 16px
- **阴影**: 多层次阴影系统
- **动画**: 150-300ms 过渡效果

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 开发规范

### TypeScript 严格模式
项目启用 TypeScript 严格模式，确保类型安全。

### 组件规范
- 使用函数式组件 + Hooks
- 组件文件名使用 PascalCase
- Props 使用 TypeScript 接口定义

### 代码风格
- 使用 ESLint 进行代码检查
- 遵循 Airbnb 代码规范
- 使用 Prettier 格式化代码

## 部署

### Docker 部署

```bash
docker build -t knowledge-base-frontend .
docker run -p 5173:5173 knowledge-base-frontend
```

### Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 许可证

MIT License
