# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Environment & setup

1. Copy `env.example` to `.env` (or `.env.local`); values for the hosted project are already filled:
   - `VITE_SUPABASE_PROJECT_ID=oaoaihienaacnmavfase`
   - `VITE_SUPABASE_URL=https://oaoaihienaacnmavfase.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hb2FpaGllbmFhY25tYXZmYXNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1ODYxNjEsImV4cCI6MjA4MjE2MjE2MX0.EyZV4ONNFxAJ9DaZnl2uCp87CYZ8ZLMvZtPXsPTtQXo`
2. Supabase Edge Function `solboy-api` needs `SOLBOY_API_URL` set to your SolBoy backend (per API docs, current prod base is `https://my-project-production-3d70.up.railway.app`):
   ```sh
   supabase secrets set --project-ref oaoaihienaacnmavfase SOLBOY_API_URL=https://my-project-production-3d70.up.railway.app
   supabase functions deploy solboy-api --project-ref oaoaihienaacnmavfase
   ```
3. Install and run locally:
   ```sh
   npm install
   npm run dev
   ```

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
