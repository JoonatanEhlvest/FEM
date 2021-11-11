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

### Connections

-   FR-C-1 - As an user, I want to make **connections** between nodes, so that I can show interconnections between **assets** and **business processes**.
-   FR-C-2 - As an user, I want to make a **connection** from an **asset** to a process with a solid line pointing to a **process**, to show a "**using**" relationship
-   FR-C-3 - As an user, I want to make a **connection** from a process to an **asset** with a dashed line pointing to an **asset**, to show a **process** "**changing**" an **asset**
-   FR-C-4 - As an user, I want to see a label on the midpoint of a **connection**, to see the type of relationships between a **process** and an **asset**.
-   FR-C-5 - As an user, I want to be able to standardize the naming of **connection** labels by providing a set of relationships, so that I can imporve the understandability of models.

---

## Non-functional requirements

-   NFR-1 - Files should be draggable from the users filesystem to the browser for upload.
