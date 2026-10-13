import type { Collection } from 'tinacms';

// Owner comments submitted through /.netlify/functions/submit-comment.
// New comments arrive as "Pending review". Set a comment to "Approved" to show
// it publicly under its decision; "Hidden" keeps it for the board's records only.
const Comment: Collection = {
  label: 'Owner Comments',
  name: 'comment',
  path: 'content/comments',
  format: 'json',
  ui: {
    allowedActions: { create: false },
  },
  fields: [
    {
      type: 'string',
      name: 'status',
      label: 'Status',
      options: [
        { label: 'Pending review', value: 'new' },
        { label: 'Approved (shown publicly)', value: 'approved' },
        { label: 'Hidden', value: 'hidden' },
      ],
    },
    {
      type: 'string',
      name: 'decisionTitle',
      label: 'Decision',
      isTitle: true,
      required: true,
    },
    {
      type: 'string',
      name: 'issueSlug',
      label: 'Issue',
      required: true,
    },
    {
      type: 'string',
      name: 'comment',
      label: 'Comment',
      ui: { component: 'textarea' },
    },
    {
      type: 'string',
      name: 'name',
      label: 'Name',
    },
    {
      type: 'string',
      name: 'unit',
      label: 'Unit',
    },
    {
      type: 'datetime',
      name: 'submittedAt',
      label: 'Submitted',
      ui: {
        dateFormat: 'MMMM DD YYYY',
        timeFormat: 'hh:mm A',
      },
    },
    {
      type: 'string',
      name: 'boardReply',
      label: 'Board reply (optional)',
      description: 'Shown under the comment once it is approved.',
      ui: { component: 'textarea' },
    },
  ],
};

export default Comment;
