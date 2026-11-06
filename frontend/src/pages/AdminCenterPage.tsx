import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Menu, Card, Row, Col, Statistic, Typography, Space, Badge } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  FolderOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  BarChartOutlined,
  SafetyOutlined,
  FileTextOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { UsersPage } from './admin/UsersPage';
import { CategoriesPage } from './admin/CategoriesPage';
import { RolesPage } from './admin/RolesPage';
import { TeamsPage } from './admin/TeamsPage';
import { ReviewPage } from './admin/ReviewPage';
import { SettingsPage } from './admin/SettingsPage';
import { StatisticsPage } from './admin/StatisticsPage';
import './AdminCenterPage.css';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

interface AdminStats {
  totalUsers: number;
  totalDocuments: number;
  pendingApprovals: number;
  systemIssues: number;
  userGrowth: number;
  documentGrowth: number;
}

export const AdminCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const { section } = useParams();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalDocuments: 0,
    pendingApprovals: 0,
    systemIssues: 0,
    userGrowth: 0,
    documentGrowth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // 模拟数据
      setStats({
        totalUsers: 156,
        totalDocuments: 1243,
        pendingApprovals: 23,
        systemIssues: 3,
        userGrowth: 12.5,
        documentGrowth: 8.3,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      key: 'overview',
      icon: <BarChartOutlined />,
      label: '系统概览',
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: 'roles',
      icon: <SafetyOutlined />,
      label: '角色管理',
    },
    {
      key: 'teams',
      icon: <TeamOutlined />,
      label: '团队管理',
    },
    {
      key: 'categories',
      icon: <FolderOutlined />,
      label: '分类管理',
    },
    {
      key: 'review',
      icon: <CheckCircleOutlined />,
      label: '审核流程',
      badge: stats.pendingApprovals,
    },
    {
      key: 'statistics',
      icon: <BarChartOutlined />,
      label: '数据统计',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(`/admin/${key}`);
  };

  const renderOverview = () => (
    <div className="admin-overview">
      <div className="page-header">
        <div>
          <Title level={2}>系统概览</Title>
          <Text type="secondary">系统运行状态和关键指标</Text>
        </div>
      </div>

      <Row gutter={[20, 20]} className="stats-grid">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="总用户数"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              loading={loading}
              valueStyle={{ color: '#2563eb' }}
            />
            <div className="stat-trend positive">
              <span>↑ {stats.userGrowth}%</span>
              <Text type="secondary">较上月</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="总文档数"
              value={stats.totalDocuments}
              prefix={<FileTextOutlined />}
              loading={loading}
              valueStyle={{ color: '#10b981' }}
            />
            <div className="stat-trend positive">
              <span>↑ {stats.documentGrowth}%</span>
              <Text type="secondary">较上月</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="待审核"
              value={stats.pendingApprovals}
              prefix={<CheckCircleOutlined />}
              loading={loading}
              valueStyle={{ color: '#f59e0b' }}
            />
            <div className="stat-trend">
              <Text type="secondary">需要处理</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="系统告警"
              value={stats.systemIssues}
              prefix={<BellOutlined />}
              loading={loading}
              valueStyle={{ color: '#ef4444' }}
            />
            <div className="stat-trend negative">
              <span>需要关注</span>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="快捷操作" className="actions-card">
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={8} md={6}>
                <div className="action-item" onClick={() => navigate('/admin/users')}>
                  <UserOutlined />
                  <span>添加用户</span>
                </div>
              </Col>
              <Col xs={12} sm={8} md={6}>
                <div className="action-item" onClick={() => navigate('/admin/categories')}>
                  <FolderOutlined />
                  <span>创建分类</span>
                </div>
              </Col>
              <Col xs={12} sm={8} md={6}>
                <div className="action-item" onClick={() => navigate('/admin/roles')}>
                  <SafetyOutlined />
                  <span>配置角色</span>
                </div>
              </Col>
              <Col xs={12} sm={8} md={6}>
                <div className="action-item" onClick={() => navigate('/admin/approvals')}>
                  <CheckCircleOutlined />
                  <span>审核文档</span>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="最近活动" className="activity-card">
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon user">
                  <UserOutlined />
                </div>
                <div className="activity-content">
                  <div className="activity-title">新用户注册</div>
                  <div className="activity-time">张三 刚刚注册</div>
                </div>
                <div className="activity-time">2分钟前</div>
              </div>
              <div className="activity-item">
                <div className="activity-icon document">
                  <FileTextOutlined />
                </div>
                <div className="activity-content">
                  <div className="activity-title">文档上传</div>
                  <div className="activity-time">李四上传了《系统设计文档》</div>
                </div>
                <div className="activity-time">15分钟前</div>
              </div>
              <div className="activity-item">
                <div className="activity-icon approval">
                  <CheckCircleOutlined />
                </div>
                <div className="activity-content">
                  <div className="activity-title">文档审核</div>
                  <div className="activity-time">王五审核通过了3篇文档</div>
                </div>
                <div className="activity-time">1小时前</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="系统状态" className="status-card">
            <div className="status-list">
              <div className="status-item">
                <div className="status-label">数据库服务</div>
                <div className="status-value">
                  <Badge status="success" text="正常运行" />
                </div>
              </div>
              <div className="status-item">
                <div className="status-label">搜索服务</div>
                <div className="status-value">
                  <Badge status="success" text="正常运行" />
                </div>
              </div>
              <div className="status-item">
                <div className="status-label">AI服务</div>
                <div className="status-value">
                  <Badge status="processing" text="高负载" />
                </div>
              </div>
              <div className="status-item">
                <div className="status-label">存储空间</div>
                <div className="status-value">
                  <Badge status="warning" text="已使用 75%" />
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );

  return (
    <Layout className="admin-center">
      <Sider
        width={280}
        theme="light"
        className="admin-sider"
        style={{
          borderRight: '1px solid #f0f0f0',
          overflow: 'auto',
          height: 'calc(100vh - 64px)',
        }}
      >
        <div className="admin-header">
          <Title level={4}>管理中心</Title>
          <Text type="secondary">系统管理</Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[section || 'overview']}
          items={menuItems.map((item) => ({
            ...item,
            label: item.badge ? (
              <Space>
                {item.label}
                <Badge count={item.badge} size="small" />
              </Space>
            ) : (
              item.label
            ),
          }))}
          onClick={handleMenuClick}
          className="admin-menu"
        />
      </Sider>
      <Content className="admin-content">
        <Routes>
          <Route index element={<>{renderOverview()}</>} />
          <Route path="overview" element={<>{renderOverview()}</>} />
          <Route path="users" element={<UsersPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="review" element={<ReviewPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="*" element={<Navigate to="/admin/overview" replace />} />
        </Routes>
      </Content>
    </Layout>
  );
};

export default AdminCenterPage;
