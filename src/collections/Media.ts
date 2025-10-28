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
    // Use afterChange instead of beforeChange to avoid breaking uploads
    afterChange: [
      async ({ doc, req, operation }) => {
        const fs = require("fs");
        const path = require("path");

        if (!doc?.filename) return;

        const uploadsDir = process.env.PAYLOAD_UPLOAD_STATIC_DIR;
        const originalFile = path.join(uploadsDir, doc.filename);

        // Append timestamp to filename
        const ext = doc.filename.split(".").pop();
        const name = doc.filename.replace(/\.[^/.]+$/, "");
        const timestamp = Date.now();
        const newFilename = `${name}-${timestamp}.${ext}`;
        const newFilePath = path.join(uploadsDir, newFilename);

        // Rename the file
        if (fs.existsSync(originalFile)) {
          fs.renameSync(originalFile, newFilePath);

          // Update the document with the new filename
          await req.payload.update({
            collection: "media",
            id: doc.id,
            data: { filename: newFilename },
            req,
          });
        }
      },
    ],
  },
};
