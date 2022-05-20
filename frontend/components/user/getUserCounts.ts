import {createJsonHeaders} from '~/utils/fetchHelpers'
import logger from '~/utils/logger'
import {UserCounts} from './UserNav'

type MaintainerCounts = UserCounts & {
  id: string
}

const defaultResponse = {
  id: undefined,
  software_cnt: undefined,
  project_cnt: undefined,
  organisation_cnt: undefined,
}

export async function getUserCounts({token,frontend=false}:
  {token: string, frontend:boolean}) {
  try {
    // NOTE! the selection is based on the token
    // RLS in postgres returns only counts for the user
    // therefore no additional account filter is required
    let query = 'rpc/counts_by_maintainer'
    let url = `/api/v1/${query}`
    if (frontend === false) {
      url = `${process.env.POSTGREST_URL}/${query}`
    }

    const resp = await fetch(url, {
      method: 'GET',
      headers: createJsonHeaders(token)
    })

    if (resp.status === 200) {
      const json: MaintainerCounts[] = await resp.json()
      if (json.length === 1) {
        return json[0]
      }
      return defaultResponse
    }
    // ERRORS
    logger(`getUserCounts: ${resp.status}:${resp.statusText}`, 'warn')
    return defaultResponse
  } catch (e: any) {
    logger(`getUserCounts: ${e?.message}`, 'error')
    return defaultResponse
  }
}