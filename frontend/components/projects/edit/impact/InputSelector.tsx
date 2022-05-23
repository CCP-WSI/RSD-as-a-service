import {Button, ToggleButton, ToggleButtonGroup} from '@mui/material'
import TextField from '@mui/material/TextField'
import {useState} from 'react'


const options = {
  doi: {
    key:'doi',
    label: 'DOI',
    helperText: 'Provide doi to extract info from',
    button: 'Find'
  },
  title: {
    key:'title',
    label: 'Title',
    helperText: 'We search by publication title in Crossref, DataCite and RSD',
    button: 'Find'
  },
  query: {
    key:'query',
    label: 'Text',
    helperText: 'We search in Crossref, DataCite and RSD databases',
    button: 'Find'
  }
}

type OptionKeys = keyof typeof options
export type InputAction = {
  type: string,
  value: string
}
type InputSelectorProps = {
  onStartAction: (action:InputAction)=>void
}


export default function InputSelector({onStartAction}:InputSelectorProps) {
  // const [optionKey, setOptionKey] = useState<OptionKeys>('doi')
  const [option, setOption] = useState(options['doi'])
  const [input, setInput] = useState('')
  // const option = options[optionKey]
  const keys= Object.keys(options)

  function handleChange (
    event: React.MouseEvent<HTMLElement>,
    key: string,
  ){
    // ignore click on same item
    if (key===null) return
    const option = options[(key as OptionKeys)]
    // setOptionKey(option as OptionKeys)
    setOption(option)
  }

  function startAction() {
    if (option?.key && input) {
      const action = {
        type: option.key,
        value: input
      }
      onStartAction(action)
    }
  }

  return (
    <>
    <div className="py-8">
      <ToggleButtonGroup
        color="primary"
        value={option.key}
        exclusive
        onChange={handleChange}
      >
        {keys.map(key => {
          const item = options[(key as OptionKeys)]
          return (
            <ToggleButton
              key={key}
              value={key}>{item.label}
            </ToggleButton>
          )
        })}
      </ToggleButtonGroup>
    </div>
    <div className="flex">
      <TextField
        autoComplete='off'
        variant="standard"
        label={option.label}
        helperText={option.helperText}
        onChange={({target})=>setInput(target.value)}
        sx={{
          flex: 1
        }}
      />
      <Button
        disabled={input===''}
        onClick={startAction}>
        {option.button}
      </Button>
    </div>
    </>
  )
}
