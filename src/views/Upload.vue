<template>
  <DropZone class="drop-area" @files-dropped="addFiles" #default="{ dropZoneActive }">
    <label for="file-input" class="file-input-label">
      <span v-if="dropZoneActive">
          <span>Drop your files here </span>
          <span class="smaller">to add them</span>
      </span>
      <span v-else>
        <span>Drag and drop your files here</span>
        <span class="smaller">
          or <strong><em>click</em></strong> to select files
        </span>
      </span>

      <input type="file" id="file-input" multiple @change="onInputChange" />
    </label>
    <ul class="image-list" v-show="files.length">
      <!-- <li v-for="file of files" :key="file.id">{{ file.file.name }}</li> -->
      <FilePreview v-for="file of files" :key="file.id" :file="file" tag="li" @remove="removeFile" />
    </ul>
    <button @click.prevent="uploadFiles(files)"  class="upload-button">Upload</button>
  </DropZone>
</template>

<script setup lang="ts">
// import { defineComponent } from 'vue'
import useFileList from '../utils/file-list'
import createUploader from '../utils/file-uploader'
import DropZone from '../components/DropZone.vue'
import FilePreview from '../components/FilePreview.vue'

// export default defineComponent({
//   name: 'UploadView'
//   // components: {
//   // }
// })
// components: { Image }

function onInputChange(e: any ) {
  addFiles(e.target.files)
  e.target.value = null
}

const { files, addFiles, removeFile } = useFileList()

const { uploadFiles } = createUploader('http://httpbin.org/')

</script>

<style lang="less" scoped>
#file-input {
  margin-top: 1rem;
}

.file-input-label {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.upload-button {
  margin-top: 1rem;
}

.drop-area {
	width: 100%;
	max-width: 800px;
	margin: 0 auto;
	padding: 50px;
  border-style: dashed;
	background: #ffffff55;
	box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
	transition: .2s ease;
	&[data-active=true] {
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
		background: #ffffffcc;
	}
}
label {
	font-size: 1rem;
	cursor: pointer;
	display: block;
	span {
		display: block;
	}
	input[type=file]:not(:focus-visible) {
		// Visually Hidden Styles taken from Bootstrap 5
		position: absolute !important;
		width: 1px !important;
		height: 1px !important;
		padding: 0 !important;
		margin: -1px !important;
		overflow: hidden !important;
		clip: rect(0, 0, 0, 0) !important;
		white-space: nowrap !important;
		border: 0 !important;
	}
	.smaller {
		font-size: 16px;
	}
}
.image-list {
	display: flex;
	list-style: none;
	flex-wrap: wrap;
	padding: 0;
}
.upload-button {
	display: block;
	appearance: none;
	border: 0;
	border-radius: 25px;
	padding: 0.75rem 3rem;
	margin: 1rem auto;
	font-size: 1rem;
	font-weight: bold;
	background: #369;
	color: #fff;
	text-transform: uppercase;
}
button {
	cursor: pointer;
}
</style>