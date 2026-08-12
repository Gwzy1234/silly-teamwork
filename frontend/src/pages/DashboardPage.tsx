import {
  BellOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Alert, Card, Col, Empty, Flex, List, Row, Skeleton, Statistic, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useCurrentUser } from '../features/auth/hooks'
import {
  useOverdueTasks,
  useUpcomingTasks,
} from '../features/dashboard/hooks'
import { useNotifications } from '../features/notifications/hooks'
import type { DashboardTask } from '../features/dashboard/types'
import { useTeams } from '../features/teams/hooks'
import { usePreferencesStore } from '../features/settings/store'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

interface MetricCardProps {
  title: string
  value?: number
  loading: boolean
  error: boolean
  icon: ReactNode
  color: string
}

function MetricCard({ title, value, loading, error, icon, color }: MetricCardProps) {
  return (
    <Card className="metric-card">
      <Flex align="center" justify="space-between">
        <div>
          <Typography.Text type="secondary">{title}</Typography.Text>
          {loading ? (
            <Skeleton.Input active size="small" style={{ display: 'block', marginTop: 8 }} />
          ) : error ? (
            <Typography.Title level={3} type="secondary" style={{ margin: '8px 0 0' }}>
              --
            </Typography.Title>
          ) : (
            <Statistic value={value ?? 0} valueStyle={{ fontWeight: 700 }} />
          )}
        </div>
        <span className="metric-icon" style={{ color, backgroundColor: `${color}18` }}>
          {icon}
        </span>
      </Flex>
    </Card>
  )
}

function TaskList({ tasks, emptyText }: { tasks: DashboardTask[]; emptyText: string }) {
  if (!tasks.length) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} />
  return (
    <List
      dataSource={tasks}
      renderItem={(task) => (
        <List.Item>
          <List.Item.Meta
            title={<Link to={`/tasks/${task.id}`}>{task.title}</Link>}
            description={
              task.due_at ? `截止时间 ${dayjs(task.due_at).format('MM月DD日 HH:mm')}` : '无截止时间'
            }
          />
          <Tag color={task.priority === 'urgent' ? 'red' : task.priority === 'high' ? 'orange' : 'blue'}>
            {task.priority}
          </Tag>
        </List.Item>
      )}
    />
  )
}

export function DashboardPage() {
  const user = useCurrentUser().data
  const teams = useTeams()
  const deadlineHours = usePreferencesStore((state) => state.dashboardDeadlineHours)
  const upcoming = useUpcomingTasks(deadlineHours)
  const overdue = useOverdueTasks()
  const notifications = useNotifications()
  const unreadCount = notifications.data?.filter((item) => !item.is_read).length

  return (
    <Flex vertical gap={24}>
      <Card className="dashboard-hero">
        <Typography.Title level={2} style={{ margin: 0 }}>
          你好，{user?.nickname || user?.username}
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ margin: '8px 0 0' }}>
          这里汇总了你的团队协作和最近截止事项。
        </Typography.Paragraph>
      </Card>

      {[teams, upcoming, overdue, notifications].some((query) => query.isError) && (
        <Alert showIcon type="warning" message="部分数据暂时加载失败，其他模块仍可正常使用。" />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <MetricCard
            title="我的团队"
            value={teams.data?.length}
            loading={teams.isPending}
            error={teams.isError}
            icon={<TeamOutlined />}
            color="#1677ff"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MetricCard
            title={`${deadlineHours} 小时内截止`}
            value={upcoming.data?.length}
            loading={upcoming.isPending}
            error={upcoming.isError}
            icon={<CalendarOutlined />}
            color="#13a8a8"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MetricCard
            title="已逾期任务"
            value={overdue.data?.length}
            loading={overdue.isPending}
            error={overdue.isError}
            icon={<ClockCircleOutlined />}
            color="#ff4d4f"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MetricCard
            title="未读通知"
            value={unreadCount}
            loading={notifications.isPending}
            error={notifications.isError}
            icon={<BellOutlined />}
            color="#722ed1"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Card title="即将截止" className="content-card" loading={upcoming.isPending}>
            {upcoming.isError ? (
              <Alert type="error" message="即将截止任务加载失败" showIcon />
            ) : (
              <TaskList tasks={upcoming.data ?? []} emptyText={`未来 ${deadlineHours} 小时暂无截止任务`} />
            )}
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card title="逾期任务" className="content-card" loading={overdue.isPending}>
            {overdue.isError ? (
              <Alert type="error" message="逾期任务加载失败" showIcon />
            ) : (
              <TaskList tasks={overdue.data ?? []} emptyText="太好了，目前没有逾期任务" />
            )}
          </Card>
        </Col>
      </Row>
    </Flex>
  )
}
