# Three-Tier Application

This project demonstrates a simple three-tier architecture:
- Frontend: static HTML/CSS/JavaScript served by Nginx
- Backend: Node.js API service
- Database: PostgreSQL

## Run locally

```bash
docker compose up --build
```

Then open:
- http://localhost:9090
- http://localhost:3001/health

## DevOps-friendly structure

- Docker Compose for local orchestration
- Dockerfiles for each service
- Database initialization script
- Health endpoint on the backend



First 1) I have creaed source code
2) i have run that code locally 
3) build docker compose image for fronend ans backed file
 docker compose up -d
 
 I am enable to open localhost over port 9090
 i have initiat git 
 and added repos in github 
   command Invole in above is 
        git init
        git add .
        git commit -m
        git push

        before push i have to added my git url and azure repos url in local 

        used command:
        git remote -v
        git remote add origin URL for github
        git remote add origin URL for AZURE DevOps


        i have create branches to keep my main brach safe for prod 
        i have created branches like
            devops
            hotfix
            feature

            command:
            git checkout -b hotfix

   2)_  Now i have added repos to azure devops 
        - Now i am creating azure container registory 
             before creaing ACR I need to create resouce group
              as name : threetierapp
                then 
            I have created acr for that i need lowercase name for acr.
            and resource group.
            Now i have created Acr
            i can log in acr through my local machine as well

            with help of login server provide in azure after creating acr

            acr login server is like :
                    threetierapp.azurcr.io    = (containername with .azureapp.azurecr.io )   is common.

                    we can login to acr with command

                    View Repositories

            You can see what images are stored.
        az acr repository list --name threetierapp --output table

`📋 Ticket-4: Create Azure Container Registry (ACR)`
Story

The CI pipeline needs a place to store Docker images before they are deployed to AKS.

In Azure, we use Azure Container Registry (ACR).`         



for CI pipeline i need a docker images and that docker i need to store somewhere so that the reason we need to create ACR

    "In a CI pipeline, after the application code is built, we create a Docker image. That image needs to be stored in a central and secure registry so that deployment environments like AKS can pull the exact same image. In Azure, we use Azure Container Registry (ACR) for this purpose."


`Ticket-5: Create Azure Service Connection`
Story

Imagine your manager assigns you this task:

"The pipeline needs permission to access Azure resources. Create a secure connection between Azure DevOps and Azure."

Without this, the pipeline cannot:

Push Docker images to ACR
Create Azure resources
Deploy to AKS



`Why do we need a Service Connection?`

Think of it like this.

Currently:

Azure DevOps Pipeline
        │
        ❌
        │
Azure Subscription

The pipeline has no identity.

After creating a Service Connection:

Azure DevOps Pipeline
        │
        ▼
Azure Service Connection
        │
        ▼
Azure Subscription

Now the pipeline can authenticate securely.



`Create an Azure Resource Manager Service Connection`

In Azure DevOps:

Project Settings
        ↓
Service Connections
        ↓
New Service Connection
        ↓
Azure Resource Manager

Choose:

Service Principal (automatic)

Then select:

Your Azure Subscription
Your Resource Group (or Subscription scope)

Give it a name such as:

Azure-ServiceConnection

Grant access permission to all pipelines.

Click Save.


🎯 `Ticket-5 (Current)`
User Story

As a DevOps Engineer, I want every commit to the main branch to automatically build my backend Docker image and push it to Azure Container Registry.



Before Writing YAML

A DevOps engineer doesn't start by writing YAML. First, they gather information.

Imagine your Team Lead asks:

"Ganesh, create the CI pipeline."

Before you start, you should collect the following information.

| Information                   | Who Provides It?           | Status                 |
| ----------------------------- | -------------------------- | ---------------------- |
| Azure Repos Repository        | SCM Team / Already created | ✅                      |
| Backend Folder                | Developer                  | ✅ `backend/`           |
| Dockerfile Location           | Developer                  | ✅ `backend/Dockerfile` |
| Azure Container Registry Name | Cloud Team                 | ✅ `threetierpp`        |
| Azure Service Connection Name | DevOps                     | ✅ (you created it)     |
| Branch to trigger             | Team Decision              | ✅ `main`               |
