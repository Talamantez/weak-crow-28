import { uploadImage } from "../services/uploadImage.ts";


const token =
  "ya29.a0AfB_byDbqbnDs_KV6VYt5YmM7bvgrR1V3oyXrYFMQmzzymQGe3P48q8T91xy6099uFPFpM3zJ3ThOqBwlQFIiLdi48xPw9ACsx-AGmrs5S0IQf1wV83LlJw5FnMJ28grZudL7rMaaPbqP7UHvqBdFC-7ZRmrKHdSm9tbaCgYKAZQSARISFQHGX2MiBrb-VBRsSIAZY3IvH3eXTg0171";
const bucket = "nami-resource-roadmap";

export const renderImages = (fileUrls) => {
  return (
    <div>
      {fileUrls && fileUrls.map((fileUrl) => (
        <div key={fileUrl.fileUrl}>
          <img src={fileUrl.fileUrl} />
          <button onClick={()=>uploadImage(bucket,token,fileUrl.fileUrl)}>Save</button>
        </div>
      ))}
    </div>
  )
}

