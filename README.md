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


## OpenFGA Model

The OpenFGA model used for this application looks similar to the Google Drive Example on the [OpenFGA Playground](https://openfga.dev/docs/getting-started/setup-openfga/playground), with some minor tweaks.

The application currently does not implement all functionality like share or edit, this might be added in the future.

```
model
  schema 1.1

type user

type file
  relations
    define can_delete: owner or owner from parent
    define can_share: owner or owner from parent
    define can_view: viewer or owner or viewer from parent
    define can_write: owner or owner from parent
    define is_owned: owner
    define is_shared: can_view but not owner
    define owner: [user]
    define parent: [folder]
    define viewer: [user, user:*]

type folder
  relations
    define can_create_file: owner or owner from parent
    define can_create_folder: owner or owner from parent
    define can_share: owner or owner from parent
    define can_view: viewer or owner or viewer from parent
    define owner: [user]
    define parent: [folder]
    define viewer: [user, user:*] or owner or viewer from parent
```