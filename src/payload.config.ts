import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { payloadCloudPlugin } from "@payloadcms/payload-cloud";
import { formBuilderPlugin } from "@payloadcms/plugin-form-builder";
import { nestedDocsPlugin } from "@payloadcms/plugin-nested-docs";
import { redirectsPlugin } from "@payloadcms/plugin-redirects";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { searchPlugin } from "@payloadcms/plugin-search";
import {
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  ItalicFeature,
  LinkFeature,
  lexicalEditor,
  UnderlineFeature,
} from "@payloadcms/richtext-lexical";
import { TextColorFeature } from "payload-lexical-typography";
import sharp from "sharp";
import path from "path";
import { buildConfig, Field } from "payload"; // ✅ import Field for type casting
import { fileURLToPath } from "url";

import Categories from "./collections/Categories";
import { Media } from "./collections/Media";
import { Pages } from "./collections/Pages";
import { Posts } from "./collections/Posts";
import { Doctors } from "./collections/Doctors";
import Users from "./collections/Users";

import { Footer } from "./globals/Footer/config";
import { Header } from "./globals/Header/config";
import { revalidateRedirects } from "./hooks/revalidateRedirects";
import { GenerateTitle, GenerateURL } from "@payloadcms/plugin-seo/types";
import { Page, Post } from "src/payload-types";

import { searchFields } from "@/search/fieldOverrides";
import { beforeSyncWithSearch } from "@/search/beforeSync";
import localization from "./i18n/localization";
import { en } from "@payloadcms/translations/languages/en";
import { de } from "@payloadcms/translations/languages/de";

import { resendAdapter } from "@payloadcms/email-resend";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title
    ? `${doc.title} | Payload Website Template`
    : "Payload Website Template";
};

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
  return doc?.slug
    ? `${process.env.NEXT_PUBLIC_SERVER_URL!}/${doc.slug}`
    : process.env.NEXT_PUBLIC_SERVER_URL!;
};

export default buildConfig({
  i18n: { supportedLanguages: { en, de } },
  admin: {
    importMap: { baseDir: path.resolve(dirname) },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        { label: "Mobile", name: "mobile", width: 375, height: 667 },
        { label: "Tablet", name: "tablet", width: 768, height: 1024 },
        { label: "Desktop", name: "desktop", width: 1440, height: 900 },
      ],
    },
  },
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      TextColorFeature({
        colors: [
          "#000000",
          "#FFFFFF",
          "#FF0000",
          "#00FF00",
          "#0000FF",
          "#7eb36a",
        ],
      }),
    ],
  }),
  db: mongooseAdapter({ url: process.env.DATABASE_URI || "" }),
  collections: [Pages, Posts, Doctors, Media, Categories, Users],
  cors: [process.env.PAYLOAD_PUBLIC_SERVER_URL || ""].filter(Boolean),
  csrf: [process.env.PAYLOAD_PUBLIC_SERVER_URL || ""].filter(Boolean),
  globals: [Header, Footer],
  plugins: [
    redirectsPlugin({
      collections: ["pages", "posts", "doctors"],
      overrides: {
        fields: ({ defaultFields }) =>
          defaultFields.map((field) => {
            if ("name" in field && "type" in field && field.name === "from") {
              return {
                ...field,
                admin: {
                  ...field.admin,
                  description:
                    "You will need to rebuild the website when changing this field.",
                },
              } as Field; // ✅ cast to Field
            }
            return field;
          }) as Field[], // ✅ cast the array to Field[]
        hooks: { afterChange: [revalidateRedirects] },
      },
    }),
    nestedDocsPlugin({ collections: ["categories"] }),
    seoPlugin({
      generateTitle,
      generateURL,
      fields: ({ defaultFields }) => [
        ...defaultFields,
        {
          name: "keywords",
          label: "Meta Keywords",
          type: "text",
          admin: { description: "Comma-separated keywords for SEO purposes" },
        },
      ],
    }),
    formBuilderPlugin({
      fields: { payment: false },
      formOverrides: {
        fields: ({ defaultFields }) =>
          defaultFields.map((field) => {
            if ("name" in field && field.name === "confirmationMessage") {
              return {
                ...field,
                editor: lexicalEditor({
                  features: ({ rootFeatures }) => [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({
                      enabledHeadingSizes: ["h1", "h2", "h3", "h4"],
                    }),
                  ],
                }),
              };
            }
            return field;
          }),
      },
    }),
    searchPlugin({
      collections: ["posts", "doctors"],
      beforeSync: beforeSyncWithSearch,
      searchOverrides: {
        fields: ({ defaultFields }) => [...defaultFields, ...searchFields],
      },
    }),
    payloadCloudPlugin(),
  ],
  localization,
  email: resendAdapter({
    defaultFromAddress:
      process.env.DEFAULT_FROM_ADDRESS || "dev@payloadcms.com",
    defaultFromName: process.env.DEFAULT_FROM_NAME || "Payload CMS",
    apiKey: process.env.RESEND_API_KEY || "",
  }),
  secret: process.env.PAYLOAD_SECRET!,
  sharp,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
});
