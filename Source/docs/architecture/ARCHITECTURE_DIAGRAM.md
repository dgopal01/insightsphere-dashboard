# EthosAI Review Portal - Architecture Diagrams

## Table of Contents
1. [High-Level Architecture](#high-level-architecture)
2. [AWS Amplify Deployment Architecture](#aws-amplify-deployment-architecture)
3. [Amazon EKS Deployment Architecture](#amazon-eks-deployment-architecture)
4. [Authentication Flow](#authentication-flow)
5. [Data Flow](#data-flow)
6. [Component Architecture](#component-architecture)

---

## High-Level Architecture

```mermaid
graph TB
    subgraph "User Layer"
        U1[Web Browser]
        U2[Mobile Browser]
    end

    subgraph "CDN Layer"
        CF[CloudFront CDN]
    end

    subgraph "Application Layer"
        APP[React SPA<br/>Vite + TypeScript<br/>Tailwind CSS]
    end

    subgraph "Authentication Layer"
        CUP[Cognito User Pool]
        CIP[Cognito Identity Pool]
    end

    subgraph "API Layer"
        AS[AWS AppSync<br/>GraphQL API]
        SDK[AWS SDK<br/>Direct Access]
    end

    subgraph "Data Layer"
        DB1[(DynamoDB<br/>UnityAIAssistantLogs)]
        DB2[(DynamoDB<br/>userFeedback)]
        DB3[(DynamoDB<br/>UnityAIAssistantEvalJob)]
    end

    subgraph "Monitoring Layer"
        CW[CloudWatch Logs]
        SEN[Sentry APM]
    end

    U1 --> CF
    U2 --> CF
    CF --> APP
    APP --> CUP
    CUP --> CIP
    APP --> AS
    APP --> SDK
    AS --> DB1
    AS --> DB2
    AS --> DB3
    SDK --> DB1
    SDK --> DB2
    SDK --> DB3
    APP --> CW
    APP --> SEN

    style APP fill:#00818F,stroke:#28334A,stroke-width:3px,color:#fff
    style CUP fill:#FF9900,stroke:#232F3E,stroke-width:2px
    style CIP fill:#FF9900,stroke:#232F3E,stroke-width:2px
    style DB1 fill:#527FFF,stroke:#232F3E,stroke-width:2px
    style DB2 fill:#527FFF,stroke:#232F3E,stroke-width:2px
    style DB3 fill:#527FFF,stroke:#232F3E,stroke-width:2px
```

---

## AWS Amplify Deployment Architecture

```mermaid
graph TB
    subgraph "Internet"
        USER[Users]
    end

    subgraph "AWS Cloud - Region: us-east-1"
        subgraph "Edge Services"
            R53[Route 53<br/>DNS]
            CF[CloudFront<br/>Distribution]
            ACM[ACM<br/>SSL Certificate]
        end

        subgraph "AWS Amplify"
            AMP[Amplify Hosting]
            BUILD[Build Pipeline<br/>CI/CD]
            S3A[S3 Bucket<br/>Static Assets]
        end

        subgraph "Authentication"
            CUP[Cognito User Pool<br/>User Management]
            CIP[Cognito Identity Pool<br/>AWS Credentials]
            DOMAIN[Cognito Domain<br/>Hosted UI]
        end

        subgraph "API Services"
            APPSYNC[AWS AppSync<br/>GraphQL API]
            LAMBDA[Lambda Functions<br/>Resolvers]
        end

        subgraph "Data Storage"
            DDB1[(DynamoDB<br/>Chat Logs)]
            DDB2[(DynamoDB<br/>Feedback)]
            DDB3[(DynamoDB<br/>Eval Jobs)]
            BACKUP[DynamoDB Backups<br/>Point-in-Time Recovery]
        end

        subgraph "Monitoring & Logging"
            CWL[CloudWatch Logs]
            CWM[CloudWatch Metrics]
            XRAY[X-Ray Tracing]
            SNS[SNS Topics<br/>Alerts]
        end

        subgraph "Security"
            WAF[AWS WAF<br/>Web Application Firewall]
            SHIELD[AWS Shield<br/>DDoS Protection]
            IAM[IAM Roles & Policies]
        end
    end

    subgraph "External Services"
        GITHUB[GitHub Repository]
        SENTRY[Sentry.io<br/>Error Tracking]
    end

    USER --> R53
    R53 --> CF
    CF --> WAF
    WAF --> AMP
    CF --> ACM
    AMP --> S3A
    GITHUB --> BUILD
    BUILD --> AMP
    
    S3A --> CUP
    S3A --> APPSYNC
    CUP --> CIP
    CIP --> IAM
    CUP --> DOMAIN
    
    APPSYNC --> LAMBDA
    LAMBDA --> DDB1
    LAMBDA --> DDB2
    LAMBDA --> DDB3
    
    IAM --> DDB1
    IAM --> DDB2
    IAM --> DDB3
    
    DDB1 --> BACKUP
    DDB2 --> BACKUP
    DDB3 --> BACKUP
    
    AMP --> CWL
    APPSYNC --> CWL
    LAMBDA --> CWL
    CWL --> CWM
    CWM --> SNS
    
    S3A --> SENTRY
    APPSYNC --> XRAY
    
    CF --> SHIELD

    style AMP fill:#FF9900,stroke:#232F3E,stroke-width:3px
    style CUP fill:#DD344C,stroke:#232F3E,stroke-width:2px
    style APPSYNC fill:#945DF2,stroke:#232F3E,stroke-width:2px
    style DDB1 fill:#527FFF,stroke:#232F3E,stroke-width:2px
    style DDB2 fill:#527FFF,stroke:#232F3E,stroke-width:2px
    style DDB3 fill:#527FFF,stroke:#232F3E,stroke-width:2px
```

---

## Amazon EKS Deployment Architecture

```mermaid
graph TB
    subgraph "Internet"
        USER[Users]
    end

    subgraph "AWS Cloud - Region: us-east-1"
        subgraph "Edge Services"
            R53[Route 53<br/>DNS]
            ACM[ACM<br/>SSL Certificate]
        end

        subgraph "VPC - 10.0.0.0/16"
            subgraph "Public Subnets"
                ALB[Application Load Balancer<br/>AWS ALB Ingress Controller]
                NAT1[NAT Gateway<br/>AZ-1]
                NAT2[NAT Gateway<br/>AZ-2]
            end

            subgraph "Private Subnets - AZ-1"
                subgraph "EKS Cluster"
                    subgraph "Control Plane"
                        MASTER[EKS Master Nodes<br/>Managed by AWS]
                    end
                    
                    subgraph "Worker Nodes - AZ-1"
                        NODE1[EC2 t3.medium<br/>Worker Node 1]
                        POD1A[Pod: Nginx + React SPA]
                        POD1B[Pod: Nginx + React SPA]
                        NODE1 --> POD1A
                        NODE1 --> POD1B
                    end
                end
            end

            subgraph "Private Subnets - AZ-2"
                subgraph "Worker Nodes - AZ-2"
                    NODE2[EC2 t3.medium<br/>Worker Node 2]
                    POD2A[Pod: Nginx + React SPA]
                    POD2B[Pod: Nginx + React SPA]
                    NODE2 --> POD2A
                    NODE2 --> POD2B
                end
            end

            subgraph "Private Subnets - AZ-3"
                subgraph "Worker Nodes - AZ-3"
                    NODE3[EC2 t3.medium<br/>Worker Node 3]
                    POD3A[Pod: Nginx + React SPA]
                    NODE3 --> POD3A
                end
            end
        end

        subgraph "Container Registry"
            ECR[Amazon ECR<br/>Docker Images]
        end

        subgraph "Authentication"
            CUP[Cognito User Pool]
            CIP[Cognito Identity Pool]
        end

        subgraph "Data Storage"
            DDB1[(DynamoDB<br/>Chat Logs)]
            DDB2[(DynamoDB<br/>Feedback)]
            DDB3[(DynamoDB<br/>Eval Jobs)]
        end

        subgraph "Monitoring"
            CWL[CloudWatch Logs<br/>Container Insights]
            CWM[CloudWatch Metrics]
            CWI[CloudWatch<br/>Container Insights]
            GRAF[Grafana<br/>Optional]
        end

        subgraph "Kubernetes Services"
            HPA[Horizontal Pod Autoscaler]
            CA[Cluster Autoscaler]
            METRICS[Metrics Server]
        end

        subgraph "Security"
            WAF[AWS WAF]
            SG[Security Groups]
            NACL[Network ACLs]
            IAM[IAM Roles<br/>IRSA]
        end
    end

    USER --> R53
    R53 --> ALB
    ALB --> ACM
    ALB --> WAF
    ALB --> POD1A
    ALB --> POD1B
    ALB --> POD2A
    ALB --> POD2B
    ALB --> POD3A

    ECR --> NODE1
    ECR --> NODE2
    ECR --> NODE3

    POD1A --> CUP
    POD2A --> CUP
    POD3A --> CUP
    CUP --> CIP
    CIP --> IAM

    POD1A --> DDB1
    POD1A --> DDB2
    POD1A --> DDB3
    POD2A --> DDB1
    POD3A --> DDB1

    NODE1 --> NAT1
    NODE2 --> NAT2
    NODE3 --> NAT1

    MASTER --> METRICS
    METRICS --> HPA
    HPA --> POD1A
    CA --> NODE1
    CA --> NODE2

    NODE1 --> CWL
    NODE2 --> CWL
    NODE3 --> CWL
    CWL --> CWM

    PROM --> GRAF
    NODE1 --> PROM

    ALB --> SG
    NODE1 --> SG
    SG --> NACL

    style ALB fill:#FF9900,stroke:#232F3E,stroke-width:3px
    style MASTER fill:#FF9900,stroke:#232F3E,stroke-width:3px
    style NODE1 fill:#EC7211,stroke:#232F3E,stroke-width:2px
    style NODE2 fill:#EC7211,stroke:#232F3E,stroke-width:2px
    style NODE3 fill:#EC7211,stroke:#232F3E,stroke-width:2px
    style DDB1 fill:#527FFF,stroke:#232F3E,stroke-width:2px
    style DDB2 fill:#527FFF,stroke:#232F3E,stroke-width:2px
    style DDB3 fill:#527FFF,stroke:#232F3E,stroke-width:2px
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant CloudFront
    participant React App
    participant Cognito User Pool
    participant Cognito Identity Pool
    participant DynamoDB

    User->>Browser: Navigate to app
    Browser->>CloudFront: Request index.html
    CloudFront->>Browser: Return SPA
    Browser->>React App: Load application
    
    React App->>Browser: Check auth state
    Browser->>React App: No valid session
    React App->>Browser: Redirect to login
    
    User->>Browser: Enter credentials
    Browser->>Cognito User Pool: Authenticate
    Cognito User Pool->>Browser: Return JWT tokens
    Browser->>React App: Store tokens
    
    React App->>Cognito Identity Pool: Exchange JWT for AWS credentials
    Cognito Identity Pool->>React App: Return temporary AWS credentials
    
    React App->>DynamoDB: Query data (with AWS credentials)
    DynamoDB->>React App: Return data
    React App->>Browser: Render dashboard
    Browser->>User: Display data

    Note over User,DynamoDB: Session valid for 1 hour
    Note over React App,Cognito Identity Pool: Credentials auto-refresh
```

---

## Data Flow

```mermaid
graph LR
    subgraph "Frontend"
        UI[React Components]
        STATE[TanStack Query<br/>State Management]
        SDK[AWS SDK Client]
    end

    subgraph "API Layer"
        APPSYNC[AppSync GraphQL]
        DIRECT[Direct DynamoDB Access]
    end

    subgraph "Data Layer"
        DDB1[(Chat Logs Table)]
        DDB2[(Feedback Table)]
        DDB3[(Eval Jobs Table)]
    end

    subgraph "Data Operations"
        READ[Read Operations<br/>Query, Scan]
        WRITE[Write Operations<br/>Update, Put]
        FILTER[Client-Side Filtering]
        SORT[Client-Side Sorting]
    end

    UI --> STATE
    STATE --> SDK
    SDK --> APPSYNC
    SDK --> DIRECT
    
    APPSYNC --> READ
    DIRECT --> READ
    APPSYNC --> WRITE
    DIRECT --> WRITE
    
    READ --> DDB1
    READ --> DDB2
    READ --> DDB3
    WRITE --> DDB1
    WRITE --> DDB2
    
    DDB1 --> FILTER
    DDB2 --> FILTER
    DDB3 --> FILTER
    FILTER --> SORT
    SORT --> STATE
    STATE --> UI

    style UI fill:#00818F,stroke:#28334A,stroke-width:2px,color:#fff
    style STATE fill:#00818F,stroke:#28334A,stroke-width:2px,color:#fff
    style DDB1 fill:#527FFF,stroke:#232F3E,stroke-width:2px
    style DDB2 fill:#527FFF,stroke:#232F3E,stroke-width:2px
    style DDB3 fill:#527FFF,stroke:#232F3E,stroke-width:2px
```

---

## Component Architecture

```mermaid
graph TB
    subgraph "Application Structure"
        subgraph "Pages Layer"
            LANDING[Products Landing Page]
            DASHBOARD[Review Dashboard]
            CHAT[Chat Logs Review]
            FEEDBACK[Feedback Logs Review]
            METRICS[AI Metrics Dashboard]
        end

        subgraph "Layout Layer"
            LAYOUT[NewLayout Component]
            SIDEBAR[AppSidebar Component]
            HEADER[Header with Navigation]
        end

        subgraph "Component Layer"
            UI[UI Components<br/>Radix UI + Tailwind]
            FORMS[Form Components]
            TABLES[Data Tables]
            MODALS[Modal Dialogs]
            CHARTS[Recharts Components]
        end

        subgraph "Business Logic Layer"
            HOOKS[Custom Hooks<br/>useChatLogs, useFeedbackLogs]
            CONTEXT[Auth Context<br/>User State]
            UTILS[Utility Functions<br/>Sanitization, Validation]
        end

        subgraph "Data Layer"
            QUERY[TanStack Query<br/>Cache & State]
            SERVICE[DynamoDB Service<br/>API Calls]
            TYPES[TypeScript Types<br/>GraphQL Types]
        end

        subgraph "Infrastructure Layer"
            AUTH[AWS Amplify Auth]
            CONFIG[Environment Config]
            ROUTER[React Router]
        end
    end

    LANDING --> LAYOUT
    DASHBOARD --> LAYOUT
    CHAT --> LAYOUT
    FEEDBACK --> LAYOUT
    METRICS --> LAYOUT

    LAYOUT --> SIDEBAR
    LAYOUT --> HEADER

    CHAT --> TABLES
    CHAT --> MODALS
    FEEDBACK --> TABLES
    FEEDBACK --> MODALS
    METRICS --> CHARTS
    DASHBOARD --> CHARTS

    TABLES --> UI
    MODALS --> UI
    FORMS --> UI
    CHARTS --> UI

    CHAT --> HOOKS
    FEEDBACK --> HOOKS
    HOOKS --> QUERY
    HOOKS --> SERVICE

    CONTEXT --> AUTH
    SERVICE --> AUTH
    SERVICE --> CONFIG

    QUERY --> SERVICE
    SERVICE --> TYPES

    LANDING --> ROUTER
    ROUTER --> AUTH

    style LANDING fill:#00818F,stroke:#28334A,stroke-width:2px,color:#fff
    style LAYOUT fill:#28334A,stroke:#00818F,stroke-width:2px,color:#fff
    style HOOKS fill:#5A6F8F,stroke:#28334A,stroke-width:2px,color:#fff
    style SERVICE fill:#0FA3B1,stroke:#28334A,stroke-width:2px
```

---

## Multi-Product Architecture

```mermaid
graph TB
    subgraph "User Interface"
        BROWSER[Web Browser]
    end

    subgraph "Landing Page"
        PRODUCTS[Products Landing Page<br/>Product Selection]
    end

    subgraph "Product: Unity ISA"
        subgraph "Unity ISA Routes"
            U_METRICS[AI Metrics Dashboard]
            U_DASH[Review Dashboard]
            U_CHAT[Chat Logs Review]
            U_FEED[Feedback Logs Review]
        end

        subgraph "Unity ISA Data"
            U_DB1[(Unity Chat Logs)]
            U_DB2[(Unity Feedback)]
            U_DB3[(Unity Eval Jobs)]
        end
    end

    subgraph "Product: Future Product 1"
        subgraph "Product 1 Routes"
            P1_METRICS[AI Metrics Dashboard]
            P1_DASH[Review Dashboard]
            P1_CHAT[Chat Logs Review]
            P1_FEED[Feedback Logs Review]
        end

        subgraph "Product 1 Data"
            P1_DB1[(Product 1 Chat Logs)]
            P1_DB2[(Product 1 Feedback)]
        end
    end

    subgraph "Shared Services"
        AUTH[Cognito Authentication]
        MONITOR[CloudWatch Monitoring]
        CDN[CloudFront CDN]
    end

    BROWSER --> CDN
    CDN --> PRODUCTS
    
    PRODUCTS --> U_METRICS
    PRODUCTS --> P1_METRICS
    
    U_METRICS --> U_DASH
    U_DASH --> U_CHAT
    U_CHAT --> U_FEED
    
    U_CHAT --> U_DB1
    U_FEED --> U_DB2
    U_METRICS --> U_DB3
    
    P1_METRICS --> P1_DASH
    P1_DASH --> P1_CHAT
    P1_CHAT --> P1_FEED
    
    P1_CHAT --> P1_DB1
    P1_FEED --> P1_DB2
    
    PRODUCTS --> AUTH
    U_METRICS --> AUTH
    P1_METRICS --> AUTH
    
    U_METRICS --> MONITOR
    P1_METRICS --> MONITOR

    style PRODUCTS fill:#00818F,stroke:#28334A,stroke-width:3px,color:#fff
    style U_METRICS fill:#28334A,stroke:#00818F,stroke-width:2px,color:#fff
    style P1_METRICS fill:#28334A,stroke:#00818F,stroke-width:2px,color:#fff
    style AUTH fill:#DD344C,stroke:#232F3E,stroke-width:2px
```

---

## Security Architecture

```mermaid
graph TB
    subgraph "External Threats"
        DDOS[DDoS Attacks]
        SQLI[SQL Injection]
        XSS[XSS Attacks]
        CSRF[CSRF Attacks]
        BOT[Bot Traffic]
    end

    subgraph "Security Layers"
        subgraph "Edge Security"
            SHIELD[AWS Shield<br/>DDoS Protection]
            WAF[AWS WAF<br/>Web Application Firewall]
            CF[CloudFront<br/>SSL/TLS Termination]
        end

        subgraph "Application Security"
            CSP[Content Security Policy]
            CORS[CORS Configuration]
            SANITIZE[Input Sanitization<br/>DOMPurify]
            HEADERS[Security Headers<br/>HSTS, X-Frame-Options]
        end

        subgraph "Authentication Security"
            MFA[Multi-Factor Auth]
            PASS[Password Policy<br/>Strong Requirements]
            TOKEN[JWT Token Validation]
            SESSION[Session Management]
        end

        subgraph "Authorization Security"
            IAM[IAM Policies<br/>Least Privilege]
            RBAC[Role-Based Access Control]
            SCOPE[OAuth Scopes]
        end

        subgraph "Data Security"
            ENCRYPT_REST[Encryption at Rest<br/>DynamoDB KMS]
            ENCRYPT_TRANSIT[Encryption in Transit<br/>TLS 1.2+]
            BACKUP[Automated Backups<br/>Point-in-Time Recovery]
            AUDIT[Audit Logging<br/>CloudTrail]
        end

        subgraph "Network Security"
            VPC[VPC Isolation]
            SG[Security Groups]
            NACL[Network ACLs]
            PRIVATE[Private Subnets]
        end
    end

    subgraph "Monitoring & Response"
        GUARD[GuardDuty<br/>Threat Detection]
        CONFIG[AWS Config<br/>Compliance]
        CLOUDWATCH[CloudWatch Alarms]
        SNS[SNS Alerts]
    end

    DDOS --> SHIELD
    BOT --> WAF
    SQLI --> WAF
    XSS --> WAF
    CSRF --> WAF

    SHIELD --> CF
    WAF --> CF
    CF --> CSP
    CF --> CORS
    CF --> HEADERS

    CSP --> SANITIZE
    SANITIZE --> MFA
    MFA --> PASS
    PASS --> TOKEN
    TOKEN --> SESSION

    SESSION --> IAM
    IAM --> RBAC
    RBAC --> SCOPE

    SCOPE --> ENCRYPT_REST
    ENCRYPT_REST --> ENCRYPT_TRANSIT
    ENCRYPT_TRANSIT --> BACKUP
    BACKUP --> AUDIT

    AUDIT --> VPC
    VPC --> SG
    SG --> NACL
    NACL --> PRIVATE

    PRIVATE --> GUARD
    GUARD --> CONFIG
    CONFIG --> CLOUDWATCH
    CLOUDWATCH --> SNS

    style SHIELD fill:#DD344C,stroke:#232F3E,stroke-width:2px
    style WAF fill:#DD344C,stroke:#232F3E,stroke-width:2px
    style IAM fill:#DD344C,stroke:#232F3E,stroke-width:2px
    style ENCRYPT_REST fill:#527FFF,stroke:#232F3E,stroke-width:2px
    style GUARD fill:#FF9900,stroke:#232F3E,stroke-width:2px
```

---

## Monitoring & Observability Architecture

```mermaid
graph TB
    subgraph "Application"
        APP[React Application]
        API[API Calls]
        ERRORS[Error Events]
    end

    subgraph "Metrics Collection"
        WEBVITALS[Web Vitals<br/>Performance Metrics]
        CUSTOM[Custom Metrics<br/>Business KPIs]
        LOGS[Application Logs]
    end

    subgraph "AWS CloudWatch"
        CWL[CloudWatch Logs<br/>Log Aggregation]
        CWM[CloudWatch Metrics<br/>Time Series Data]
        CWI[Container Insights<br/>EKS Metrics]
        XRAY[X-Ray<br/>Distributed Tracing]
    end

    subgraph "External APM"
        SENTRY[Sentry<br/>Error Tracking]
        SENTPERF[Sentry Performance<br/>Transaction Monitoring]
    end

    subgraph "Alerting"
        ALARM[CloudWatch Alarms]
        SNS[SNS Topics]
        EMAIL[Email Notifications]
        SLACK[Slack Integration]
        PAGER[PagerDuty]
    end

    subgraph "Dashboards"
        CWDASH[CloudWatch Dashboard]
        SENTDASH[Sentry Dashboard]
        CUSTOM_DASH[Custom Grafana<br/>Optional]
    end

    subgraph "Analysis"
        INSIGHTS[CloudWatch Insights<br/>Log Analysis]
        ATHENA[Athena<br/>Log Queries]
        QUICKSIGHT[QuickSight<br/>BI Reports]
    end

    APP --> WEBVITALS
    APP --> CUSTOM
    APP --> LOGS
    APP --> ERRORS

    WEBVITALS --> CWM
    CUSTOM --> CWM
    LOGS --> CWL
    API --> XRAY

    ERRORS --> SENTRY
    API --> SENTPERF

    CWL --> CWI
    CWM --> ALARM
    CWI --> ALARM

    ALARM --> SNS
    SNS --> EMAIL
    SNS --> SLACK
    SNS --> PAGER

    CWL --> CWDASH
    CWM --> CWDASH
    SENTRY --> SENTDASH
    CWM --> CUSTOM_DASH

    CWL --> INSIGHTS
    CWL --> ATHENA
    CWM --> QUICKSIGHT

    style APP fill:#00818F,stroke:#28334A,stroke-width:2px,color:#fff
    style CWL fill:#FF9900,stroke:#232F3E,stroke-width:2px
    style CWM fill:#FF9900,stroke:#232F3E,stroke-width:2px
    style SENTRY fill:#362D59,stroke:#000,stroke-width:2px,color:#fff
    style ALARM fill:#DD344C,stroke:#232F3E,stroke-width:2px
```

---

## CI/CD Pipeline Architecture

```mermaid
graph LR
    subgraph "Source Control"
        GIT[GitHub Repository]
        BRANCH[Feature Branch]
        MAIN[Main Branch]
    end

    subgraph "CI Pipeline"
        TRIGGER[Webhook Trigger]
        CHECKOUT[Checkout Code]
        DEPS[Install Dependencies]
        LINT[Lint & Format Check]
        TEST[Run Tests]
        BUILD[Build Application]
        SCAN[Security Scan]
    end

    subgraph "Artifact Storage"
        S3[S3 Bucket<br/>Build Artifacts]
        ECR[ECR<br/>Docker Images]
    end

    subgraph "CD Pipeline - Amplify"
        AMP_DEPLOY[Amplify Deploy]
        AMP_PREVIEW[Preview Environment]
        AMP_PROD[Production Deploy]
    end

    subgraph "CD Pipeline - EKS"
        DOCKER[Build Docker Image]
        PUSH[Push to ECR]
        KUBECTL[kubectl apply]
        ROLLOUT[Rolling Update]
    end

    subgraph "Environments"
        DEV[Development]
        STAGING[Staging]
        PROD[Production]
    end

    subgraph "Post-Deploy"
        SMOKE[Smoke Tests]
        HEALTH[Health Checks]
        NOTIFY[Notifications]
    end

    BRANCH --> GIT
    GIT --> MAIN
    MAIN --> TRIGGER
    TRIGGER --> CHECKOUT
    CHECKOUT --> DEPS
    DEPS --> LINT
    LINT --> TEST
    TEST --> BUILD
    BUILD --> SCAN

    SCAN --> S3
    SCAN --> DOCKER

    S3 --> AMP_DEPLOY
    AMP_DEPLOY --> AMP_PREVIEW
    AMP_PREVIEW --> AMP_PROD

    DOCKER --> PUSH
    PUSH --> ECR
    ECR --> KUBECTL
    KUBECTL --> ROLLOUT

    AMP_PREVIEW --> DEV
    AMP_PROD --> STAGING
    AMP_PROD --> PROD

    ROLLOUT --> DEV
    ROLLOUT --> STAGING
    ROLLOUT --> PROD

    DEV --> SMOKE
    STAGING --> SMOKE
    PROD --> SMOKE

    SMOKE --> HEALTH
    HEALTH --> NOTIFY

    style GIT fill:#181717,stroke:#fff,stroke-width:2px,color:#fff
    style BUILD fill:#00818F,stroke:#28334A,stroke-width:2px,color:#fff
    style PROD fill:#DD344C,stroke:#232F3E,stroke-width:2px,color:#fff
    style SMOKE fill:#4CAF50,stroke:#2E7D32,stroke-width:2px
```

---

## Disaster Recovery Architecture

```mermaid
graph TB
    subgraph "Primary Region - us-east-1"
        subgraph "Production Environment"
            APP1[Application<br/>Amplify/EKS]
            DB1[(DynamoDB Tables)]
            CW1[CloudWatch Logs]
        end

        subgraph "Backup Services"
            PITR[Point-in-Time Recovery<br/>Enabled]
            SNAP[On-Demand Backups<br/>Daily]
            S3_BACKUP[S3 Backup Bucket<br/>Versioned]
        end
    end

    subgraph "Secondary Region - us-west-2"
        subgraph "DR Environment"
            APP2[Application<br/>Standby]
            DB2[(DynamoDB Global Tables<br/>Optional)]
            CW2[CloudWatch Logs]
        end
    end

    subgraph "Cross-Region Services"
        R53[Route 53<br/>Health Checks & Failover]
        S3_REPL[S3 Cross-Region<br/>Replication]
    end

    subgraph "Recovery Procedures"
        DETECT[Failure Detection<br/>CloudWatch Alarms]
        DECIDE[Decision Point<br/>Manual/Automatic]
        FAILOVER[Failover Execution<br/>DNS Update]
        RESTORE[Data Restore<br/>From Backup]
        VERIFY[Verification<br/>Health Checks]
    end

    APP1 --> DB1
    DB1 --> PITR
    DB1 --> SNAP
    APP1 --> S3_BACKUP

    S3_BACKUP --> S3_REPL
    S3_REPL --> APP2
    DB1 --> DB2

    R53 --> APP1
    R53 --> APP2

    APP1 --> CW1
    CW1 --> DETECT
    DETECT --> DECIDE
    DECIDE --> FAILOVER
    DECIDE --> RESTORE

    FAILOVER --> R53
    RESTORE --> DB2
    RESTORE --> APP2

    APP2 --> VERIFY
    VERIFY --> R53

    style APP1 fill:#00818F,stroke:#28334A,stroke-width:3px,color:#fff
    style APP2 fill:#5A6F8F,stroke:#28334A,stroke-width:2px,color:#fff
    style DETECT fill:#DD344C,stroke:#232F3E,stroke-width:2px,color:#fff
    style VERIFY fill:#4CAF50,stroke:#2E7D32,stroke-width:2px
```

---

## Legend

### Color Coding

- **Teal (#00818F)**: Application/Frontend Components
- **Dark Blue (#28334A)**: Core Infrastructure
- **Orange (#FF9900)**: AWS Managed Services
- **Blue (#527FFF)**: Data Storage
- **Red (#DD344C)**: Security/Critical Services
- **Green (#4CAF50)**: Success/Verification States

### Icon Reference

- **Cylinder**: Database/Storage
- **Rectangle**: Service/Component
- **Diamond**: Decision Point
- **Hexagon**: External Service

---

## Diagram Usage

These diagrams can be rendered using:
- **GitHub**: Native Mermaid support in markdown
- **VS Code**: Mermaid Preview extension
- **Confluence**: Mermaid plugin
- **Draw.io**: Import Mermaid syntax
- **Online**: https://mermaid.live/

---

**Document Version**: 1.0
**Last Updated**: December 2024
**Maintained By**: Architecture Team
