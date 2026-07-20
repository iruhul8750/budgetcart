import { defineConfig } from '@keystatic/core';

export default defineConfig({
  collections: {
    // Define a simple collection for demonstration purposes.
    // Replace or extend this with your actual content types.
    posts: {
      label: 'Posts',
      slugField: 'title',
      schema: {
        title: {
          type: 'string',
          label: 'Title',
          validation: { length: { min: 1 } },
        },
        body: {
          type: 'markdown',
          label: 'Body',
        },
      },
    },
  },
});
