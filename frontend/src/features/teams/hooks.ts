import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTeam,
  createTeamInvitation,
  getTeam,
  joinTeam,
  listTeamMembers,
  listTeams,
} from './api'

export const teamQueryKeys = {
  all: ['teams'] as const,
  detail: (teamId: string) => ['teams', teamId] as const,
  members: (teamId: string) => ['teams', teamId, 'members'] as const,
}

export function useTeams() {
  return useQuery({ queryKey: teamQueryKeys.all, queryFn: listTeams })
}

export function useTeam(teamId: string) {
  return useQuery({
    queryKey: teamQueryKeys.detail(teamId),
    queryFn: () => getTeam(teamId),
    enabled: Boolean(teamId),
  })
}

export function useTeamMembers(teamId: string) {
  return useQuery({
    queryKey: teamQueryKeys.members(teamId),
    queryFn: () => listTeamMembers(teamId),
    enabled: Boolean(teamId),
  })
}

export function useCreateTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: teamQueryKeys.all }),
  })
}

export function useJoinTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: joinTeam,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: teamQueryKeys.all }),
  })
}

export function useCreateTeamInvitation(teamId: string) {
  return useMutation({
    mutationFn: (payload: Parameters<typeof createTeamInvitation>[1]) =>
      createTeamInvitation(teamId, payload),
  })
}
