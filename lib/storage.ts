import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadListingImages(params: {
  uid: string;
  listingId: string;
  files: File[];
}): Promise<{ urls: string[]; paths: string[] }> {
  const { uid, listingId, files } = params;

  const uploads = await Promise.all(
    files.map(async (file, idx) => {
      const safeName = file.name.replace(/\s+/g, "-");
      const path = `listings/${uid}/${listingId}/${idx}-${safeName}`;
      const storageRef = ref(storage, path);

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      return { url, path };
    })
  );

  return {
    urls: uploads.map((u) => u.url),
    paths: uploads.map((u) => u.path),
  };
}