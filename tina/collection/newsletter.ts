import type { Collection } from 'tinacms';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

const Newsletter: Collection = {
  label: 'Newsletters',
  name: 'newsletter',
  path: 'content/newsletters',
  format: 'mdx',
  defaultItem: () => ({
    issueDate: new Date().toISOString(),
    published: false,
    sendEmail: false,
  }),
  ui: {
    router: ({ document }) => `/issues/${document._sys.breadcrumbs.join('/')}`,
    filename: {
      // File names become the issue URL, e.g. /issues/2026-10-fall-update
      slugify: (values) => {
        const date = values?.issueDate ? new Date(values.issueDate) : new Date();
        const prefix = isNaN(date.getTime()) ? '' : `${date.toISOString().slice(0, 7)}-`;
        return `${prefix}${slugify(values?.title || 'issue')}`;
      },
    },
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
      type: 'string',
      name: 'summary',
      label: 'Lead paragraph',
      description: 'One or two sentences shown under the headline, on the archive page and in the email.',
      ui: { component: 'textarea' },
    },
    {
      type: 'datetime',
      name: 'issueDate',
      label: 'Issue date',
      required: true,
      ui: { dateFormat: 'MMMM DD YYYY' },
    },
    {
      type: 'string',
      name: 'edition',
      label: 'Edition label',
      description: 'Optional, shown in the masthead. For example "Vol. 1 · No. 4" or "Fall 2026".',
    },
    {
      type: 'datetime',
      name: 'meetingDate',
      label: 'Board meeting date',
      description: 'The board meeting this issue reports on.',
      ui: { dateFormat: 'MMMM DD YYYY' },
    },
    {
      type: 'boolean',
      name: 'published',
      label: 'Published',
      description: 'Unpublished issues are hidden from the public site. Leave this off while drafting.',
    },
    {
      type: 'boolean',
      name: 'sendEmail',
      label: 'Email this issue to subscribers',
      description:
        'When this and "Published" are both on, the issue is emailed to confirmed subscribers on the next deploy. Each issue is only emailed once.',
    },
    {
      type: 'image',
      name: 'image',
      label: 'Front-page photo',
      description: 'Optional. A landscape photo works best.',
    },
    {
      type: 'string',
      name: 'imageCaption',
      label: 'Photo caption',
    },
    {
      type: 'object',
      name: 'updates',
      label: 'Board updates',
      list: true,
      ui: {
        itemProps: (item) => ({ label: item?.headline }),
      },
      fields: [
        {
          type: 'string',
          name: 'category',
          label: 'Category',
          description: 'A short label above the headline, e.g. Maintenance, Finance, Building.',
        },
        {
          type: 'string',
          name: 'headline',
          label: 'Headline',
          required: true,
        },
        {
          type: 'rich-text',
          name: 'body',
          label: 'Story',
        },
      ],
    },
    {
      type: 'object',
      name: 'decisions',
      label: 'Owner input needed',
      list: true,
      ui: {
        itemProps: (item) => ({ label: item?.title }),
        defaultItem: { commentsEnabled: true, wordLimit: 300 },
      },
      fields: [
        {
          type: 'string',
          name: 'title',
          label: 'Question or decision',
          required: true,
        },
        {
          type: 'datetime',
          name: 'deadline',
          label: 'Feedback deadline',
          description: 'Comments close automatically after this date.',
          ui: { dateFormat: 'MMMM DD YYYY' },
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
          description: 'Shows a comment form. Comments appear publicly only after an admin approves them under "Owner Comments".',
        },
        {
          type: 'number',
          name: 'wordLimit',
          label: 'Comment word limit',
          description: 'Maximum words per comment. Defaults to 300.',
        },
      ],
    },
    {
      type: 'object',
      name: 'dates',
      label: 'Upcoming dates',
      list: true,
      ui: {
        itemProps: (item) => ({ label: item?.label }),
      },
      fields: [
        { type: 'datetime', name: 'date', label: 'Date', ui: { dateFormat: 'MMMM DD YYYY' } },
        { type: 'string', name: 'label', label: 'What is happening', required: true },
      ],
    },
    {
      type: 'rich-text',
      name: '_body',
      label: 'Closing notes',
      isBody: true,
    },
  ],
};

export default Newsletter;
