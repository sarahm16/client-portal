import { heicTo } from "heic-to";

async function convertHeic(file) {
  let uploadFile = file;

  if (file.type === "image/heic" || file.name.endsWith(".heic")) {
    const blob = await heicTo({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9,
    });
    uploadFile = new File([blob], file.name.replace(/\.heic$/, ".jpg"), {
      type: "image/jpeg",
    });
  }

  return uploadFile;

  // Then upload uploadFile to Azure Blob Storage
}

export default convertHeic;
