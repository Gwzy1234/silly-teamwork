import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteFile,
  downloadFile,
  listFileIndex,
  listProjectFiles,
  listTaskFiles,
  updateFileMetadata,
  uploadProjectFile,
  uploadTaskFile,
} from './api'
import type { FileScope } from './types'

export const fileQueryKeys = {
  index: (query: string) => ['files', 'index', { query }] as const,
  project: (projectId: string) => ['projects', projectId, 'files'] as const,
  task: (taskId: string) => ['tasks', taskId, 'files'] as const,
}

export function useFileIndex(query: string) {
  return useQuery({
    queryKey: fileQueryKeys.index(query),
    queryFn: () => listFileIndex(query || undefined),
  })
}

function scopeQueryKey(scope: FileScope, ownerId: string) {
  return scope === 'project' ? fileQueryKeys.project(ownerId) : fileQueryKeys.task(ownerId)
}

export function useCollaborationFiles(scope: FileScope, ownerId: string) {
  return useQuery({
    queryKey: scopeQueryKey(scope, ownerId),
    queryFn: () => scope === 'project' ? listProjectFiles(ownerId) : listTaskFiles(ownerId),
    enabled: Boolean(ownerId),
  })
}

export function useUploadFile(scope: FileScope, ownerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => scope === 'project'
      ? uploadProjectFile(ownerId, file)
      : uploadTaskFile(ownerId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: scopeQueryKey(scope, ownerId) }),
  })
}

export function useUpdateFileMetadata(scope: FileScope, ownerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ fileId, originalName }: { fileId: string; originalName: string }) =>
      updateFileMetadata(fileId, { original_name: originalName }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: scopeQueryKey(scope, ownerId) }),
  })
}

export function useDeleteFile(scope: FileScope, ownerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteFile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: scopeQueryKey(scope, ownerId) }),
  })
}

export function useDownloadFile() {
  return useMutation({
    mutationFn: async ({ fileId, originalName }: { fileId: string; originalName: string }) => {
      const blob = await downloadFile(fileId)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = originalName
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    },
  })
}
