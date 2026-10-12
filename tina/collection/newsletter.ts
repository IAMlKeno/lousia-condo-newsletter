import type { Collection } from 'tinacms';

const Newsletter: Collection = {
  label: 'Newsletters',
  name: 'newsletter',
  path: 'content/newsletters',
  format: 'mdx',
  ui: {
    router: ({ document }) => `/issues/${document._sys.breadcrumbs.join('/')}`,
  },
  fields: [
    {
      type: 'string',
      name: 'title',
      label: 'Headline',
      isTitle: true,
      required: true,
    },
    {
      type: 'datetime',
      name: 'issueDate',
      label: 'Issue Date',
      required: true,
      ui: {
        dateFormat: 'MMMM DD YYYY',
        timeFormat: 'hh:mm A',
      },
    },
    {
      type: 'boolean',
      name: 'published',
      label: 'Published',
      description: 'Unpublished issues are hidden from the public site.',
    },
    {
      type: 'boolean',
      name: 'sendEmail',
      label: 'Email to owners on publish',
      description:
        'When checked, the next publish emails this issue to confirmed subscribers. Each issue is only emailed once.',
    },
    {
      type: 'string',
      name: 'summary',
      label: 'Summary',
      description: 'A short lead paragraph shown at the top of the issue and on the issues list.',
      ui: {
        component: 'textarea',
      },
    },
    {
      type: 'object',
      name: 'updates',
      label: 'Board Updates',
      list: true,
      ui: {
        itemProps: (item) => ({ label: item?.headline }),
      },
      fields: [
        {
          type: 'string',
          name: 'headline',
          label: 'Headline',
          required: true,
        },
        {
          type: 'rich-text',
          name: 'body',
          label: 'Body',
        },
      ],
    },
    {
      type: 'object',
      name: 'decisions',
      label: 'Decisions Needing Owner Feedback',
      list: true,
      ui: {
        itemProps: (item) => ({ label: item?.title }),
      },
      fields: [
        {
          type: 'string',
          name: 'title',
          label: 'Decision',
          required: true,
        },
        {
          type: 'datetime',
          name: 'deadline',
          label: 'Feedback Deadline',
          ui: {
            dateFormat: 'MMMM DD YYYY',
            timeFormat: 'hh:mm A',
          },
        },
        {
          type: 'rich-text',
          name: 'body',
          label: 'Details',
        },
        {
          type: 'boolean',
          name: 'commentsEnabled',
          label: 'Accept owner comments',
          description: 'Comments are limited to 300 words.',
        },
      ],
    },
    {
      type: 'rich-text',
      name: '_body',
      label: 'Additional Notes',
      isBody: true,
    },
  ],
};

export default Newsletter;
