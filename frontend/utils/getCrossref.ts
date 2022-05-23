import {makeDoiRedirectUrl} from '~/components/projects/edit/impact/findMentionApi'
import {CrossrefResponse, CrossrefSelectItem, crossrefSelectProps, crossrefType} from '~/types/Crossref'
import {MentionItem} from '~/types/Mention'
import {apiMentionTypeToRSDTypeKey} from './editMentions'
import logger from './logger'


function extractAuthors(item: CrossrefSelectItem) {
  if (item.author) {
    return item.author.map(author => {
      return `${author.given} ${author.family}`
    }).join(',')
  }
  return ''
}

function extractTypeLabel(type: string) {
  if (type && crossrefType.hasOwnProperty(type)) {
    return crossrefType[type as keyof typeof crossrefType].label
  }
  return type
}

function extractYearPublished(item: CrossrefSelectItem) {
  if (item.published &&
    item.published['date-parts'] &&
    item.published['date-parts'].length > 0) {
    // first data item
    const dateItem = item.published['date-parts'][0]
    if (typeof dateItem === 'object') {
      return dateItem[0].toString()
    }
    return dateItem
  }
  return ''
}

export function crossrefItemToMentionItem(item: CrossrefSelectItem) {
  const mention: MentionItem = {
    id: null,
    doi: item.DOI,
    url: makeDoiRedirectUrl(item.DOI),
    title: item.title,
    authors: extractAuthors(item),
    publisher: item.publisher,
    // extract only Year
    publication_year: extractYearPublished(item),
    page: item.page ?? null,
    image_url: null,
    is_featured: false,
    mention_type: apiMentionTypeToRSDTypeKey(item.type),
    source: 'Crossref'
  }
  return mention
}

export async function getCrossrefItemByDoi(doi: string) {
  try {
    const filter = `filter=doi:${doi}`
    const select = `select=${crossrefSelectProps.join(',')}`
    const ettiquete = 'mailto=mijatovic1970@gmail.com'
    const url = `https://api.crossref.org/works?${filter}&${select}&${ettiquete}`

    const resp = await fetch(url)

    if (resp.status === 200) {
      const json: CrossrefResponse = await resp.json()
      // find doi item
      const doiItem = json.message.items.filter(item => item.DOI === doi)
      // if found return it
      if (doiItem.length === 1) {
        return doiItem[0]
      }
    }
  }catch(e:any){
    logger(`getCrossrefItemByDoi: ${e?.message}`, 'error')
  }
}

export async function getCrossrefItemsByTitle(title: string) {
  try {
    const filter = `query.title=${title}`
    const select = `select=${crossrefSelectProps.join(',')}`
    const ettiquete = 'mailto=mijatovic1970@gmail.com'
    const order = 'sort=score&order=desc'
    const rows = 'rows=30'
    // get top 30 items
    const url = `https://api.crossref.org/works?${filter}&${select}&${ettiquete}&${order}&${rows}`

    const resp = await fetch(url)

    if (resp.status === 200) {
      const json: CrossrefResponse = await resp.json()
      // find doi item
      return json.message.items
    }
  } catch (e: any) {
    logger(`getCrossrefItemsByTitle: ${e?.message}`, 'error')
  }
}

export async function getCrossrefItemsByQuery(query: string) {
  try {
    const filter = `query=${query}`
    const select = `select=${crossrefSelectProps.join(',')}`
    const ettiquete = 'mailto=mijatovic1970@gmail.com'
    const order = 'sort=published&order=desc'
    const rows = 'rows=30'
    // get top 30 items
    const url = `https://api.crossref.org/works?${filter}&${select}&${ettiquete}&${order}&${rows}`

    const resp = await fetch(url)

    if (resp.status === 200) {
      const json: CrossrefResponse = await resp.json()
      // find doi item
      return json.message.items
    }
  } catch (e: any) {
    logger(`getCrossrefItemsByQuery: ${e?.message}`, 'error')
  }
}

