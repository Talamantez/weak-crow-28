export async function uploadImage(
  bucketName: string,
  authToken: string,
  fileUrl: string
) {
  const file = await Deno.readFile(`${fileUrl}`);

  const res = await fetch(
    `https://storage.googleapis.com/upload/storage/v1/b/${bucketName}/o?uploadType=media&name=Jeff`,
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
  console.log(`data: ${data}`);
  return data;
};