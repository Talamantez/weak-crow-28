import { UploadImage } from "../UploadImage.ts"

const token =
  "ya29.a0AfB_byDPGnh-Qr04DRE0lH4VDvkQpXMj0wOvMw0vjtBsWCcxhRDJLUiqwibAxIIK7KNggKwLaNnTU2E0lLV4vbCiqs-te1OwjeMB69Uo1NCFKO8eDFu7OQ71Ny0u5fJ1ttK9cS9QS7sHklY_Foz-lOImaniivX3klBx6aCgYKAQwSARISFQHGX2MifwvXp0o278A1YyPazNY6FQ0171";
const bucket = "nami-resource-roadmap";

export const renderImages = (fileUrls) => {
  console.log(fileUrls)
  return (
    <div>
      {fileUrls && fileUrls.map((fileUrl) => (
        <div key={fileUrl.fileUrl}>
          <img src={fileUrl.fileUrl} />
          <button onClick={UploadImage(bucket,token,fileUrl.fileUrl)}>Save</button>
        </div>
      ))}
    </div>
  )
}

