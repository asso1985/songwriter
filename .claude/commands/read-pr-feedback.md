# read-pr-feedback

Read PR review comments and address feedback on the current story worktree branch.

## Prerequisites

You should be running inside the story's worktree (started with `claude -w`). If not, instruct the user to resume the worktree session first.

## PR Feedback Loop

1. Get the current branch: `git branch --show-current`
2. Fetch PR review comments: `gh pr view --comments`
3. Fetch the current diff: `gh pr diff`
4. Summarize each unresolved comment to the user
5. Address each unresolved comment:
   - Make the necessary code changes
   - Run tests to verify changes don't break anything
6. Stage and commit fixes with a message like: `fix: address PR review feedback`
7. Push additional commits to the same branch: `git push`
8. Output a summary of what was addressed
9. Suggest the user re-review the PR or run `/merge-story` if satisfied
