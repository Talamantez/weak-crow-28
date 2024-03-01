export const renderImages = (fileUrls) => {
  console.log(fileUrls)
  return (
    <div>
      {fileUrls && fileUrls.map((fileUrl) => (
        <div key={fileUrl.fileUrl}>
          <img src={fileUrl.fileUrl} />
        </div>
      ))}
    </div>
  )
}

