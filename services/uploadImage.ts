export async function uploadImage(
  bucketName: string,
  authToken: string,
  fileUrl: string
) {
  const file = await Deno.readFile(`${fileUrl}`);
  const fileSplit = fileUrl.split('/');
  const fileName = fileSplit[fileSplit.length]

  const res = await fetch(
    `https://storage.googleapis.com/upload/storage/v1/b/${bucketName}/o?uploadType=media&name=${fileName}`,
    {
      headers: {
        "Content-Type": "text/plain",
        Authorization: `Bearer ${authToken}`,
      },
      method: "POST",
      body: file,
    },
  );

  const data = await res.json();
  console.dir(data);
};