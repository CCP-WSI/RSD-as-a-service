import {MentionByType} from '../components/software/MentionsByType'
import {AutocompleteOption} from '../types/AutocompleteOptions'
import {MentionItem, MentionForSoftware, MentionForProject, mentionColumns, MentionTypeKeys} from '../types/Mention'
import {createJsonHeaders, extractReturnMessage} from './fetchHelpers'
import logger from './logger'

export async function getMentionsForSoftware({software,token,frontend}:{software: string, token?: string,frontend?:boolean}) {
  try {
    // the content is order by type ascending
    const query = `mention?select=${mentionColumns},mention_for_software!inner(software)&mention_for_software.software=eq.${software}&order=mention_type.asc`
    let url = `${process.env.POSTGREST_URL}/${query}`
    if (frontend) {
      url = `/api/v1/${query}`
    }

    const resp = await fetch(url, {
      method: 'GET',
      headers: createJsonHeaders(token)
    })
    if (resp.status === 200) {
      const data: MentionForSoftware[] = await resp.json()
      return data
    }
    logger(`getMentionsForSoftware: [${resp.status}] [${url}]`, 'error')
    // query not found
    return []
  } catch (e: any) {
    logger(`getMentionsForSoftware: ${e?.message}`, 'error')
    return []
  }
}

export async function getMentionsForSoftwareOfType({software, type, token, frontend}:
  { software: string, type:string, token?: string, frontend?: boolean }) {
  try {
    const query = `mention?select=${mentionColumns},mention_for_software!inner(software)&mention_for_software.software=eq.${software}&type=eq.${type}&order=title.asc`
    let url = `${process.env.POSTGREST_URL}/${query}`

    if (frontend) {
      url = `/api/v1/${query}`
    }

    const resp = await fetch(url, {
      method: 'GET',
      headers: createJsonHeaders(token)
    })
    if (resp.status === 200) {
      const data: MentionForSoftware[] = await resp.json()
      return data
    }
    logger(`getMentionsForSoftwareOfType: 404 [${url}]`, 'error')
    // query not found
    return []
  } catch (e: any) {
    logger(`getMentionsForSoftwareOfType: ${e?.message}`, 'error')
    return []
  }
}

/**
 * Searching for mentions in mention table which are NOT assigned to this software already.
 * @returns MentionItem[]
 */
export async function searchForAvailableMentions({software, searchFor, token}:
  {software:string, searchFor: string, token: string }) {
  const url ='/api/v1/rpc/search_mentions_for_software'
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: createJsonHeaders(token),
      body: JSON.stringify({
        software_id: software,
        search_text: searchFor
      })
    })

    if (resp.status === 200) {
      const json:MentionItem[] = await resp.json()
      return json
    } else {
      logger(`searchForAvailableMentions: 404 [${url}]`, 'error')
      return []
    }
  } catch (e:any) {
    logger(`searchForAvailableMentions: ${e?.message}`, 'error')
    return []
  }
}

export async function addMentionToSoftware({mention, software, token}: { mention: string, software: string, token: string }) {
  const url = '/api/v1/mention_for_software'
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: createJsonHeaders(token),
      body: JSON.stringify({
        software,
        mention
      })
    })

    return extractReturnMessage(resp, mention)

  } catch (e:any) {
    logger(`addMentionToSoftware: ${e?.message}`, 'error')
    return {
      status: 500,
      message: e?.message
    }
  }
}

export async function removeMentionForSoftware({mention, software, token}:
  { mention: string, software: string, token: string }) {
  const url = `/api/v1/mention_for_software?software=eq.${software}&mention=eq.${mention}`
  try {
    const resp = await fetch(url, {
      method: 'DELETE',
      headers: createJsonHeaders(token)
    })

    return extractReturnMessage(resp, mention)

  } catch (e: any) {
    logger(`removeMentionForSoftware: ${e?.message}`, 'error')
    return {
      status: 500,
      message: e?.message
    }
  }
}

export function mentionsToAutocompleteOptions(mentions: MentionItem[]) {
  const options:AutocompleteOption<MentionItem>[] = mentions.map((item, pos) => {
    return {
      key: item.doi ?? Math.random().toString(),
      label: item.title,
      data: {
        ...item,
        pos
      }
    }
  })
  return options
}

export function clasifyMentionsByType(mentions: MentionForSoftware[]|MentionForProject[]) {
  let mentionByType: MentionByType = {}
  let featuredMentions: MentionForSoftware[] | MentionForProject[] = []

  mentions.forEach(item => {
    // remove array with software uuid
    // delete item.mention_for_software
    // check if type prop exists
    let mType = item?.mention_type as MentionTypeKeys ?? 'other'

    // extract featured mentions
    if (item.is_featured === true) {
      // mType = 'featured'
      featuredMentions.push(item)
    } else if (mentionByType.hasOwnProperty(mType)) {
      mentionByType[mType]?.push(item)
    } else {
      // create array for new type
      mentionByType[mType]=[]
      // and add this item
      mentionByType[mType]?.push(item)
    }
  })
  return {
    mentionByType,
    featuredMentions
  }
}
