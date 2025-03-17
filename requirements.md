# Requirements

## Functional requirements

### File upload

-   FR-F-1 - As an user, I want to be able upload XML files, so that i could view them in the application

### Nodes

-   FR-N-1 As an user, I want **business processes** and **assets** to be displayed in different colors, so that I can distinguish between them.
-   FR-N-2 As an user, I want **business processes** and **assets** to be displayed in different shapes, so that I can distinguish between them.
-   FR-N-3 - As an user, I want to be able to drag around components, so that I can order them as I please.
-   FR-N-4 - As an user, I want to be able to resize components, so that I can order them as I please.
-   FR-N-5 - As an user, I want to be see a label inside a **business process** container, to see it's name
-   FR-N-6 - As an user, I want to be see a label inside an **asset** container, to see it's name
-   FR-N-7 - As an user, I want to be able to create **assets**, and **business processes**, so that I can build or extend a model.
-   FR-N-8 - As an user, I want to be able to change the styling of **assets** and **processes**, so that I can customize the model to my needs.
-   FR-N-9 - As an user, I want primary **processes** to be displayed different, so that I can differentiate.

### Connections

-   FR-C-1 - As an user, I want to make **connections** between nodes, so that I can show interconnections between **assets** and **business processes**.
-   FR-C-2 - As an user, I want to make a **connection** from an **asset** to a process with a solid line pointing to a **process**, to show a "**using**" relationship
-   FR-C-3 - As an user, I want to make a **connection** from a process to an **asset** with a dashed line pointing to an **asset**, to show a **process** "**changing**" an **asset**
-   FR-C-4 - As an user, I want to see a label on the midpoint of a **connection**, to see the type of relationships between a **process** and an **asset**.
-   FR-C-5 - As an user, I want to be able to standardize the naming of **connection** labels by providing a set of relationships, so that I can imporve the understandability of models.
-   FR-C-6 - As an user, I want to specify the importance of **connections**, so that I can get a better overview of the model.
-   FR-C-7 - As an user, I want more important **connections** to stand out, so that I can get a fast overview of the connections of a model.

### Processes and Assets

-   FR-PA-1 - As an user, I want to add descriptions to **processes**, so that i can provide more information about them without cluttering the UI.
-   FR-PA-2 - As an user, I want to reference **processes** and **assets** between models, so that I can make connections between models.
-   FR-PA-3 - As an user, I want to make some **processes** primary, so that I can specify priority.

### Models

-   FR-M-1 - As an user, I want to be able to upload multiple models in different groupings, so that I can describe enterprises modularly.

## Non-functional requirements

-   NFR-1 - Files should be draggable from the users filesystem to the browser for upload.


# V2 Requirements
### Annotations

-  FR-A-1 - As a user, I want to be able to edit the description of nodes, so that I can add context and and give feedback to modeled buisness **processes** and **assets**

### Export

-  FR-E-1 - As a user, I want to be able export the model as XML from FEM-Viewer, so that I can share the annotations that I made with the modelers who use FEM-Toolkit.
    - The exported file should be compatible with FEM-Toolkit
