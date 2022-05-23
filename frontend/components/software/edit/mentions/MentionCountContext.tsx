import {createContext} from 'react'
import {MentionTypeKeys} from '~/types/Mention'

export const initialCount:MentionCountByType = {
  blogPost: 0,
  book: 0,
  bookSection: 0,
  computerProgram: 0,
  conferencePaper: 0,
  dataset:0,
  interview: 0,
  journalArticle:0,
  magazineArticle:0,
  newspaperArticle:0,
  presentation:0,
  report:0,
  thesis:0,
  videoRecording:0,
  webpage: 0,
  other: 0
}

export type MentionCountByType = {
  [key in MentionTypeKeys]?: number
}

export type MentionCountContextProps = {
  mentionCount: MentionCountByType | undefined,
  setMentionCount: (mentionCount:MentionCountByType)=>void
}

const MentionCountContext = createContext<MentionCountContextProps>({
  mentionCount:initialCount,
  setMentionCount:()=>{}
})

export default MentionCountContext
