import client from '@/tina/__generated__/client';
import type { ApprovedComment } from '@/components/newsletter/issue-sheet';

// Published issues, newest first.
export async function getPublishedIssues() {
  const nodes: any[] = [];
  let after: string | undefined;
  // Page through all issues (Tina returns 50 per page by default).
  for (let i = 0; i < 20; i++) {
    const res = await client.queries.newsletterConnection({ first: 50, after });
    const conn = res.data.newsletterConnection;
    nodes.push(...(conn.edges ?? []).map((e) => e?.node).filter(Boolean));
    if (!conn.pageInfo.hasNextPage) break;
    after = conn.pageInfo.endCursor;
  }
  return nodes
    .filter((node) => node.published)
    .sort((a, b) => new Date(b.issueDate ?? 0).getTime() - new Date(a.issueDate ?? 0).getTime());
}

// Comments an admin has approved for one issue, oldest first.
export async function getApprovedComments(issueSlug: string): Promise<ApprovedComment[]> {
  try {
    const res = await client.queries.commentConnection({
      first: 200,
      filter: { issueSlug: { eq: issueSlug }, status: { eq: 'approved' } },
    });
    return (res.data.commentConnection.edges ?? [])
      .map((e) => e?.node)
      .filter(Boolean)
      .map((n: any) => ({
        id: n.id,
        decisionTitle: n.decisionTitle,
        name: n.name,
        unit: n.unit,
        comment: n.comment,
        submittedAt: n.submittedAt,
        boardReply: n.boardReply,
      }))
      .sort((a, b) => new Date(a.submittedAt ?? 0).getTime() - new Date(b.submittedAt ?? 0).getTime());
  } catch (error) {
    // No comments yet (or the collection is empty): show the issue without them.
    console.error('[comments] could not load approved comments', error);
    return [];
  }
}
