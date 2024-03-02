const token = 'ya29.a0AfB_byDVV_sHcYV3qMV_fOnEHnqATQPkKjfBR94ylGzXdMkIq6LYG7vqw-1f_kumG0quJEvT7QuTzruzXIprOj9SrZqA4jyMXh-oQVsQGPveu9vQq1fl8s7iUiLG7CXx9jRjkX7Zv5RdhY5uLIEnWeTDeXtiPQn-p2guaCgYKAbkSARISFQHGX2MiGml5pIQbqU3gv8NIgdvpiA0171';
const bucket = 'nami-resource-roadmap';

const file = await Deno.readFile('./sample.txt');

const res = await fetch(`https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=media&name=sample.txt`, {
    headers: {
        'Content-Type': 'text/plain',
        Authorization: `Bearer ${token}`
    },
    method: 'POST',
    body: file
})

const data = await res.json();
console.log(data);