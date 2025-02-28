# FEM Viewer Client

This package contains the frontend application for the FEM Viewer.

## Development

```bash
# Install dependencies
yarn install

# Start development server
yarn start:dev

# Build for production
yarn build
```

## Project Structure

- `public/` - Static assets and HTML template
- `src/` - Source code for the client application
  - `components/` - React components
  - `state/` - State management
  - `utility/` - Utility functions

---

# User manual

## Register page

To start using the application an account has to be registered. It can be done by entering the desired username and a password twice for confirmation. Clicking the register button creates a new account, logs you in automatically and redirects to the dashboard.

![image](https://user-images.githubusercontent.com/55451470/167417888-3401726f-4b07-47ba-a57a-13fe61245f68.png)

## Login page

To log in you have to enter your username and password and click the login button, which redirects you to your dashboard.

![image](https://user-images.githubusercontent.com/55451470/167418613-cba88518-ccc8-425c-82cd-1e71539a16e7.png)


## Uploading models

To upload a model, navigate to the upload page from your dashboard by clicking the upload button in the header.

![image](https://user-images.githubusercontent.com/55451470/167418813-0a4926b2-e81f-4e8c-95a8-ddf033c3bd3d.png)

Once on the upload page, enter a desired name for the model group you wish to upload. After that, choose the FEM toolkit XML export for the models you wish to upload. Next choose the FEM toolkit SVG exports for the same models. Click the upload button to finalize the process. On success a popup is displayed, saying that the model was successfully uploaded. You can continue uploading or choose to navigate back to your dashboard clicking the button in the header.

**Important:** The uploaded svg files must have the same name as the models they are exporting.

![image](https://user-images.githubusercontent.com/55451470/167419131-dbd9b8b2-646b-46af-b343-e6397c81e54a.png)

## Sharing model groups

In your dashboard, you can choose to share models you have uploaded with other users.

![image](https://user-images.githubusercontent.com/55451470/167419775-005b2d0c-9314-4792-b124-b6e652b29388.png)

To share a model enter the username of the user you wish to share the model with and click share.

![image](https://user-images.githubusercontent.com/55451470/167419940-e4f2dd77-de51-4430-853e-5cc06fbc1925.png)

## Viewing models

To view a model click the eye-shaped icon to the left of a listed model.

![image](https://user-images.githubusercontent.com/55451470/167420254-a9116082-49e9-4f35-ad53-f16b39b4bd48.png)

### Selecting models

When in the viewer, click on the names of models to switch which one is displayed on the right.

![image](https://user-images.githubusercontent.com/55451470/167420526-41980a4d-87e3-4201-8b2d-248960e2f2d5.png)

### Zoom

The models zoom can be adjusted using the slider in the header.

![image](https://user-images.githubusercontent.com/55451470/167420715-aef98a3e-035e-49ae-b413-77070de3cf7f.png)

### Model element details

Elements in the models can be clicked to highlight them, and provide extra details.
Original instances can have a list of all occurrences where they have been referenced. These references are listed with each having an arrow icon that can be clicked to navigate to the model and instance that references the original.

![image](https://user-images.githubusercontent.com/55451470/167420913-ee4b3f25-036e-416a-bb7a-e41635e6b7f5.png)

Elements that reference other elements provide navigation back to the originals in their details popup.

![image](https://user-images.githubusercontent.com/55451470/167421292-d403e2aa-450f-49a5-9399-46ef815debe5.png)

## Deleting model groups

To delete a model group simply click the delete button on the lower left. Be careful, as this deletes the model from everyone that it has been shared with as well.

![image](https://user-images.githubusercontent.com/55451470/167421800-c2496f48-6dcc-4433-b7e7-2d3c657098a7.png)






