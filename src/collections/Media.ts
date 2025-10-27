import type { CollectionConfig } from "payload";

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import path from "path";
import { fileURLToPath } from "url";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const isProduction = process.env.NODE_ENV === "production";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    create: () => true,
    update: () => true,
    delete: () => true,
    read: () => true,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      localized: true,
      required: true,
    },
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
    staticDir:
      process.env.PAYLOAD_UPLOAD_STATIC_DIR || "/home/node/app/public/media",
    // @ts-ignore
    staticURL: process.env.PAYLOAD_UPLOAD_STATIC_URL || "/media",
    mimeTypes: ["image/*", "image/svg+xml", "application/xml"],
  },
};
