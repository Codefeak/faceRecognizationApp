import React from "react"
import * as faceapi from "face-api.js"
import Dropzone from "react-dropzone"

class IndexPage extends React.Component {
  state = {
    isLoading: true,
    isRusum: false,
    isRojak: false,
    file: null,
  }

  async componentDidMount() {
    await Promise.all([
      faceapi.loadSsdMobilenetv1Model("./face_model/"),
      faceapi.loadFaceLandmarkModel("./face_model/"),
      faceapi.loadFaceRecognitionModel("./face_model/"),
    ])
    this.setState({
      isLoading: false,
    })
  }

  async checkFace(file) {
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
    this.setState({
      isLoading: false,
      isRojak: rojakDistance < 0.6,
      isRusum: rusumDistance < 0.6,
      file: file,
    })
  }

  render() {
    return (
      <div>
        {this.state.isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            <Dropzone
              onDrop={acceptedFiles => {
                const file = acceptedFiles[0]
                const reader = new FileReader()

                reader.onload = () => {
                  const fileAsDataURL = reader.result
                  this.checkFace(fileAsDataURL)
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
              This is {this.state.isRojak ? "Rojak" : ""}
              {this.state.isRusum ? "Rusum" : ""}
              {!this.state.isRojak && !this.state.isRusum ? "Someone else" : ""}
            </h2>
            {this.state.file && (
              <img
                src={this.state.file}
                alt="uploaded image"
                style={{ width: "300px" }}
              />
            )}
          </>
        )}
      </div>
    )
  }
}

export default IndexPage
