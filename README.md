This is a simple Google Drive clone to demonstrate how to use [OpenFGA](https://openfga.dev) or [OktaFGA](https://fga.dev) to handle Fine Grained Authorization on a per-resource level.

A user can login, add files (pictures only), create folders and they should be only visible to them. They can choose to either share a file directly with other users or share folders (or subfolders), and all files contained within these will be shared automatically.

This demo uses both Auth0 ([create a free account here](https://auth0.com)), and either [OpenFGA](https://openfga.dev) or it's hosted and managed version [OktaFGA](https://fga.dev).

The data is stored in a [Vercel KV store](https://vercel.com/docs/storage/vercel-kv).

![A preview of the demo application showing a Google Drive Style interface](./preview.png)

## Getting Started

Copy the `.env.sample` file to `.env.local`, and fill in the missing environment variables

```bash
cp .env.sample .env.local
```

Install the npm dependencies

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
