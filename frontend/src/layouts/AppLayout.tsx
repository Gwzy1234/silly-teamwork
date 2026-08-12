import {
  BellOutlined,
  DashboardOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Avatar, Badge, Button, Dropdown, Layout, Menu, Space, Typography } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useCurrentUser, logout } from '../features/auth/hooks'
import { useNotifications } from '../features/notifications/hooks'
import { usePreferencesStore } from '../features/settings/store'

const { Header, Content, Sider } = Layout

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = useCurrentUser().data
  const notifications = useNotifications()
  const unreadCount = notifications.data?.filter((item) => !item.is_read).length ?? 0
  const sidebarCollapsed = usePreferencesStore((state) => state.sidebarCollapsed)
  const toggleSidebar = usePreferencesStore((state) => state.toggleSidebar)
  const theme = usePreferencesStore((state) => state.theme)

  const navigationItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: '概览' },
    { key: '/teams', icon: <TeamOutlined />, label: '我的团队' },
    {
      key: '/notifications',
      icon: <BellOutlined />,
      label: <Space size={8}>通知中心 <Badge count={unreadCount} size="small" /></Space>,
    },
    { key: '/settings', icon: <SettingOutlined />, label: '用户设置' },
  ]

  return (
    <Layout className="app-layout">
      <Sider
        width={236}
        collapsedWidth={72}
        collapsed={sidebarCollapsed}
        theme={theme}
        className="app-sider"
      >
        <div className="app-brand">
          <span className="app-logo">
            <TeamOutlined />
          </span>
          {!sidebarCollapsed && <span>Silly Teamwork</span>}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[
            location.pathname.startsWith('/teams') ? '/teams' : location.pathname,
          ]}
          items={navigationItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className="app-header">
          <Button
            type="text"
            className="sidebar-toggle"
            aria-label={sidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'}
            icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSidebar}
          />
          <Button
            type="text"
            aria-label="通知中心"
            icon={<Badge count={unreadCount} size="small"><BellOutlined /></Badge>}
            onClick={() => navigate('/notifications')}
          />
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: '退出登录',
                  onClick: () => {
                    logout()
                    navigate('/login', { replace: true })
                  },
                },
              ],
            }}
          >
            <Button type="text">
              <Space>
                <Avatar size="small" icon={<UserOutlined />} />
                <Typography.Text strong>
                  {currentUser?.nickname || currentUser?.username}
                </Typography.Text>
              </Space>
            </Button>
          </Dropdown>
        </Header>
        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
