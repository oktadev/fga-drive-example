## Getting Started

| Copy | the `.env.sample` file to `.env.local`, and fill in the missing environment variables

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
| GET    | `/api/folders`                | List all folders for the root folder, a query param `?parent=[folder]` is parent available to list fodlers from a sub folder |
| POST   | `/api/folders`                | Create a new folder                                                                                                          |
| GET    | `/api/folders/[folder]`       | Get a folder details                                                                                                         |
| POST   | `/api/folders/[folder]/share` | Share a folder                                                                                                               |
