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
    directory: path.resolve(process.cwd(), "public/media"),
    url: "/media",
    mimeTypes: ["image/*", "image/svg+xml", "application/xml"],
  } as any,
};
