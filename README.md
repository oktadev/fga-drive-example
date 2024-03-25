This is a simple Google Drive clone to demonstrate how to use [OpenFGA](https://openfga.dev) or [OktaFGA](https://fga.dev) to handle Fine Grained Authorization on a per-resource level. 

A user can login, add files (pictures only), create folders and they should be only visible to them. They can choose to either share a file directly with other users or share folders (or subfolders), and all files contained within these will be shared automatically.

This demo uses both Auth0 ([create a free account here](https://auth0.com)), and either [OpenFGA](https://openfga.dev) or it's hosted and managed version [OktaFGA](https://fga.dev).

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

## API Endpoints

| Method | Endpoint                      | Description                                                                                                                  |
| ------ | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/files`                  | List all folders for the root folder, a query param `?parent=[folder]` is available to list files from a sub folder          |
| POST   | `/api/files`                  | Upload a new file                                                                                                            |
| GET    | `/api/files/[file]`           | View a file                                                                                                                  |
| POST   | `/api/files/[file]/share`     | Share a file                                                                                                                 |
| GET    | `/api/files/shared`           | Get all files shared with a user                                                                                             |
| GET    | `/api/folders`                | List all folders for the root folder, a query param `?parent=[folder]` is parent available to list fodlers from a sub folder |
| POST   | `/api/folders`                | Create a new folder                                                                                                          |
| GET    | `/api/folders/[folder]`       | Get a folder details                                                                                                         |
| POST   | `/api/folders/[folder]/share` | Share a folder                                                                                                               |
