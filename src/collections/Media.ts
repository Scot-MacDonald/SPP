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
    staticDir: process.env.PAYLOAD_UPLOAD_STATIC_DIR, // Coolify persistent path
    mimeTypes: ["image/*", "image/svg+xml", "application/xml"],
  },

  hooks: {
    beforeChange: [
      async ({ data, originalDoc }) => {
        const fs = require("fs");
        const path = require("path");

        // Delete old file if updating
        if (originalDoc && originalDoc.filename) {
          const oldPath = path.join(
            process.env.PAYLOAD_UPLOAD_STATIC_DIR,
            originalDoc.filename
          );
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        // Rename new file to include timestamp to avoid browser caching
        if (data && data.filename) {
          const ext = data.filename.split(".").pop();
          const name = data.filename.replace(/\.[^/.]+$/, "");
          const timestamp = Date.now();
          const newFilename = `${name}-${timestamp}.${ext}`;

          const oldFilePath = path.join(
            process.env.PAYLOAD_UPLOAD_STATIC_DIR,
            data.filename
          );
          const newFilePath = path.join(
            process.env.PAYLOAD_UPLOAD_STATIC_DIR,
            newFilename
          );

          if (fs.existsSync(oldFilePath)) {
            fs.renameSync(oldFilePath, newFilePath);
          }

          data.filename = newFilename;
        }

        return data;
      },
    ],
  },
};
