import {useEffect, useState} from 'react'

import {MentionTypeKeys, MentionForSoftware} from '../../../../types/Mention'
import {getMentionsForSoftware} from '../../../../utils/editMentions'
import {MentionByType} from '../../MentionsByType'
import {initialCount,MentionCountByType} from './MentionCountContext'

function countMentionsByType(mentions:MentionForSoftware[]) {
  let mentionByType: MentionByType = {}
  let countByType = initialCount

  // classify mentions by type
  mentions.forEach(item => {
    // extract type
    let mType = item?.mention_type as MentionTypeKeys ?? 'other'
    // try to load object path
    let mentionOfType = mentionByType[mType]
    if (typeof mentionOfType != 'undefined') {
      // add new item to array
      mentionOfType.push(item)
    } else {
      // create array for new type
      mentionOfType = []
      // and add this item
      mentionOfType.push(item)
    }
  })

  // calculation
  Object.keys(countByType).map(key => {
    let mentionOfType = mentionByType[key as MentionTypeKeys]
    if (typeof mentionOfType != 'undefined') {
      countByType[key as MentionTypeKeys] = mentionOfType.length
    } else {
      countByType[key as MentionTypeKeys] = 0
    }
  })

  return countByType
}


export default function useMentionCountByType({software, token}:
  {software: string, token: string}) {
  const [count, setCount] = useState<MentionCountByType>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let abort = false
    async function getMentions(software:string,token:string) {
      setLoading(true)
      const mentions = await getMentionsForSoftware({
        software,
        token,
        frontend:true
      })
      // stop op abort
      if (abort===true) return null
      const counts = countMentionsByType(mentions ?? [])
      setCount(counts)
      setLoading(false)
    }
    if (typeof software != 'undefined' && token) {
      getMentions(software,token)
    }
    return ()=>{abort=true}
  }, [software, token])

  // console.group('useMentionCountByType')
  // console.log('count...', count)
  // console.log('loading...', loading)
  // console.groupEnd()

  return {count, loading}
}
