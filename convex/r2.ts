import { R2 } from "@convex-dev/r2";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";

export const r2 = new R2(components.r2);

const callbacks = {
  checkUpload: async () => {
    // Auth check handled at the app level
  },
  checkReadKey: async () => {},
  checkDelete: async () => {},
  onUpload: async () => {},
  onDelete: async () => {},
};

export const {
  generateUploadUrl,
  syncMetadata,
  getMetadata,
  deleteObject,
} = r2.clientApi<DataModel>(callbacks);
