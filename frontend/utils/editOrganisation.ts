import isMaintainerOfOrganisation from '../auth/permissions/isMaintainerOfOrganisation'
import {AutocompleteOption} from '../types/AutocompleteOptions'
import {
  EditOrganisation, Organisation,
  OrganisationsForSoftware,
  SearchOrganisation, SoftwareForOrganisation
} from '../types/Organisation'
import {createJsonHeaders, extractReturnMessage} from './fetchHelpers'
import {getPropsFromObject} from './getPropsFromObject'
import {findInRORByName} from './getROR'
import {getSlugFromString} from './getSlugFromString'
import logger from './logger'
import {optionsNotInReferenceList} from './optionsNotInReferenceList'

// organisation colums used in editOrganisation.getOrganisationsForSoftware
const columsForSelect = 'id,slug,primary_maintainer,name,ror_id,is_tenant,website,logo_for_organisation(id)'
// organisation colums used in editOrganisation.createOrganisation
const columsForCreate = [
  'slug', 'primary_maintainer', 'name', 'ror_id', 'is_tenant', 'website'
]
// organisation colums used in editOrganisation.updateOrganisation
export const columsForUpdate = [
  'id',
  ...columsForCreate
]

export async function searchForOrganisation({searchFor, token, frontend}:
  { searchFor: string, token?: string, frontend?: boolean }) {
  try {
    // make requests to RSD and ROR
    const [rsdOptions, rorOptions] = await Promise.all([
      findRSDOrganisation({searchFor, token, frontend}),
      findInRORByName({searchFor})
    ])
    // create options collection
    const options = [
      ...rsdOptions,
      ...optionsNotInReferenceList({
        list: rorOptions,
        referenceList: rsdOptions,
      })
    ]
    // return all options
    return options
  } catch (e: any) {
    logger(`searchForOrganisation: ${e?.message}`, 'error')
    return []
  }
}

export async function findRSDOrganisation({searchFor, token, frontend}:
  { searchFor: string, token?: string, frontend?: boolean }){
  try {
    let url = `${process.env.POSTGREST_URL}/organisation?select=${columsForSelect}&name=ilike.*${searchFor}*&limit=20`
    if (frontend) {
      url = `/api/v1/organisation?name=ilike.*${searchFor}*&limit=50`
    }
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        ...createJsonHeaders(token),
      }
    })

    if (resp.status === 200) {
      const data: Organisation[] = await resp.json()
      const options: AutocompleteOption<SearchOrganisation>[] = data.map(item => {
        return {
          key: item?.ror_id ?? item.slug ?? item.name,
          label: item.name ?? '',
          data: {
            ...item,
            source: 'RSD'
          }
        }
      })
      return options
    } else if (resp.status === 404) {
      logger('findRSDOrganisation ERROR: 404 Not found', 'error')
      // query not found
      return []
    }
    logger(`findRSDOrganisation ERROR: ${resp?.status} ${resp?.statusText}`, 'error')
    return []
  } catch (e:any) {
    logger(`findRSDOrganisation: ${e?.message}`, 'error')
    return []
  }
}

export async function getOrganisationsForSoftware({software,token}:{software:string,token:string}){
  const url = `/api/v1/software_for_organisation?select=software,status,organisation(${columsForSelect})&software=eq.${software}`
  try {
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        ...createJsonHeaders(token)
      },
    })
    if (resp.status === 200) {
      const json: OrganisationsForSoftware[] = await resp.json()
      return json
    }
    return []
  } catch (e:any) {
    logger(`getOrganisationsForSoftware: ${e?.message}`, 'error')
    return []
  }
}

export async function saveExistingOrganisation({item, token, pos, setState}:
  {item: EditOrganisation, token: string, pos:number, setState: (item:EditOrganisation,pos:number)=>void}) {
  if (!item.id) return {
    status: 400,
    message: 'Organisation id missing.'
  }
  // update existing organisation
  const resp = await updateOrganisation({
    item,
    token
  })
  if (resp.status === 200) {
    const organisation = updateDataObjectAfterSave({
      data: item,
      id: item.id
    })
    // update local list
    setState(organisation, pos)
    // return OK state
    return {
      status: 200,
      message: 'OK'
    }
  } else {
    // showErrorMessage(resp.message)
    return resp
  }
}

export async function saveNewOrganisation({item, token, software, account, setState}:
  {item: EditOrganisation, token: string, software:string, account: string, setState: (item: EditOrganisation) => void }) {
  // create new organisation
  let resp = await createOrganisation({
    item,
    token
  })
  // only 201 and 206 accepted
  if ([201, 206].includes(resp.status) === false) {
    // on error we return message
    return resp
  }
  // we receive id in message
  const id = resp.message
  if (resp.status === 201) {
    // add this organisation to software
    resp = await addOrganisationToSoftware({
      software,
      organisation: id,
      account,
      token
    })
    if (resp.status === 200) {
      debugger
      // we receive assigned status in message
      item.status = resp.message
      // update data, remove base64 string after upload
      // and create logo_id to be used as image reference
      const organisation = updateDataObjectAfterSave({
        data: item,
        id
      })
      // update local list
      setState(organisation)
      return {
        status: 200,
        message: 'OK'
      }
    } else {
      return resp
    }
  } else if (resp.status === 206) {
    // organisation is created but the image failed
    const organisation = updateDataObjectAfterSave({
      data: item,
      id
    })
    setState(organisation)
    // we show error about failure on logo
    return {
      status: 206,
      message: 'Failed to upload organisation logo.'
    }
  } else {
    return resp
  }
}

