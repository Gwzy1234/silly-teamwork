import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  FileOutlined,
  InboxOutlined,
} from '@ant-design/icons'
import {
  Alert,
  App,
  Button,
  Empty,
  Flex,
  Form,
  Input,
  List,
  Modal,
  Popconfirm,
  Space,
  Typography,
  Upload,
} from 'antd'
import type { UploadProps } from 'antd'
import dayjs from 'dayjs'
import { useState } from 'react'
import { getApiErrorMessage } from '../../../api/errors'
import {
  useCollaborationFiles,
  useDeleteFile,
  useDownloadFile,
  useUpdateFileMetadata,
  useUploadFile,
} from '../hooks'
import type { CollaborationFile, FileScope } from '../types'

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`
}

interface FilePanelProps {
  scope: FileScope
  ownerId: string
  title?: string
}

export function FilePanel({ scope, ownerId, title = '文件' }: FilePanelProps) {
  const { message } = App.useApp()
  const files = useCollaborationFiles(scope, ownerId)
  const uploadMutation = useUploadFile(scope, ownerId)
  const updateMutation = useUpdateFileMetadata(scope, ownerId)
  const deleteMutation = useDeleteFile(scope, ownerId)
  const downloadMutation = useDownloadFile()
  const [editingFile, setEditingFile] = useState<CollaborationFile | null>(null)
  const [renameForm] = Form.useForm<{ original_name: string }>()

  const runAction = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action()
      message.success(success)
    } catch (error) {
      message.error(getApiErrorMessage(error))
    }
  }

  const upload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    if (!(file instanceof File)) return
    try {
      const result = await uploadMutation.mutateAsync(file)
      onSuccess?.(result)
      message.success(`${file.name} 上传成功`)
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('文件上传失败'))
      message.error(getApiErrorMessage(error, '文件上传失败'))
    }
  }

  const openRename = (file: CollaborationFile) => {
    setEditingFile(file)
    renameForm.setFieldValue('original_name', file.original_name)
  }

  const submitRename = async () => {
    if (!editingFile) return
    try {
      const values = await renameForm.validateFields()
      await updateMutation.mutateAsync({
        fileId: editingFile.id,
        originalName: values.original_name.trim(),
      })
      message.success('文件名已更新')
      setEditingFile(null)
      renameForm.resetFields()
    } catch (error) {
      message.error(getApiErrorMessage(error))
    }
  }

  return (
    <Flex vertical gap={18}>
      <Upload.Dragger
        multiple
        showUploadList={false}
        customRequest={upload}
        disabled={uploadMutation.isPending}
      >
        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
        <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
        <p className="ant-upload-hint">文件访问和操作权限由后端统一校验</p>
      </Upload.Dragger>

      <Flex justify="space-between" align="center">
        <Typography.Title level={5} style={{ margin: 0 }}>{title}</Typography.Title>
        <Typography.Text type="secondary">共 {files.data?.length ?? 0} 个</Typography.Text>
      </Flex>

      {files.isError ? (
        <Alert
          showIcon
          type="error"
          message="文件列表加载失败"
          action={<Button onClick={() => files.refetch()}>重试</Button>}
        />
      ) : files.data?.length ? (
        <List
          loading={files.isPending}
          dataSource={files.data}
          renderItem={(file) => (
            <List.Item
              actions={[
                <Button
                  key="download"
                  type="link"
                  icon={<DownloadOutlined />}
                  loading={downloadMutation.isPending && downloadMutation.variables?.fileId === file.id}
                  onClick={() => void runAction(
                    () => downloadMutation.mutateAsync({ fileId: file.id, originalName: file.original_name }),
                    '文件已开始下载',
                  )}
                >
                  下载
                </Button>,
                <Button key="rename" type="link" icon={<EditOutlined />} onClick={() => openRename(file)}>
                  重命名
                </Button>,
                <Popconfirm
                  key="delete"
                  title="删除文件"
                  description={`确定删除“${file.original_name}”吗？`}
                  okText="删除"
                  cancelText="取消"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => runAction(() => deleteMutation.mutateAsync(file.id), '文件已删除')}
                >
                  <Button danger type="link" icon={<DeleteOutlined />}>删除</Button>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                avatar={<FileOutlined className="file-list-icon" />}
                title={file.original_name}
                description={
                  <Space size="middle" wrap>
                    <span>{formatFileSize(file.size_bytes)}</span>
                    <span>{file.content_type || '未知类型'}</span>
                    <span>上传于 {dayjs(file.created_at).format('YYYY-MM-DD HH:mm')}</span>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      ) : files.isPending ? null : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂未上传文件" />
      )}

      <Modal
        title="修改文件名"
        open={Boolean(editingFile)}
        onCancel={() => setEditingFile(null)}
        onOk={submitRename}
        confirmLoading={updateMutation.isPending}
        okText="保存"
      >
        <Form form={renameForm} layout="vertical">
          <Form.Item
            name="original_name"
            label="文件名"
            rules={[
              { required: true, whitespace: true, message: '请输入文件名' },
              { max: 255, message: '文件名不能超过 255 个字符' },
            ]}
          >
            <Input maxLength={255} />
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  )
}
