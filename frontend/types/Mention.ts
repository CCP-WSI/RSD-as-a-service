/**
 * Based on database enum type from
 * database/008-create-mention-table.sql
 */
export const mentionType = {
  blogPost: {
    key:'blogPost',
    plural: 'Blogposts',
    singular: 'Blogpost'
  },
  book: {
    key: 'book',
    plural: 'Books',
    singular: 'Book'
  },
  bookSection: {
    key: 'bookSection',
    plural: 'Book section',
    singular: 'Book section'
  },
  computerProgram: {
    key: 'computerProgram',
    plural: 'Computer programs',
    singular: 'Computer program'
  },
  conferencePaper: {
    key: 'conferencePaper',
    plural: 'Conference papers',
    singular: 'Conference paper'
  },
  dataset: {
    key: 'dataset',
    plural: 'Dataset',
    singular: 'Dataset'
  },
  interview: {
    key: 'interview',
    plural: 'Interviews',
    singular: 'Interviews'
  },
  journalArticle: {
    key: 'journalArticle',
    plural: 'Journal articles',
    singular: 'Journal article'
  },
  magazineArticle: {
    key: 'magazineArticle',
    plural: 'Magazine articles',
    singular: 'Magazine article'
  },
  newspaperArticle: {
    key: 'newspaperArticle',
    plural: 'Newspaper articles',
    singular: 'Newspaper article'
  },
  presentation: {
    key: 'presentation',
    plural: 'Presentations',
    singular: 'Presentation'
  },
  report: {
    key: 'report',
    plural: 'Reports',
    singular: 'Reports'
  },
  thesis: {
    key: 'thesis',
    plural: 'Thesis',
    singular: 'Thesis'
  },
  videoRecording: {
    key: 'videoRecording',
    plural: 'Video recordings',
    singular: 'Video recording'
  },
  webpage: {
    key: 'webpage',
    plural: 'Webpages',
    singular: 'Webpage'
  },
  other: {
    key: 'other',
    plural: 'Other',
    singular: 'Other'
  },
  // additional type for featured mentions
  // featured: {
  //   plural: 'Featured mentions',
  //   singular: 'Featured mention'
  // }
}

// removed 2022-05-23
// export const mentionTypeSingular = {
//   blogPost: 'Blogpost',
//   book: 'Book',
//   bookSection: 'Book section',
//   computerProgram: 'Computer program',
//   conferencePaper: 'Conference paper',
//   dataset: 'Dataset',
//   interview: 'Interview',
//   journalArticle: 'Journal article',
//   magazineArticle: 'Magazine article',
//   newspaperArticle: 'Newspaper article',
//   note: 'Note',
//   presentation: 'Presentation',
//   report: 'Report',
//   thesis: 'Thesis',
//   videoRecording: 'Video recording',
//   webpage: 'Webpage',
//   other: 'Other'
//   // additional type for featured mentions
//   // featured: 'Featured mentions'
// }

// export type MentionEditType = keyof typeof mentionTypeSingular
export type MentionTypeKeys = keyof typeof mentionType
export type MentionType = {
  [key in MentionTypeKeys]?: {
    key: string
    plural: string
    singular: string
  }
}

// as in mention table
export type MentionItem = {
  id: string
  doi: string | null,
  url: string | null,
  title: string
  authors: string | null
  publisher: string | null
  publication_year: string | null
  page: string | null
  // url to external image
  image_url: string | null
  is_featured: boolean
  mention_type: MentionTypeKeys
  source: string
}

// mention table joined with mention_for_software
export type MentionForSoftware = MentionItem & {
  mention_for_software?: any[]
}

// mention table joined with output_for_project OR impact_for_project
export type MentionForProject = MentionItem & {
  output_for_project?: any[]
  impact_for_project?: any[]
}

export const mentionColumns ='id,doi,url,title,authors,publisher,publication_year,page,image_url,is_featured,mention_type,source'
