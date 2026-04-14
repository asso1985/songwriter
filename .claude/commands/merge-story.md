# merge-story

Merge the current story PR and clean up the worktree.

## Steps

1. Get the current branch: `git branch --show-current`
2. Find the open PR for this branch: `gh pr view`
3. Check PR status and reviews: `gh pr checks` — abort if checks are failing
4. Merge: `gh pr merge --squash --delete-branch`
5. Exit the worktree: use the ExitWorktree tool with `action: "remove"` to clean up the worktree and return to the main working directory
6. Pull latest main: `git pull`
7. Output confirmation with the merge commit SHA
