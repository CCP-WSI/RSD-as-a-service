
type DoiPerson = {
  'name': string
  'givenName': string
  'familyName': string
  'affiliation': string[]
}

type DoiAttributes = {
  doi: string,
  creators: DoiPerson[]
  contributors: DoiPerson[]
  titles: [
    {title:string}
  ],
  publisher: string
  publicationYear: number
  subjects: [
    {subject:string}
  ]
  referenceCount: number
  citationCount: number
  // and many more but we are initially interesed in these
  // see exapleResponse for more or response from
  // https://api.datacite.org/dois/10.5281/zenodo.1051064
  // documentation https://support.datacite.org/reference/get_dois-id
}


type DoiData = {
  id: string
  type: string
}

type DoiReplationships = {
  client: {
    data: DoiData
  },
  citations: {
    data: DoiData
  },
  versions: {
    data: DoiData[]
  },
  versionOf: {
    data: DoiData[]
  }
}


type DoisResponse = {
  id: string,
  type: 'dois'
  attributes: DoiAttributes
  relationships: DoiReplationships
}

export type DataciteDoisApiResponse = {
  data: DoisResponse
}

export type DataciteWorkGraphQLResponse = {
  data: {
    work: WorkResponse
  }
}

export type DataciteWorksGraphQLResponse = {
  data: {
    works: {
      nodes: WorkResponse[]
    }
  }
}

export type WorkResponse = typeof exampleWork

const exampleWork = {
  'doi': '10.5281/zenodo.5873940',
  'type': 'Software',
  'citationCount': 0,
  'referenceCount': 0,
  'titles': [
    {
      'title': 'GGIR'
        }
  ],
  'descriptions': [
    {
      'description': 'Converts raw data from wearables into insightful reports for researchers investigating human daily physical activity and sleep.'
        }
  ],
  'publisher': 'Zenodo',
  'publicationYear': 2022,
  'creators': [
    {
      'givenName': 'Vincent',
      'familyName': 'van Hees',
      'affiliation': [
        {
          'name': 'Netherlands eScience Center'
            }
      ]
    },
    {
      'givenName': 'Zhou',
      'familyName': 'Fang',
      'affiliation': [
        {
          'name': 'Activinsights Ltd.'
            }
      ]
    }
  ],
  'contributors': [{
    'givenName': 'Jairo H.',
    'familyName': 'Migueles',
    'affiliation': [
      {
        'name': 'University of Granada'
          }
    ]
  }],
  'versionCount': 0,
  'versionOfCount': 1
}
