import React, {useEffect, useRef, useState} from 'react'
import {ClickAwayListener} from '@mui/base'
import {useRouter} from 'next/router'
import {getGlobalSearch} from '~/components/GlobalSearchAutocomplete/globalSearchAutocomplete.api'
import {useAuth} from '~/auth'

import ProjectsIcon from '~/components/icons/projects.svg'
import SoftwareIcon from '~/components/icons/software.svg'
import OrganisationIcon from '~/components/icons/organisation.svg'
import EnterkeyIcon from '~/components/icons/enterkey.svg'

type Props = {
  className?: string
}

export default function GlobalSearchAutocomplete(props: Props) {
  const router = useRouter()
  const [isOpen, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [selected, setSelected] = useState(0)
  const [hasResults, setHasResults] = useState(true)
  const [searchResults, setSearchResults] = useState<GlobalSearchResults[]>([])

  const {session} = useAuth()

  useEffect(() => {
    if (inputValue === '') {
      setOpen(false)
      setSelected(0)
    }
  }, [inputValue])

  function handleClick() {
    router.push('/' + searchResults[selected]?.source + '/' + searchResults[selected]?.slug)
    setSelected(0)
    setOpen(false)
    setInputValue('')
  }

  // Handle keyup
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setOpen(true)
    // Handle arrow up and down
    switch (e.keyCode) {
      // Backspace - Remove selection
      case 8:
        setSelected(0)
        break
      // Up arrow
      case 38:
        e.preventDefault() // Disallows the cursor to move to the end of the input
        selected > 0 && setSelected(selected - 1)
        break
      // Down arrow
      case 40:
        e.preventDefault() // Disallows the cursor to move to the end of the input
        searchResults.length - 1 > selected && setSelected(selected + 1)
        break
      // Enter
      case 13:
        handleClick()
        break
      // Escape key
      case 27:
        setOpen(false)
        break
    }
  }

  const handleChange = async (e: React.FormEvent<HTMLInputElement>) => {
    const search = e.currentTarget.value
    // Update state
    setInputValue(search)
    // Fetch api
    const data = await getGlobalSearch(search, session.token) || []

    if (data?.length === 0) {
      setHasResults(false)
      setSearchResults(
        [
          {name: 'Go to Software page', slug: 'software', source: 'software'},
          {name: 'Go to Projects page', slug: 'projects', source: 'projects'},
          {name: 'Go to Organisations page', slug: 'organisations', source: 'organisations'},
        ]
      )
    } else {
      setHasResults(true)
      setSearchResults(data)
    }
  }

  return (
    <ClickAwayListener onClickAway={() => {
      setOpen(false)
    }}>

      <div
        className={`${props.className} relative z-10 flex w-48 max-w-[300px] focus-within:w-full duration-700`}>
        <input className="px-3 py-2 bg-transparent rounded-sm border border-white border-opacity-50 focus:outline-0
                          w-full focus:bg-white focus:text-black
                          duration-300"
               placeholder="Search or jump to..."
               autoComplete="off"
               value={inputValue}
               onChange={handleChange}
               onKeyDown={handleKeyDown}
               type="search"
        />

        {isOpen &&
          <div
            className="shadow-xl absolute top-[50px] w-full left-0  bg-white text-black py-2 rounded">
            {!hasResults && <div className="px-4 py-3 font-normal bg-gray-200 mb-2 "><span className="animate-pulse">No results...</span></div>}
            {searchResults.map((item, index) =>
              <div key={index}
                   className={`${selected === index && 'bg-[#09A1E3] text-white'} flex gap-2 p-2 cursor-pointer transition justify-between items-center`}
                   onClick={handleClick}
                   onMouseEnter={() => setSelected(index)}
              >
                <div className="flex gap-3 w-full">
                  {/*icon*/}
                  <div>
                    {item?.source === 'software' && <SoftwareIcon/>}
                    {item?.source === 'projects' && <ProjectsIcon/>}
                    {item?.source === 'organisations' && <OrganisationIcon/>}
                  </div>

                  <div className="flex-grow ">
                    <div className="font-normal line-clamp-1">{item?.name}</div>
                    <div className="text-xs text-current text-opacity-40">{item?.source}</div>
                  </div>

                  {selected === index &&
                    <div>
                      <EnterkeyIcon/>
                    </div>
                  }
                </div>
              </div>
            )}
          </div>
        }
      </div>

    </ClickAwayListener>
  )
}
