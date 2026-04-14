## Story Git Discipline

- All story work happens in Claude Code worktrees (`claude -w feat/<story-id>-*`)
- Worktrees provide isolated copies of the repo — main stays clean throughout development
- PRs are opened via `gh pr create` before a story is marked Done
- Merges only happen via `/merge-story` command after human approval, which also cleans up the worktree
- Never push directly to `main`