export async function createOrganisation({item, token}:
  {item: EditOrganisation, token: string}) {
  try {
    // extract only required items
    const organisation = getPropsFromObject(item,columsForCreate)

    const url = '/api/v1/organisation'
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        ...createJsonHeaders(token),
        'Prefer': 'return=headers-only'
      },
      body: JSON.stringify(organisation)
    })

    if (resp.status === 201) {
      // we need to return id of created record
      // it can be extracted from header.location
      const id = resp.headers.get('location')?.split('.')[1]
      if (id &&
        item?.logo_b64 &&
        item?.logo_mime_type) {
        const base64 = item?.logo_b64.split(',')[1]
        const resp = await uploadOrganisationLogo({
          id,
          data: base64,
          mime_type: item.logo_mime_type,
          token
        })
        if (resp.status === 200) {
          return {
            status: 201,
            message: id
          }
        } else {
          return {
            status: 206,
            message: id
          }
        }
      } else {
        return {
          status: 201,
          message: id
        }
      }
    } else {
      return extractReturnMessage(resp)
    }
  } catch (e:any) {
    return {
      status: 500,
      message: e?.message
    }
  }
}

export async function updateOrganisation({item, token}:
  { item: EditOrganisation, token: string }) {
  try {
    // extract only required items
    const organisation = getPropsFromObject(item, columsForUpdate)

    const url = `/api/v1/organisation?id=eq.${item.id}`
    const resp = await fetch(url, {
      method: 'PATCH',
      headers: {
        ...createJsonHeaders(token)
      },
      body: JSON.stringify(organisation)
    })

    if ([200,204].includes(resp.status) &&
      item?.logo_b64 &&
      item?.logo_mime_type &&
      item?.id) {
      const base64 = item?.logo_b64.split(',')[1]
      const resp = await uploadOrganisationLogo({
        id: item.id,
        data: base64,
        mime_type: item.logo_mime_type,
        token
      })
      return resp
    }
    return extractReturnMessage(resp)
  } catch (e: any) {
    return {
      status: 500,
      message: e?.message
    }
  }
}

export async function uploadOrganisationLogo({id, data, mime_type, token}:
  { id: string, data: string, mime_type: string, token: string }) {
  try {
    const url = '/api/v1/logo_for_organisation'
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        ...createJsonHeaders(token),
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id,
        data,
        mime_type
      })
    })
    return extractReturnMessage(resp)
  } catch (e: any) {
    return {
      status: 500,
      message: e?.message
    }
  }
}

export async function deleteOrganisationLogo({id, token}:
  { id: string, token: string }) {
  try {
    const url = `/api/v1/logo_for_organisation?id=eq.${id}`
    const resp = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...createJsonHeaders(token)
      }
    })
    return extractReturnMessage(resp)
  } catch (e: any) {
    return {
      status: 500,
      message: e?.message
    }
  }
}

export async function addOrganisationToSoftware({software, organisation, account, token}:
  { software: string, organisation: string, account: string, token:string }) {
  // 2a. determine status
  let status: SoftwareForOrganisation['status'] = 'requested_by_origin'
  // check if this is organisation maintainer
  const isMaintainer = await isMaintainerOfOrganisation({
    organisation,
    account,
    token
  })
  // if maintainer we approve it automatically
  if (isMaintainer === true) status = 'approved'
  // 2b. register participating organisation for this software
  const data: SoftwareForOrganisation = {
    software,
    organisation,
    status
  }
  const url = '/api/v1/software_for_organisation'
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      ...createJsonHeaders(token),
      'Prefer': 'return=headers-only'
    },
    body: JSON.stringify(data)
  })
  if ([200,201].includes(resp.status)) {
    // return status assigned to organisation
    return {
      status: 200,
      message: status
    }
  }
  return extractReturnMessage(resp)
}

export async function deleteOrganisationFromSoftware({software, organisation, token}:
  {software: string|undefined, organisation: string, token: string }) {
  try {
    if (typeof software == 'undefined') {
      return {
        status: 400,
        message: 'Bad request. software id undefined'
      }
    }
    const url = `/api/v1/software_for_organisation?software=eq.${software}&organisation=eq.${organisation}`
    const resp = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...createJsonHeaders(token)
      }
    })
    return extractReturnMessage(resp)
  } catch (e: any) {
    return {
      status: 500,
      message: e?.message
    }
  }
}

export function getUrlFromLogoId(logo_id: string|null|undefined) {
  if (logo_id) {
    return `/image/rpc/get_logo?id=${logo_id}`
  }
  return null
}

export function searchToEditOrganisation({item, account, position}:
  { item: SearchOrganisation, account?: string, position?: number }) {

  const addOrganisation: EditOrganisation = {
    ...item,
    logo_b64: null,
    logo_mime_type: null,
    logo_id: null,
    position
  }

  if (item.source === 'ROR') {
    // ROR item has no RSD id
    addOrganisation.id = null
    // cannot be created as tenant from this page/location
    addOrganisation.is_tenant = false
    // creator is assigned as primary maintainer
    if (account) {
      addOrganisation.primary_maintainer = account
      // it can be edited by this account
      addOrganisation.canEdit = true
      // slug is constructed
      addOrganisation.slug = getSlugFromString(item.name)
    }
  }

  if (item.source === 'RSD') {
    // validate if user can edit this item
    addOrganisation.canEdit = item.primary_maintainer === account
  }

  return addOrganisation
}

export function updateDataObjectAfterSave({data, id}:
  {data: EditOrganisation, id: string}) {
  // update local data
  if (id) data.id = id
  // if base64 image was present
  if (data.logo_b64) {
    // it is uploaded and uses id
    data.logo_id = id
    // remove image strings after upload
    data.logo_b64 = null
    data.logo_mime_type = null
  }
  return data
}