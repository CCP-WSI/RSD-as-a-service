import logger from '~/utils/logger'
import {CrossrefSelectItem} from '~/types/Crossref'
import {WorkResponse} from '~/types/Datacite'
import {
  crossrefItemToMentionItem,
  getCrossrefItemByDoi, getCrossrefItemsByTitle
} from '~/utils/getCrossref'
import {
  dataCiteGraphQLItemToMentionItem,
  getDataciteItemsByDoiGraphQL, getDataciteItemsByTitleGraphQL
} from '~/utils/getDataCite'


type DoiRA = {
  DOI: string,
  RA: string
}

const exampleUrlResponse = {
  'responseCode': 1,
  'handle': '10.5281/zenodo.3401363',
  'values': [
    {
      'index': 1,
      'type': 'URL',
      'data': {
        'format': 'string',
        'value': 'https://zenodo.org/record/3401363'
      },
      'ttl': 86400,
      'timestamp': '2019-09-06T13:29:11Z'
    }
  ]
}

type DoiUrlResponse = typeof exampleUrlResponse

async function getDoiRA(doi: string) {
  try {
    const url = `https://doi.org/doiRA/${doi}`
    const resp = await fetch(url)
    // debugger
    if (resp.status === 200) {
      const json:DoiRA[] = await resp.json()
      // extract
      if (json.length > 0) {
        return json[0]
      }
    }
  } catch (e: any) {
    logger(`getDoiRA: ${e?.message}`, 'error')
  }
}

async function getUrlFromDoiOrg(doi:string) {
  try {
    const url = ` https://doi.org/api/handles/${doi}?type=URL`
    const resp = await fetch(url)
    // debugger
    if (resp.status === 200) {
      const json: DoiUrlResponse = await resp.json()
      // extract
      if (json.values.length > 0) {
        const item = json.values[0]
        if (item.type.toLowerCase() === 'url') {
          return item.data.value
        }
      }
    }
  } catch (e: any) {
    logger(`getUrlFromDoiOrg: ${e?.message}`, 'error')
  }
}

// This url will always redirect to the current url
export function makeDoiRedirectUrl(doi: string) {
  return `https://doi.org/${doi}`
}


async function getItemFromCrossref(doi: string) {
  const resp = await getCrossrefItemByDoi(doi)

  if (resp) {
    const mention = crossrefItemToMentionItem(resp)
    return mention
  }
}

async function getItemFromDatacite(doi: string) {
  const resp = await getDataciteItemsByDoiGraphQL(doi)

  if (resp) {
    const mention = dataCiteGraphQLItemToMentionItem(resp)
    return mention
  }
}


export async function extractMentionFromDoi(doi: string) {
  // get RA first
  const doiRA = await getDoiRA(doi)
  // debugger
  if (doiRA) {
    switch (doiRA.RA.toLowerCase()) {
      case 'crossref':
        // get from crossref
        return getItemFromCrossref(doi)
      case 'datacite':
        // get from datacite
        return getItemFromDatacite(doi)
      default:
        return {
          status: 400,
          message: `${doiRA.RA} not supported. RSD supports Crossref and DataCite api`
        }
    }
  }
  return {
    status: 400,
    message: 'Failed to retereive DOI information. Check DOI value.'
  }
}

export async function findPublicationByTitle(title: string) {
  const publications = []
  const promises = [
    getCrossrefItemsByTitle(title),
    getDataciteItemsByTitleGraphQL(title)
  ]
  // make requests
  const [crossref, datacite] = await Promise.all(promises)
  // convert responses
  const crosrefItems = crossref?.map(item => {
    return crossrefItemToMentionItem(item as CrossrefSelectItem)
  })
  const dataciteItems = datacite?.map(item => {
    return dataCiteGraphQLItemToMentionItem(item as WorkResponse)
  })
  // const uniqueCrossrefItems = uniqueItems({
  //   list: crosrefItems ?? [],
  //   key: 'doi'
  // })
  // // deduplicate on doi
  // const genuineDataciteItems = itemsNotInReferenceList({
  //   list: uniqueCrossrefItems ?? [],
  //   referenceList: dataciteItems ?? [],
  //   key: 'doi'
  // })
  // add crossref
  if (crosrefItems) {
    publications.push(
      ...crosrefItems
    )
  }
  // add genuine (unique) datacite items
  if (dataciteItems) {
    publications.push(
      ...dataciteItems
    )
  }
  // return results
  return publications
}
