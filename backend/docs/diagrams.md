# 增加网关服务对接口返回值和异常做统一封装 - 架构图

本文档包含文章中所有架构图的Mermaid语法，可在draw.io中导入使用。

## 1. 技术架构图（API调用流程）

```mermaid
graph TB
    Client[客户端请求]

    subgraph Gateway["Spring Cloud Gateway"]
        GlobalLogFilter["GlobalLogFilter<br/>记录请求日志"]
        UnifiedResponseFilter["UnifiedResponseFilter<br/>统一响应格式"]
        GatewayGlobalExceptionHandler["GatewayGlobalExceptionHandler<br/>网关异常处理"]
        CorsResponseHeaderFilter["CorsResponseHeaderFilter<br/>CORS头去重"]

        GlobalLogFilter --> UnifiedResponseFilter
        UnifiedResponseFilter --> GatewayGlobalExceptionHandler
        CorsResponseHeaderFilter --> UnifiedResponseFilter
    end

    subgraph BackendService["后端微服务"]
        GlobalExceptionHandler["GlobalExceptionHandler<br/>统一异常处理"]
    end

    Client -->|请求| GlobalLogFilter
    GlobalLogFilter -->|转发| BackendService
    BackendService -->|响应| UnifiedResponseFilter
    UnifiedResponseFilter --> CorsResponseHeaderFilter
    CorsResponseHeaderFilter -->|响应| Client

    style Gateway fill:#e1f5ff
    style BackendService fill:#fff4e6
    style Client fill:#f0f0f0
```

## 2. 完整调用链路图

```mermaid
graph TD
    Client[客户端请求]

    subgraph Gateway["Spring Cloud Gateway"]
        GlobalLogFilter1["GlobalLogFilter<br/>Order: -100<br/>记录请求日志"]
        Route["路由匹配<br/>转发到后端服务"]
        UnifiedResponseFilter["UnifiedResponseFilter<br/>Order: -2<br/>统一响应格式"]
        CorsResponseHeaderFilter["CorsResponseHeaderFilter<br/>CORS头去重"]
        GlobalLogFilter2["GlobalLogFilter<br/>记录响应日志"]

        GlobalLogFilter1 --> Route
        Route --> UnifiedResponseFilter
        UnifiedResponseFilter --> CorsResponseHeaderFilter
        CorsResponseHeaderFilter --> GlobalLogFilter2
    end

    subgraph BackendService["后端服务 kb-user-auth"]
        Controller["Controller<br/>接收请求"]
        Service["Service<br/>业务逻辑"]
        Exception["抛出BusinessException"]
        GlobalExceptionHandler["GlobalExceptionHandler<br/>转换为Result格式"]

        Controller --> Service
        Service -->|业务异常| Exception
        Exception --> GlobalExceptionHandler
    end

    subgraph CommonModule["kb-common公共模块"]
        Result["Result统一返回格式"]
        BusinessException["BusinessException<br/>业务异常"]
    end

    Client -->|1. 请求| GlobalLogFilter1
    GlobalLogFilter1 -->|2. 路由转发| Controller
    Service -->|3. 异常| GlobalExceptionHandler
    GlobalExceptionHandler -->|4. Result响应| UnifiedResponseFilter
    UnifiedResponseFilter -->|5. 响应处理| CorsResponseHeaderFilter
    CorsResponseHeaderFilter -->|6. 最终响应| GlobalLogFilter2
    GlobalLogFilter2 -->|7. 返回| Client

    CommonModule -.->|依赖| BackendService
    CommonModule -.->|依赖| Gateway

    style Gateway fill:#e1f5ff
    style BackendService fill:#fff4e6
    style CommonModule fill:#f0fff0
    style Client fill:#f0f0f0
```

## 3. 系统分层架构图

