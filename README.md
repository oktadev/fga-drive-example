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

| Method | Endpoint | Description |
| ------ | -------- |------------ |
| GET    | `/api/files` | List all folders for the root folder, a query param `?parent=[folder]` is available to list files from a sub folder<br/><br/> - Query your database/datastore for all files for a folder<br/> -  Perform a batch check using the OpenFGA client to assert the user can view all of these files<br/> -  return the allowed files |
| POST   | `/api/files` | Upload a new file<br/><br/> - Check OpenFGA if the user can upload a new file<br/> - Upload the new file to the `/upload` folder<br/> - Write a new tupple to OpenFGA indicating the file is owned by the current user<br/> - Write a new tupple to OpenFGA indicating the the file has the current folder as it's parent |
| GET    | `/api/files/[file]` | View a file<br/> - Check OpenFGA if the current user can view the specific file<br/> - Return the file |
| POST   | `/api/files/[file]/share` | Share a file<br/><br/> - Check OpenFGA if the user can share the file<br/> - Check Auth0 if the email address belongs to a known user and use that user's subject<br/> - Write a new tupple to OpenFGA indicating the file has a new viewer, the previously looked-up user |
| GET    | `/api/files/shared` | Get all files shared with a user<br/><br/> - List all objects in OpenFGA that have the `is_shared` relationship<br/> - Get all these files from our database/datastore |
| GET    | `/api/folders` | List all folders for the root folder, a query param `?parent=[folder]` is parent available to list fodlers from a sub folder<br/><br/> - Check if we can view the parent folder in OpenFGA<br/> - Get all folders for it's parent from our database/datastore |
| POST   | `/api/folders` | Create a new folder<br/><br/> - Check if the user can create a new folder for it's parent in OpenFGA<br/> - Create the new folder in our database/datastore<br/> - Write a new tupple to OpenFGA indicating the new folder is owned by the current user<br/> - Write a new tupple to OpenFGA indicating the new folder has it's parent folder as parent |
| GET    | `/api/folders/[folder]` | Get a folder details<br/><br/> - Check OpenFGA if we can view a folder<br/> - Return the folder's details from our database/datastore |
| POST   | `/api/folders/[folder]/share`| Share a folder<br/><br/> - Check OpenFGA is we can share the folder<br/> - Check Auth0 if the email address belongs to a known user and use that user's subject<br/> - Write a new tupple to OpenFGA indicating the folder has a new viewer, the previously looked-up user |
