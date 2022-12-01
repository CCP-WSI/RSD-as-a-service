// SPDX-FileCopyrightText: 2022 Christian Meeßen (GFZ) <christian.meessen@gfz-potsdam.de>
// SPDX-FileCopyrightText: 2022 Dusan Mijatovic (dv4all)
// SPDX-FileCopyrightText: 2022 Ewan Cahen (Netherlands eScience Center) <e.cahen@esciencecenter.nl>
// SPDX-FileCopyrightText: 2022 Helmholtz Centre Potsdam - GFZ German Research Centre for Geosciences
// SPDX-FileCopyrightText: 2022 Netherlands eScience Center
// SPDX-FileCopyrightText: 2022 dv4all
//
// SPDX-License-Identifier: Apache-2.0

import {softwareInformation as config} from '../editSoftwareConfig'
import EditSectionTitle from '~/components/layout/EditSectionTitle'
import ImageAsBackground from '~/components/layout/ImageAsBackground'
import {ChangeEvent} from 'react'
import {handleFileUpload} from '~/utils/handleFileUpload'
import {useSession} from '~/auth'
import useSnackbar from '~/components/snackbar/useSnackbar'
import {useFormContext} from 'react-hook-form'
import {EditSoftwareItem} from '~/types/SoftwareTypes'
import {deleteImage, getImageUrl, upsertImage} from '~/utils/editImage'
import {IconButton} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import {patchSoftwareTable} from './patchSoftwareTable'

export default function AutosaveSoftwareLogo() {
  const {token} = useSession()
  const {showWarningMessage, showErrorMessage} = useSnackbar()
  const {watch, setValue} = useFormContext<EditSoftwareItem>()

  const [
    form_id, form_image_id, form_image_b64, form_image_mime_type
  ] = watch([
    'id', 'image_id', 'image_b64', 'image_mime_type'
  ])

  function imageUrl() {
    if (form_image_b64 && form_image_b64.length > 10) {
      return form_image_b64
    }
    if (form_image_id && form_image_id.length > 10) {
      return getImageUrl(form_image_id)
    }
    return null
  }

  async function saveImage(image_b64: string, mime_type: string) {
    let resp
    // split base64 to use only encoded content
    const data = image_b64.split(',')[1]
    if (form_image_id) {
      const patch = await patchSoftwareTable({
        id: form_id,
        data: {
          image_id: null
        },
        token
      })
      if (patch.status === 200) {
        // try to remove old image
        // but don't wait for results
        const del = await deleteImage({
          id: form_image_id,
          token
        })
      }
    }
    // add new image to db
    resp = await upsertImage({
      data,
      mime_type,
      token
    })
    if (resp.status !== 201) {
      showErrorMessage(`Failed to save image. ${resp.message}`)
      return
    }
    const patch = await patchSoftwareTable({
      id:form_id,
      data: {
        image_id:resp.message
      },
      token
    })
    if (patch.status === 200) {
      // setValue works while resetField doesn't, not sure why?
      // setValue('image_b64', image_b64 as string)
      // setValue('image_mime_type', mime_type)
      // remove id for now
      setValue('image_id', resp.message)
      // debugger
    } else {
      showErrorMessage(`Failed to save image. ${resp.message}`)
    }
  }

  async function removeImage() {
    // remove image
    const resp = await patchSoftwareTable({
      id: form_id,
      data: {
        image_id: null,
      },
      token
    })
    if (resp.status === 200) {
      // clear all image values in the form
      if (form_image_b64) setValue('image_b64', null)
      if (form_image_mime_type) setValue('image_mime_type', null)
      if (form_image_id) {
        // try to remove old image
        // but don't wait for results
        const del = await deleteImage({
          id: form_image_id,
          token
        })
        setValue('image_id', null)
      }
    } else {
      showErrorMessage(`Failed to remove image. ${resp.message}`)
      return
    }
  }

  async function onFileUpload(e:ChangeEvent<HTMLInputElement>|undefined) {
    if (typeof e !== 'undefined') {
      const {status, message, image_b64, image_mime_type} = await handleFileUpload(e)
      if (status === 200 && image_b64 && image_mime_type) {
        saveImage(image_b64, image_mime_type)
      } else if (status===413) {
        showWarningMessage(message)
      } else {
        showErrorMessage(message)
      }
    }
  }

  function renderImageAttributes() {
    // debugger
    if (form_image_b64 === null && form_image_id === null) {
      return null
    }
    return (
      <>
        <div className="flex pt-4">
          <div className="flex items-center text-primary">
            <IconButton
              color="primary"
              aria-label="remove picture"
              component="span"
              title="Delete image"
              onClick={removeImage}
            >
              <DeleteIcon />
            </IconButton>
            Delete logo
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <EditSectionTitle
        title={config.logo.label}
        subtitle={config.logo.help}
      />
      <div>
        <label htmlFor='upload-avatar-image'
          style={{cursor: 'pointer'}}
          title="Click to upload a logo."
        >
          <ImageAsBackground
            src={imageUrl()}
            alt={'logo'}
            bgSize={'contain'}
            bgPosition={'center'}
            className="w-full h-[12rem]"
            noImgMsg="Click to upload a logo."
          />
        </label>

        <input
          id="upload-avatar-image"
          type="file"
          accept="image/*"
          onChange={onFileUpload}
          style={{display:'none'}}
        />

        {renderImageAttributes()}

      </div>
    </>
  )
}
