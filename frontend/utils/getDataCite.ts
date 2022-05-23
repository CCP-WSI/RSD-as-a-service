import {DoiMention, makeDoiRedirectUrl} from '~/components/projects/edit/impact/findMentionApi'
import {DataciteWorkGraphQLResponse, DataciteWorksGraphQLResponse, WorkResponse} from '~/types/Datacite'
import {createJsonHeaders} from './fetchHelpers'
import logger from './logger'

function graphQLDoiQuery(doi:string) {
  const gql = `{
    work(id: "${doi}"){
      doi,
      type,
      citationCount,
      referenceCount,
      titles(first: 1){
        title
      },
      descriptions(first:1){
        description
      },
      publisher,
      publicationYear,
      creators{
        givenName,
          familyName,
          affiliation{
          name
        }
      },
      contributors{
        givenName,
          familyName,
          affiliation{
          name
        }
      }
    }
  }`
  return gql
}

function gqlConceptDoiQuery(doi: string) {
  const gql =`{
    work(id:"${doi}"){
      doi,
      type,
      titles(first:1){
        title
      },
      versionCount,
      versionOfCount,
      versionOf{
        nodes{
          doi
        }
      }
    }
  }`
  return gql
}

function gqlWorksByTitleQuery(title: string) {
  const gql = `{
    works(query:"titles.title:${title}",first:30){
      nodes{
        doi,
        type,
        citationCount,
        referenceCount,
        titles(first: 1){
          title
        },
        descriptions(first:1){
          description
        },
        publisher,
        publicationYear,
        creators{
          givenName,
            familyName,
            affiliation{
            name
          }
        },
        contributors{
          givenName,
            familyName,
            affiliation{
            name
          }
        }
      }
    }
  }
  `
  return gql
}

export function dataCiteGraphQLItemToRawMention(item: WorkResponse) {
  const mention: DoiMention = {
    doi: item.doi,
    title: item.titles[0].title,
    url: makeDoiRedirectUrl(item.doi),
    author: item.creators.map(author => {
      return `${author.givenName} ${author.familyName}`
    }),
    publisher: item.publisher,
    published: item.publicationYear.toString(),
    type: item.type,
    source: 'DataCite'
  }
  return mention
}

export async function getDataciteItemsByDoiGraphQL(doi: string) {
  try {
    const query = graphQLDoiQuery(doi)
    const url = 'https://api.datacite.org/graphql'

    const resp = await fetch(url, {
      method: 'POST',
      headers: createJsonHeaders(),
      body: JSON.stringify({
        operationName: null,
        variables:{},
        query
      })
    })

    if (resp.status === 200) {
      const json: DataciteWorkGraphQLResponse = await resp.json()
      if (json.data.work) return json.data.work
    }

  } catch (e: any) {
    logger(`getMentionByDoi: ${e?.message}`, 'error')
  }
}

export async function getDataciteItemsByTitleGraphQL(title: string) {
  try {
    const query = gqlWorksByTitleQuery(title)
    const url = 'https://api.datacite.org/graphql'

    const resp = await fetch(url, {
      method: 'POST',
      headers: createJsonHeaders(),
      body: JSON.stringify({
        operationName: null,
        variables: {},
        query
      })
    })
    if (resp.status === 200) {
      const json: DataciteWorksGraphQLResponse = await resp.json()
      if (json.data.works.nodes) return json.data.works.nodes
    }

  } catch (e: any) {
    logger(`getMentionByDoi: ${e?.message}`, 'error')
  }
}
