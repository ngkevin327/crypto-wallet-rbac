# Wallet Team Permissions — User guide

## Getting started

1. Register and create an organization.
2. Connect your Gnosis Safe treasury under **Wallets**.
3. Review default role policies under **Policies**.
4. Invite team members under **Team**.

## Creating a transfer intent

1. Open **New transfer** from the sidebar.
2. Select wallet, recipient address, and USDC amount.
3. Review the policy preview badge (auto-approved vs needs approvals).
4. Submit — you are redirected to the intent detail page.

## Approvals

1. Open **Approvals** to see pending requests.
2. Approve or reject with an optional note.
3. When quorum is met, the intent moves to **ready to sign**.

## Signing with Safe

On the intent detail page, use **Sign with wallet** when status is `ready_to_sign`. The transaction is proposed to the Safe Transaction Service and tracked until executed on-chain.

## Audit log

**Audit** shows filtered events. Use **Export CSV** for compliance exports (sync for small ranges, async job for large exports).

## API keys (bots)

**Settings → API keys** lets org admins create bot keys scoped to a role. Keys are shown once at creation — store them securely.

## Temporary access

When assigning a role on a member, enable **Temporary access** and set start/end times for contractors.

## Help

In-app **Help & user guide** links to this document. For incidents, contact your organization admin.
