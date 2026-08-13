import {
  CalendarOutlined,
  IdcardOutlined,
  LaptopOutlined,
  LogoutOutlined,
  MailOutlined,
  MenuFoldOutlined,
  MoonOutlined,
  SunOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Alert,
  App,
  Button,
  Card,
  Descriptions,
  Flex,
  Result,
  Segmented,
  Select,
  Skeleton,
  Space,
  Switch,
  Tag,
  Typography,
} from 'antd'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { logout, useCurrentUser } from '../features/auth/hooks'
import {
  usePreferencesStore,
  type DashboardDeadlineHours,
  type ThemePreference,
} from '../features/settings/store'

const deadlineOptions: { value: DashboardDeadlineHours; label: string }[] = [
  { value: 24, label: '未来 24 小时' },
  { value: 48, label: '未来 48 小时' },
  { value: 72, label: '未来 72 小时' },
  { value: 168, label: '未来 7 天' },
]

export function SettingsPage() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const currentUser = useCurrentUser()
  const sidebarCollapsed = usePreferencesStore((state) => state.sidebarCollapsed)
  const theme = usePreferencesStore((state) => state.theme)
  const dashboardDeadlineHours = usePreferencesStore((state) => state.dashboardDeadlineHours)
  const setSidebarCollapsed = usePreferencesStore((state) => state.setSidebarCollapsed)
  const setTheme = usePreferencesStore((state) => state.setTheme)
  const setDashboardDeadlineHours = usePreferencesStore((state) => state.setDashboardDeadlineHours)

  if (currentUser.isPending) return <Card><Skeleton active avatar paragraph={{ rows: 6 }} /></Card>
  if (currentUser.isError || !currentUser.data) {
    return <Result status="error" title="账号信息加载失败" extra={<Button onClick={() => currentUser.refetch()}>重试</Button>} />
  }

  const user = currentUser.data

  const signOut = () => {
    logout()
    message.success('已退出登录')
    navigate('/login', { replace: true })
  }

  return (
    <Flex vertical gap={24}>
      <div>
        <Typography.Title level={2} style={{ margin: 0 }}>用户设置</Typography.Title>
        <Typography.Text type="secondary">查看账号信息并管理当前设备上的界面偏好</Typography.Text>
      </div>

      <Card className="content-card" title="账号信息">
        <Flex vertical gap={24}>
          <Descriptions column={{ xs: 1, md: 2 }}>
            <Descriptions.Item label="用户名"><UserOutlined /> {user.username}</Descriptions.Item>
            <Descriptions.Item label="昵称">{user.nickname || '未设置'}</Descriptions.Item>
            <Descriptions.Item label="邮箱"><MailOutlined /> {user.email || '未设置'}</Descriptions.Item>
            <Descriptions.Item label="账号状态">
              <Tag color={user.is_active ? 'success' : 'error'}>{user.is_active ? '正常' : '已停用'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="用户 ID" span={2}><IdcardOutlined /> {user.id}</Descriptions.Item>
            <Descriptions.Item label="注册时间">{dayjs(user.created_at).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{dayjs(user.updated_at).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
          </Descriptions>
          <Alert showIcon type="info" message="账号资料暂不支持在线修改" description="当前后端仅提供账号信息查询接口。" />
        </Flex>
      </Card>

      <Card className="content-card" title="本地偏好">
        <Flex vertical gap={24}>
          <Flex justify="space-between" align="center" gap={20} wrap>
            <Space align="start">
              <MenuFoldOutlined className="settings-preference-icon" />
              <div>
                <Typography.Text strong>折叠侧边栏</Typography.Text>
                <br />
                <Typography.Text type="secondary">为主要内容留出更多显示空间</Typography.Text>
              </div>
            </Space>
            <Switch checked={sidebarCollapsed} onChange={setSidebarCollapsed} />
          </Flex>

          <Flex justify="space-between" align="center" gap={20} wrap>
            <Space align="start">
              <LaptopOutlined className="settings-preference-icon" />
              <div>
                <Typography.Text strong>主题偏好</Typography.Text>
                <br />
                <Typography.Text type="secondary">仅保存在当前浏览器</Typography.Text>
              </div>
            </Space>
            <Segmented<ThemePreference>
              value={theme}
              onChange={setTheme}
              options={[
                { value: 'light', label: '浅色', icon: <SunOutlined /> },
                { value: 'dark', label: '深色', icon: <MoonOutlined /> },
              ]}
            />
          </Flex>

          <Flex justify="space-between" align="center" gap={20} wrap>
            <Space align="start">
              <CalendarOutlined className="settings-preference-icon" />
              <div>
                <Typography.Text strong>Dashboard 默认截止范围</Typography.Text>
                <br />
                <Typography.Text type="secondary">控制概览页“即将截止”任务的时间窗口</Typography.Text>
              </div>
            </Space>
            <Select
              value={dashboardDeadlineHours}
              options={deadlineOptions}
              style={{ width: 160 }}
              onChange={setDashboardDeadlineHours}
            />
          </Flex>
        </Flex>
      </Card>

      <Card className="content-card" title="账号操作">
        <Flex justify="space-between" align="center" gap={16} wrap>
          <div>
            <Typography.Text strong>退出当前账号</Typography.Text>
            <br />
            <Typography.Text type="secondary">清除当前登录状态并返回登录页</Typography.Text>
          </div>
          <Button danger icon={<LogoutOutlined />} onClick={signOut}>退出登录</Button>
        </Flex>
      </Card>
    </Flex>
  )
}
