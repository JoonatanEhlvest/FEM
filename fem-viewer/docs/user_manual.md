# User manual

## Login page

To log in you have to enter your username and password and click the login button, which redirects you to your dashboard.

![image](https://github.com/user-attachments/assets/ef73c252-e0b1-44e6-8eec-3d7283968064)

The initial user has to be created on the server:

```console
$ cd packages/server && yarn user:create -u [username] -p [password] -r ADMIN
```

Additional users can be created one you log in with an ADMIN or DEVELOPER user.

## Creating new users
![image](https://github.com/user-attachments/assets/cc0df09e-6155-47b8-966c-3c31023273dd)


To create a new user, click on the Create user button on the top of the dashboard page. Enter a username and password and select an appropriate role for the user. Each role with higher privileges also has the premissions of the roles with the lower privileges.

-   Viwer: Can view models shared with them.
-   Expert: Can edit models shared to them.
-   Developer: Can upload models and share them with other users. Can create users with the Viewer role. Can change their password and passwords of created users.
-   Admin: Can create users with any role.

![image](https://github.com/user-attachments/assets/1b8a4260-3ff9-474a-b7c9-ea50ff363643)

## Deleting users

You can delete users you have created from the dashboard by clicking the Delete button for the user you want to delete.
![image](https://github.com/user-attachments/assets/323de11d-cbe6-4d45-b283-b53c0f36029e)

## Changing passwords
### Created users
You can change the password of users you have created from the dashboard by clicking the Change Password button for that user. This will open a change password popup where you can enter a new password.
![image](https://github.com/user-attachments/assets/1e41f001-55f2-4f98-8f8d-5f9f457119ea)
### Your user
To change your own password, you need to have either the Developer or Admin role. Click the Change Password button at the top of the dashboard. This will take you to a new route where you can enter a new password. Click the Create button to save the new password.
![image](https://github.com/user-attachments/assets/30f7d6fa-2c3e-4f4e-950f-5edda18b86e6)


## Uploading models

To upload a model, navigate to the upload page from your dashboard by clicking the upload button in the header.

![image](https://user-images.githubusercontent.com/55451470/167418813-0a4926b2-e81f-4e8c-95a8-ddf033c3bd3d.png)

Once on the upload page, enter a desired name for the model group you wish to upload. After that, choose the FEM toolkit XML export for the models you wish to upload. Optionally, you can upload FEM toolkit SVG exports for the same models, but this is no longer nessecary for vieweing the models. Click the upload button to finalize the process. On success a popup is displayed, saying that the model was successfully uploaded. You can continue uploading or choose to navigate back to your dashboard clicking the button in the header.

**Important:** The uploaded svg files must have the same name as the models they are exporting.

![image](https://user-images.githubusercontent.com/55451470/167419131-dbd9b8b2-646b-46af-b343-e6397c81e54a.png)

## Sharing model groups

In your dashboard, you can choose to share models you have uploaded with other users.

![image](https://user-images.githubusercontent.com/55451470/167419775-005b2d0c-9314-4792-b124-b6e652b29388.png)

To share a model enter the username of the user you wish to share the model with and click share.

![image](https://user-images.githubusercontent.com/55451470/167419940-e4f2dd77-de51-4430-853e-5cc06fbc1925.png)

## Viewing models

To view a model click the eye-shaped icon to the left of a listed model.

![image](https://github.com/user-attachments/assets/8202d34f-7695-43c5-a686-2e44af245a2b)

## Exporting models

To download a model click on the downward pointing arrow icon next to the view model button. 

### Selecting models

When in the viewer, click on the names of models to switch which one is displayed on the right.

![image](https://user-images.githubusercontent.com/55451470/167420526-41980a4d-87e3-4201-8b2d-248960e2f2d5.png)

### Zoom

You can zoom in our out by scrolling on the displayed model. You can also use the '-' and '+' button for zooming. Click the Reset button to reset the zoom and recenter the model diagram.

![image](https://github.com/user-attachments/assets/b0056ccf-7ac1-48f3-a26a-3a79405cf2fc)


### Model element details

Elements in the models can be clicked to highlight them, and provide extra details.
Original instances can have a list of all occurrences where they have been referenced. These references are listed with each having an arrow icon that can be clicked to navigate to the model and instance that references the original.

![image](https://user-images.githubusercontent.com/55451470/167420913-ee4b3f25-036e-416a-bb7a-e41635e6b7f5.png)

Elements that reference other elements provide navigation back to the originals in their details popup.

![image](https://user-images.githubusercontent.com/55451470/167421292-d403e2aa-450f-49a5-9399-46ef815debe5.png)

## Deleting model groups

To delete a model group simply click the delete button on the lower left. Be careful, as this deletes the model from everyone that it has been shared with as well.

![image](https://github.com/user-attachments/assets/4d4d317c-be01-4442-b5fb-691a2ebd7177)