```mermaid
graph TB
    subgraph ClientLayer["客户端层"]
        Frontend["前端应用<br/>Vue3/React"]
        Mobile["移动端<br/>iOS/Android"]
    end

    subgraph GatewayLayer["网关层 kb-gateway"]
        CorsWebFilter["CORS过滤器"]
        GlobalLogFilter["全局日志过滤器"]
        UnifiedResponseFilter["统一响应过滤器"]
        GlobalExceptionHandler["全局异常处理器"]
        RouteLocator["路由定位器"]
    end

    subgraph ServiceLayer["业务服务层"]
        UserAuthService["用户权限服务<br/>kb-user-auth"]
        DocumentService["文档服务<br/>kb-document"]
        FileService["文件服务<br/>kb-file"]
    end

    subgraph CommonLayer["公共层 kb-common"]
        Result["Result统一返回"]
        BusinessException["业务异常"]
        AssertUtil["断言工具"]
        FeignInterceptor["Feign拦截器"]
    end

    Frontend --> GatewayLayer
    Mobile --> GatewayLayer
    GatewayLayer --> ServiceLayer
    ServiceLayer --> CommonLayer

    style GatewayLayer fill:#e1f5ff
    style ServiceLayer fill:#fff4e6
    style CommonLayer fill:#f0fff0
    style ClientLayer fill:#f0f0f0
```

## 4. 异常处理流程图

```mermaid
graph TD
    Start[请求进入] --> CheckType{检查请求类型}

    CheckType -->|内部调用<br/>INNER-REQUEST头| InternalException[内部异常处理]
    CheckType -->|外部API调用| ExternalException[外部异常处理]

    InternalException --> CheckBusiness{是否BusinessException?}
    CheckBusiness -->|是| InternalBusiness[返回ResponseEntity<br/>保留HTTP状态码]
    CheckBusiness -->|否| InternalSystem[返回500错误]

    ExternalException --> CheckExceptionType{异常类型判断}

    CheckExceptionType -->|BusinessException| BusinessResult[返回Result.error<br/>业务错误码]
    CheckExceptionType -->|AccessDeniedException| ForbiddenResult[返回403错误]
    CheckExceptionType -->|ValidationException| ParamResult[返回参数错误]
    CheckExceptionType -->|其他异常| SystemResult[返回系统错误]

    InternalBusiness --> End[响应结束]
    InternalSystem --> End
    BusinessResult --> End
    ForbiddenResult --> End
    ParamResult --> End
    SystemResult --> End

    style InternalException fill:#fff4e6
    style ExternalException fill:#e1f5ff
    style End fill:#f0f0f0
```

## 5. 响应处理流程图

```mermaid
sequenceDiagram
    participant C as 客户端
    participant G as 网关
    participant S as 业务服务
    participant E as 异常处理器

    C->>G: 发送请求
    G->>G: GlobalLogFilter记录请求

    G->>S: 路由转发到业务服务
    S->>S: Controller处理
    S->>S: Service执行业务逻辑

    alt 业务异常
        S->>E: 抛出BusinessException
        E->>G: 返回Result格式错误
    else 正常响应
        S->>G: 返回业务数据
    end

    G->>G: UnifiedResponseFilter检查格式
    alt 非标准格式
        G->>G: 包装为Result格式
    end

    G->>G: CorsResponseHeaderFilter去重CORS头
    G->>G: GlobalLogFilter记录响应

    G->>C: 返回统一格式响应
```

## 在draw.io中使用这些图

### 方法一：使用Mermaid插件
1. 打开draw.io
2. 选择 `Arrange` → `Insert` → `Advanced` → `Mermaid`
3. 将上面的Mermaid代码粘贴到对话框中
4. 点击插入

### 方法二：在线转换
1. 访问 https://mermaid.live/
2. 将代码粘贴到编辑器中
3. 导出为SVG/PNG
4. 在draw.io中导入图片

### 方法三：命令行生成
```bash
# 安装mermaid-cli
npm install -g @mermaid-js/mermaid-cli

# 生成图片
mmdc -i diagrams.md -o architecture.png
```

## 图表说明

- **技术架构图**：展示API调用的整体流程和技术栈
- **完整调用链路图**：详细展示从客户端到响应的完整链路
- **系统分层架构图**：展示系统的分层结构和各层之间的关系
- **异常处理流程图**：展示不同类型异常的处理流程
- **响应处理流程图**：以时序图形式展示请求响应的完整过程
