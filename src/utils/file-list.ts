import { ref } from 'vue'

export default function () {
  const files = ref<any>([])

  function addFiles(newFiles: any) {
    let newUploadableFiles = [...newFiles].map((file) => new UploadableFile(file)).filter((file) => !fileExists(file.id))

    files.value = files.value?.concat(newUploadableFiles)
  }

  function fileExists(otherId: string) {
    return files.value.some((id: string) => id === otherId)
  }

  function removeFile(file: File) {
    if (files.value) {
      const index = files.value.indexOf(file)

      if (index > -1) files.value.splice(index, 1)
    }
  }

  return { files, addFiles, removeFile }
}

class UploadableFile {
  file: File
  id: string
  url: string
  status: null

  constructor(file: File) {
    this.file = file
    this.id = `${file.name}-${file.size}-${file.lastModified}-${file.type}`
    this.url = URL.createObjectURL(file)
    this.status = null
  }
}