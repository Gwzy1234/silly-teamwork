import type { components } from '../../api/generated/schema'

export type CollaborationFile = components['schemas']['FileResponse']
export type FileMetadataUpdate = components['schemas']['FileMetadataUpdate']
export type FileScope = 'project' | 'task'
