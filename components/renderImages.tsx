export const renderImages = (fileUrls) => {
  console.log(`From renderImages.tsx. File Urls:`);
  console.dir(fileUrls)
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

