import React, { useState, useEffect } from "react"
import * as faceapi from "face-api.js"
import Dropzone from "react-dropzone"

const IndexPage = () => {
  const stateData = {
    isLoading: true,
    isRusum: false,
    isRojak: false,
    file: null,
  }

  const [state, setState] = useState(stateData)

  async function promises() {
    await Promise.all([
      faceapi.loadSsdMobilenetv1Model("./face_model/"),
      faceapi.loadFaceLandmarkModel("./face_model/"),
      faceapi.loadFaceRecognitionModel("./face_model/"),
    ])
    setState({ ...state, isLoading: false })
  }

  useEffect(() => {
    promises()
  })

  const checkFace = async file => {
    if (!file) {
      return
    }
    const rojak = await faceapi.fetchImage("./rojak.jpg")
    const rusum = await faceapi.fetchImage("./rusum.jpg")
    const upload = await faceapi.fetchImage(file)

    const rojakDescriptor = await faceapi.allFacesSsdMobilenetv1(rojak)
    const rusumDescriptor = await faceapi.allFacesSsdMobilenetv1(rusum)
    const uploadDescriptor = await faceapi.allFacesSsdMobilenetv1(upload)

    const rojakDistance = faceapi.round(
      faceapi.euclideanDistance(
        rojakDescriptor[0].descriptor,
        uploadDescriptor[0].descriptor
      )
    )
    const rusumDistance = faceapi.round(
      faceapi.euclideanDistance(
        rusumDescriptor[0].descriptor,
        uploadDescriptor[0].descriptor
      )
    )
    useState({
      isLoading: false,
      isRojak: rojakDistance < 0.6,
      isRusum: rusumDistance < 0.6,
      file: file,
    })
  }
  const { isLoading, isRojak, isRusum, file } = state
  console.log(state)
  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Dropzone
            onDrop={acceptedFiles => {
              const file = acceptedFiles[0]
              const reader = new FileReader()

              reader.onload = () => {
                const fileAsDataURL = reader.result
                checkFace(fileAsDataURL)
              }
              reader.readAsDataURL(file)
            }}
          >
            {({ getRootProps, getInputProps }) => {
              return (
                <section>
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <p>
                      Drag 'n' drop some files here, or click to select files
                    </p>
                  </div>
                </section>
              )
            }}
          </Dropzone>
          <h2>
            This is {isRojak ? "Rojak" : ""}
            {isRusum ? "Rusum" : ""}
            {!isRojak && !isRusum ? "Someone else" : ""}
          </h2>
          {file && (
            <img src={file} alt="uploaded image" style={{ width: "300px" }} />
          )}
        </>
      )}
    </div>
  )
}

export default IndexPage
