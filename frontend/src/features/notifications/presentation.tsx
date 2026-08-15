import {
  BellOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FileAddOutlined,
  NotificationOutlined,
  ProjectOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import { Tag } from 'antd'
import type { ReactNode } from 'react'
import type { NotificationType } from './types'

const notificationPresentation: Record<NotificationType, {
  label: string
  color: string
  icon: ReactNode
}> = {
  task_due_soon: { label: '任务即将截止', color: 'orange', icon: <ClockCircleOutlined /> },
  task_overdue: { label: '任务已逾期', color: 'red', icon: <CalendarOutlined /> },
  project_due_soon: { label: '科目即将结束', color: 'blue', icon: <BellOutlined /> },
  system: { label: '系统通知', color: 'purple', icon: <NotificationOutlined /> },
  project_created: { label: '新科目', color: 'blue', icon: <ProjectOutlined /> },
  task_created: { label: '新任务', color: 'cyan', icon: <UnorderedListOutlined /> },
  file_uploaded: { label: '新文件', color: 'green', icon: <FileAddOutlined /> },
}

export function NotificationTypeTag({ type }: { type: NotificationType }) {
  const item = notificationPresentation[type]
  return <Tag color={item.color} icon={item.icon}>{item.label}</Tag>
}
