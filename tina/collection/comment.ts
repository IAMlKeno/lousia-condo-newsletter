import type { Collection } from 'tinacms';

// Owner comments submitted through /.netlify/functions/submit-comment.
// They are not shown on the public site; admins review them here.
const Comment: Collection = {
  label: 'Owner Comments',
  name: 'comment',
  path: 'content/comments',
  format: 'json',
  fields: [
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
      label: 'Name (optional)',
    },
    {
      type: 'string',
      name: 'unit',
      label: 'Unit (optional)',
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
      name: 'status',
      label: 'Status',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Reviewed', value: 'reviewed' },
        { label: 'Resolved', value: 'resolved' },
      ],
    },
  ],
};

export default Comment;
