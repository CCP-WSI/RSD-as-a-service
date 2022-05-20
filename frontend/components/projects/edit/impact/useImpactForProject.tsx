import {useEffect, useState} from 'react'
import {MentionForProject} from '~/types/Mention'
import {getImpactForProject} from '~/utils/getProjects'

export default function useImpactForProject({project,token}:{project:string,token:string}){
  const [impact, setImpact] = useState<MentionForProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let abort = false
    async function getImpact() {
      setLoading(true)
      const mentions = await getImpactForProject({
        project,
        token,
        frontend: true
      })
      if (mentions && abort === false) {
        setImpact(mentions)
        setLoading(false)
      }
    }
    if (project && token) {
      getImpact()
    }
    ()=>{abort = true}
  },[project,token])

  return {
    loading,
    impact
  }
}
