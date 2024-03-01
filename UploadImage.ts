const token =
  "ya29.a0AfB_byDPGnh-Qr04DRE0lH4VDvkQpXMj0wOvMw0vjtBsWCcxhRDJLUiqwibAxIIK7KNggKwLaNnTU2E0lLV4vbCiqs-te1OwjeMB69Uo1NCFKO8eDFu7OQ71Ny0u5fJ1ttK9cS9QS7sHklY_Foz-lOImaniivX3klBx6aCgYKAQwSARISFQHGX2MifwvXp0o278A1YyPazNY6FQ0171";
const bucket = "nami-resource-roadmap";
const fileUrl = "./sample.txt"

export const UploadImage = async function () {
  // const file = await Deno.readFile(`${fileUrl}`);
  // const fileSplit = fileUrl.split('/');
  // const fileName = fileSplit[fileSplit.length]
  // const fileName = "sample.txt"

  // const res = await fetch(
  //   `https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=media&name=${fileName}`,
  //   {
  //     headers: {
  //       "Content-Type": "text/plain",
  //       Authorization: `Bearer ${token}`,
  //     },
  //     method: "POST",
  //     body: file,
  //   },
  // );

  // const data = await res.json();
  // console.dir(data);
  console.log('alive')
};
