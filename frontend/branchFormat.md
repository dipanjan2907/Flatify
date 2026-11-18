> **Purpose:** Keep frontend development organised, avoid conflicts, and make integration predictable.
>
> All frontend development should happen under the `frontend/*` branch namespace.

---

## 1. Branch Structure

| Branch | Purpose |
|---|---|
| `main` | Main project branch — stable, integrated code |
| `frontend/main` | Frontend integration branch |
| `frontend/feat-name` | Individual frontend feature branches |

### Example feature branches

- `frontend/login-page`
- `frontend/dashboard`
- `frontend/property-listing`
- `frontend/profile-page`
- `frontend/chat-ui`

---

## 2. Before You Start Working

Make sure you're on the frontend integration branch and have the latest changes:

```bash
git checkout frontend/main
git pull origin frontend/main
```

## 3. Create Your Feature Branch

Create a separate branch for the feature assigned to you.

For example, if you're working on the login page:

```bash
git checkout -b frontend/login-page
```

Use a short, descriptive branch name that clearly identifies your task.

**Naming convention:**

```text
frontend/<feature-name>
```

## 4. Work, Commit & Push

Once you've made changes, stage and commit them:

```bash
git add .
git commit -m "feat: implement login page"
```

Push your feature branch to GitHub:

```bash
git push -u origin frontend/login-page
```

For subsequent updates to the same branch, you can simply use:

```bash
git add .
git commit -m "your commit message"
git push
```

## 5. Create a Pull Request

Once your feature is complete and tested:

1. Open the Flatify repository on GitHub.
2. Create a Pull Request (PR).
3. Set the **base branch** to `frontend/main`.
4. Set the **compare branch** to your feature branch (e.g. `frontend/login-page`).
5. Add a short description of what you've implemented.

**Your feature branch must be merged into `frontend/main`, NOT directly into `main`.**

---

## ⚠️ Important Rules

- ❌ Don't push directly to `main`.
- ❌ Don't push directly to `frontend/main`.
- ✅ Always create a separate feature branch before starting work.
- ✅ Pull the latest `frontend/main` before creating a new feature branch.
- ✅ Keep commits meaningful and descriptive.
- ✅ Test your changes before creating a Pull Request.
- ✅ Resolve merge conflicts carefully; don't blindly overwrite someone else's work.
- ❌ Don't merge your feature branch directly into `main`.

---

## 6. How Integration Works

The overall workflow is:

```text
                  main
                    │
          ┌─────────┴─────────┐
          │                   │
     frontend/main        backend/main
          │                   │
     ┌────┼────┐         ┌────┼────┐
     │    │    │         │    │    │
    feat feat feat      feat feat feat
```

- Frontend team members merge their completed features into `frontend/main`.
- Backend development follows the same pattern under `backend/*`.
- Once the frontend and backend are ready for integration, their respective integration branches are merged into `main`.
- Final integration into `main` will be handled separately.

---

## 7. Quick Reference

| Task | Command |
|---|---|
| Switch to frontend integration | `git checkout frontend/main` |
| Update integration branch | `git pull origin frontend/main` |
| Create a feature branch | `git checkout -b frontend/feat-name` |
| Stage changes | `git add .` |
| Commit changes | `git commit -m "feat: description"` |
| First push | `git push -u origin frontend/feat-name` |
| Subsequent push | `git push` |

---

### The Golden Rule

> **Work on your own feature branch → Open a PR into `frontend/main` → Let the integration branch handle the rest.**
