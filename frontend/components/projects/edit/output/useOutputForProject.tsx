import {useEffect, useState} from 'react'
import {MentionForProject} from '~/types/Mention'
import {getOutputForProject} from '~/utils/getProjects'

export default function useOutputForProject({project,token}:{project:string,token:string}){
  const [output, setOutput] = useState<MentionForProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let abort = false
    async function getImpact() {
      setLoading(true)
      const mentions = await getOutputForProject({
        project,
        token,
        frontend: true
      })
      if (mentions && abort === false) {
        setOutput(mentions)
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
    output
  }
}
