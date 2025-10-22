import type { CollectionConfig } from "payload";
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import path from "path";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    create: () => true,
    update: () => true,
    delete: () => true,
    read: () => true,
  },
  fields: [
    { name: "alt", type: "text", localized: true, required: true },
    {
      name: "caption",
      type: "richText",
      localized: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
  ],
  upload: {
    directory: path.resolve(process.cwd(), "media"), // 🔹 Store in persistent directory
    url: "/media", // 🔹 Public URL
    mimeTypes: ["image/*", "image/svg+xml", "application/pdf"], // Restrict mime types
  } as any,
};
