import Property from "../models/Property.js";
import type { IPropertyImage } from "../models/Property.js";

import getImageKit from "../config/imagekit.js";

export const verifyImageOwnership = (
  images: IPropertyImage[],
  userId: string,
): boolean => {
  const expectedFolder = `/flatify/properties/${userId}/`;

  return images.every(
    (image) =>
      image.filePath.startsWith(expectedFolder) &&
      image.url.startsWith("https://"),
  );
};

export const deleteUnusedImages = async (
  images: IPropertyImage[],
  excludedPropertyId?: string,
): Promise<void> => {
  const imagekit = getImageKit();

  for (const image of images) {
    const query: Record<string, unknown> = {
      "images.fileId": image.fileId,
    };

    if (excludedPropertyId) {
      query._id = { $ne: excludedPropertyId };
    }

    const stillUsed = await Property.exists(query);

    if (!stillUsed) {
      try {
        await imagekit.files.delete(image.fileId);
      } catch (error) {
        console.error(`Failed to delete ImageKit file ${image.fileId}:`, error);
      }
    }
  }
};
