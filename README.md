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




------------------------------------------------------------------------------


trigger:  
 - main    # when someone pushes to main branch this pipeline will be triggered automatically.

pool:  
    vmImage: 'ubuntu-latest'    # azure devops creates a temporary virtual machine with ubntu_latest image to run the pipeline.
                                #Everything happens on this temporary build agent.

variables:                                        #we use variables so they can be reused throughout the pipeline.
        imageRepository: backend
        dockerfilePath: backend/Dockerfile
        tag: $(Build.BuildId)


----------------------------------------------------------------------------------
above 
Story

The developers have completed the backend application.

Your manager says:

"Ganesh, create a CI pipeline that automatically builds the backend Docker image whenever code is merged into the main branch."


let's do next

Interview Question

Q: Why do we use #checkout: self?

Answer:

It downloads the source code from the current Azure Repos repository to the build agent so that subsequent steps like npm install, Docker build, and testing can access the project files.



Step 2 - Verify Repository

Before installing anything, we always verify that the repository was downloaded correctly.

Add:

- script: |
    pwd
    ls -R
  displayName: 'Verify Repository'

  

  ``
  `Why?`

Imagine your Docker build fails.

The first question you'll ask is:

"Did the repository actually get downloaded?"

This step prints:

Current directory
All folders and files

This is extremely useful while developing a pipeline.

Many engineers remove this step later, but it's great during pipeline creation.

`Ticket-7`
Story

Your manager says:

"The repository is checked out successfully. Now install the backend dependencies so the application is ready for building and testing."



Step 1 - Install Node.js

Add this after your repository verification step.

- task: NodeTool@0
  inputs:
    versionSpec: '20.x'
  displayName: 'Install Node.js'

  `Why?`

The Microsoft-hosted agent has Node installed, but we explicitly specify the version.

This ensures every pipeline uses the same Node.js version.

Example:

Developer Laptop → Node 20
QA Pipeline → Node 20
Production Build → Node 20

Consistency prevents "works on my machine" problems.


Step 2 - Install Dependencies

Now install the backend packages.

- script: |
    cd backend
    npm install
  displayName: 'Install Backend Dependencies'


  Why?

When Azure creates the build agent:

backend/

package.json

NO node_modules

There is no node_modules folder.

The pipeline downloads only your source code.

So it must execute:

npm install

to download all required packages.



Interview Questions
Q1: Why do we install Node.js if it's already available on the agent?

Answer:

We specify the Node.js version to ensure consistent builds across developer machines and CI environments. This avoids version-related issues.

Q2: Why run npm install in the pipeline?

Answer:

The build agent is temporary and starts without project dependencies. Running npm install downloads the required packages from package.json before building or testing the application.


Step 1 - Add Variables

Update your variables section.

Replace it with something like this (use your actual service connection name):

variables:
  imageRepository: backend
  dockerfilePath: backend/Dockerfile
  containerRegistry: threetierpp
  serviceConnection: Your-Service-Connection-Name
  tag: $(Build.BuildId)

⚠️ Replace Your-Service-Connection-Name with the exact name of the Azure Service Connection you created.

Step 2 - Build the Docker Image

Add this after the npm install step.

- task: Docker@2
  displayName: 'Build Backend Image'
  inputs:
    command: build
    repository: $(imageRepository)
    dockerfile: $(dockerfilePath)
    tags: |
      $(tag)
Let's Test Before Pushing

Notice that we are NOT pushing to ACR yet.

This is intentional.

In a real project we verify one step at a time:

Checkout      ✅
Install        ✅
Docker Build   ← Test this first
Docker Push    ← Add after build succeeds
Why Not Build and Push Together?

Suppose the build fails.

If both steps are combined, you don't immediately know whether the problem is:

Dockerfile
Docker build context
Image tagging
ACR authentication

By testing the build first, troubleshooting is much easier.


=--=-===========================================================================



The answer is:

Only on the Azure Pipeline agent.

When the pipeline finishes, Microsoft destroys that temporary VM.

Azure Hosted Agent

Docker Image
     │
     ▼
Pipeline Finished
     │
     ▼
VM Destroyed ❌
Image Lost ❌

So although the image was built successfully, it is not available for deployment.
`
`Next Ticket (Ticket-9)`
Story

Your manager says:

"The Docker image is being built successfully. Now store it in Azure Container Registry so AKS can use it later."

This is why we created ACR earlier.

The flow becomes:

Developer
      │
      ▼
Azure Repos
      │
      ▼
Azure Pipeline
      │
      ▼
Docker Build
      │
      ▼
Push Image to ACR
      │
      ▼
Image Stored Securely





``
🚀 `Ticket-9: Push Docker Image to ACR`

Now we are completing the CI pipeline.

Add this task after your Docker Build task:
- task: Docker@2
  displayName: 'Push Backend Image to ACR'
  inputs:
    command: push
    repository: $(imageRepository)
    containerRegistry: 'threetierapp'
    tags: |
      $(tag)

Here, containerRegistry refers to your Azure DevOps Service Connection, not the ACR name.