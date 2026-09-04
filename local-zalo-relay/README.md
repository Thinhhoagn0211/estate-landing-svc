# Local Zalo relay

This relay performs the Zalo token exchange and profile request from the Mac's
network, so Zalo sees the Vietnamese public IP instead of the Supabase Edge
Function IP. It listens only on `127.0.0.1`.

## One-time setup

1. Copy `.env.local.example` to `.env.local`.
2. Fill in `ZALO_APP_SECRET` from Zalo Developers.
3. Fill in `SUPABASE_SERVICE_ROLE_KEY` from Supabase Dashboard → Project Settings → API.
   Keep this file private; it is already ignored by git.

## Run for a test session

Terminal 1:

```bash
cd /Users/hoangbaothinh/Desktop/app-sell-mobile
node local-zalo-relay/server.mjs
```

Terminal 2:

```bash
ngrok http 8787
```

Copy the HTTPS forwarding URL, then temporarily change the `zalo-callback`
destination in `zalo-verify-site/vercel.json` to:

```text
https://YOUR-NGROK-DOMAIN.ngrok-free.app/zalo-callback
```

Deploy the Vercel proxy:

```bash
npx vercel --cwd zalo-verify-site --prod
```

The Zalo Developer callback remains:
`https://zalo-verify-site.vercel.app/zalo-callback`.

The Mac and ngrok process must stay running while connecting Zalo. Never commit
`.env.local` or paste the service-role key into chat.
