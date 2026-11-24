import ImageKit from "imagekit";

const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || "public_ctbf8v7sVuL67VLQHI9bRhOJo78=";
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "private_OJQw95kQz68TbzhDgz247lYXc6w=";
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/scjefmk1c";

var imagekit = new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint
});

export default imagekit;