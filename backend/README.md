# 知识库系统后端

基于Spring Boot 3.x + MyBatis Plus的企业级知识库管理系统后端。

## 项目简介

本项目采用Maven多模块架构，提供完整的用户权限管理和文档管理功能。

### 技术栈

- **框架**: Spring Boot 3.2.0
- **数据库**: MySQL 8.0+
- **ORM**: MyBatis Plus 3.5.5
- **缓存**: Redis 7.2（可选）
- **API文档**: Knife4j 4.3.0
- **工具库**: Hutool 5.8.24
- **JDK**: Java 21

### 模块说明

| 模块 | 端口 | 说明 |
|-----|------|------|
| kb-gateway | 8080 | API网关 |
| kb-user-auth | 8081 | 用户权限服务 |
| kb-document | 8082 | 文档服务 |
| kb-common | - | 公共模块 |

## 快速开始

### 环境要求

- JDK 21+
- Maven 3.8+
- MySQL 8.0+
- Redis 7.2+（可选）

### 数据库初始化

1. 创建数据库并执行初始化脚本：

```bash
mysql -u root -p < sql/init.sql
```

2. 默认管理员账号：
   - 用户名: admin
   - 密码: 123456

### 修改配置

修改各服务模块下的 `application.yml` 文件，配置数据库连接信息：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/knowledge_base
    username: root
    password: 123456
```

### 启动服务

#### 方式一：IDE启动

在IDE中依次启动以下服务：
1. GatewayApplication (8080)
2. UserAuthApplication (8081)
3. DocumentApplication (8082)

#### 方式二：命令行启动

```bash
# 编译项目
mvn clean package

# 启动网关
java -jar kb-gateway/target/kb-gateway-1.0.0-SNAPSHOT.jar

# 启动用户权限服务
java -jar kb-user-auth/target/kb-user-auth-1.0.0-SNAPSHOT.jar

# 启动文档服务
java -jar kb-document/target/kb-document-1.0.0-SNAPSHOT.jar
```

### 访问API文档

- **用户权限服务**: http://localhost:8081/api/auth/doc.html
- **文档服务**: http://localhost:8082/api/document/doc.html

## 项目结构

```
knowledge-base-backend/
├── kb-common/              # 公共模块
│   ├── annotation/         # 自定义注解
│   ├── aspect/             # 切面
│   ├── config/             # 配置类
│   ├── constants/          # 常量定义
│   ├── enums/              # 枚举类
│   ├── exception/          # 异常类
│   ├── handler/            # 处理器
│   ├── result/             # 响应结果封装
│   └── utils/              # 工具类
├── kb-gateway/             # API网关
│   └── filter/             # 网关过滤器
├── kb-user-auth/           # 用户权限服务
│   ├── controller/         # 控制器
│   ├── service/            # 服务层
│   ├── mapper/             # 数据访问层
│   ├── entity/             # 实体类
│   ├── dto/                # 数据传输对象
│   └── vo/                 # 视图对象
└── kb-document/            # 文档服务
    ├── controller/         # 控制器
    ├── service/            # 服务层
    ├── mapper/             # 数据访问层
    ├── entity/             # 实体类
    ├── dto/                # 数据传输对象
    └── vo/                 # 视图对象
```

## 代码规范

本项目严格遵循阿里巴巴Java开发手册规范：

1. **命名规范**
   - 类名使用大驼峰命名法
   - 方法和变量使用小驼峰命名法
   - 常量使用全大写+下划线命名法

2. **注释规范**
   - 所有类必须添加JavaDoc注释
   - 所有公共方法必须添加JavaDoc注释
   - 复杂业务逻辑必须添加行内注释

3. **异常处理**
   - 使用统一的异常处理机制
   - 自定义业务异常
   - 禁止捕获Throwable类

4. **日志规范**
   - 使用Slf4j进行日志记录
   - 合理设置日志级别
   - 生产环境关闭DEBUG日志

## 核心功能

### 用户权限服务

- 用户登录/退出
- 用户管理（CRUD）
- 角色管理
- 权限管理
- Token管理（JWT）

### 文档服务

- 文档管理（CRUD）
- 文档分类
- 文件上传/下载
- 文档搜索
- 文档浏览/点赞/收藏
- 富文本编辑器支持

## 开发指南

### 添加新接口

1. 在DTO中定义请求参数
2. 在VO中定义响应数据
3. 在Service接口中定义业务方法
4. 在ServiceImpl中实现业务逻辑
5. 在Controller中暴露REST接口

### ID生成

所有ID使用雪花算法生成：

```java
Long id = SnowflakeIdGenerator.getInstance().nextId();
```

### 统一响应

所有接口返回统一格式的响应：

```java
return Result.success(data);
return Result.error(ResultCode.PARAM_ERROR);
```

### 异常处理

使用自定义异常：

```java
throw new BusinessException(ResultCode.USER_NOT_EXIST);
throw new UnauthorizedException("Token无效");
```

## 部署说明

### Docker部署

```bash
# 构建镜像
docker build -t knowledge-base-backend:1.0.0 .

# 启动容器
docker-compose up -d
```

### 生产环境配置

生产环境需要修改以下配置：

1. 修改数据库连接信息
2. 配置Redis连接
3. 修改JWT密钥
4. 关闭Swagger文档
5. 配置日志输出路径

## License

Apache License 2.0

## 联系方式

- 项目地址: https://github.com/knowledge-base/backend
- 问题反馈: https://github.com/knowledge-base/backend/issues
- 邮箱: support@knowledge-base.com
