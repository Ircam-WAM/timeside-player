export async function uploadFile(file: { file: string | Blob; status: string | boolean }, url: RequestInfo | URL) {
  // set up the request data
  let formData = new FormData()
  formData.append('file', file.file)

  // track status and upload file
  file.status = 'loading'
  let response = await fetch(url, { method: 'POST', body: formData })

  // change status to indicate the success of the upload request
  file.status = response.ok

  return response
}

export function uploadFiles(files: any[], url: RequestInfo | URL) {
  return Promise.all(files.map((file) => uploadFile(file, url)))
}

export default function createUploader(url: RequestInfo | URL) {
  return {
      uploadFile: function (file: { file: string | Blob; status: string | boolean; }) {
          return uploadFile(file, url)
      },
      uploadFiles: function (files: any[]) {
          return uploadFiles(files, url)
      },
  }
}