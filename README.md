# Three-Tier Application

This project demonstrates a simple three-tier architecture:
- Frontend: static HTML/CSS/JavaScript served by Nginx
- Backend: Node.js API service
- Database: PostgreSQL



Our Architecture
              Git Repository
                      │
                      ▼
              Docker Compose
      ┌─────────────┼─────────────┐
      ▼             ▼             ▼
   Frontend      Backend      PostgreSQL
    (Nginx)      (App)           (DB)
                      │
                      ▼
               Local Testing ✅
                      │
                      ▼
          Azure DevOps Pipeline
                      │
                      ▼
             Build Docker Images
                      │
                      ▼
      Push Images to Azure Container Registry
                      │
                      ▼
          Terraform creates Azure Infra
                      │
                      ▼
               Azure Kubernetes Service
                      │
                      ▼
                 Helm Deployment
                      │
                      ▼
                    ArgoCD
                      │
                      ▼
        Prometheus + Grafana + Azure Monitor

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
                    threetierapp.azurcr.io    = (containername with .azurecr.io )   is common.

                    we can login to acr with command
      >>az acr login --name threetierpp
                    View Repositories

            You can see what images are stored.
        az acr repository list --name threetierapp --output table

`📋 Ticket-4: Create Azure Container Registry (ACR)`
Story

The CI pipeline needs a place to store Docker images before they are deployed to AKS.

In Azure, we use Azure Container Registry (ACR).`         



for CI pipeline i need a docker images and that docker images i need to store somewhere so that the reason we need to create ACR

    "In a CI pipeline, after the application code is built, we create a Docker image. That image needs to be stored in a central and secure registry so that deployment environments like AKS can pull the exact same image. In Azure, we use Azure Container Registry (ACR) for this purpose."


`Ticket-5: Create Azure Service Connection`
Story

Imagine your manager assigns you this task:

"The pipeline needs permission to access Azure resources. Create a secure connection between Azure DevOps and Azure."

Without this, the pipeline cannot:

Push Docker images to ACR
Create Azure resources
Deploy to AKS


Output >>  az acr repository list --name threetierpp --output table     


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





`You never run az acr login inside the pipeline.`

Why?

Because the Azure Service Connection automatically authenticates the Docker task with ACR.

This is a very common interview question.

Interview Answer:

"In Azure Pipelines, we don't manually execute az acr login. The Docker@2 task uses the Azure Resource Manager service connection to authenticate with Azure Container Registry securely."




`What You Have Successfully Completed`
Local Development
✅ Docker Compose
✅ Frontend
✅ Backend
✅ PostgreSQL
✅ Application working locally
Azure
✅ Resource Group
✅ Azure Container Registry
✅ Service Connection
Azure DevOps

From your pipeline screenshot, I can see these stages completed successfully:

✅ Checkout Repository
✅ Verify Repository
✅ Install Node.js
✅ Install Backend Dependencies
✅ Build Backend Image
✅ Login to Azure Container Registry
✅ Verify Docker Image
✅ Tag Docker Image
✅ Push Docker Image to ACR




================================================================================

Now We creating kubernetes cluster 

with UI as where In 
    Required resource group
    required size pool 
    Container registory 

    after creating cluster we have to i have get credention because without that 

    What does az aks get-credentials do?
`az aks get-credentials --resource-group rg-three-tier-dev --name threetierapp --overwrite-existing`

This command:

Downloads the cluster credentials.
Updates your local ~/.kube/config (or %USERPROFILE%\.kube\config on Windows).
Sets the current context to your AKS cluster.


🏢 Real Company Scenario

Imagine the developer sends you this message:

"The backend has been deployed successfully. The Pods are running and the application is healthy. Please expose the backend so that other applications inside the cluster can communicate with it."

As a DevOps engineer, your next task is not another Deployment.

`Now We need to create service`

Why Do We Need a Service?

Right now your architecture looks like this:

                 Backend Deployment
                        │
                        ▼
                  ReplicaSet
                        │
            ┌───────────┴───────────┐
            ▼                       ▼
        Backend Pod 1          Backend Pod 2

Each Pod has its own IP.

Example:

Pod 1 → 10.244.1.12
Pod 2 → 10.244.1.20

If Pod 1 crashes:
10.244.1.12 ❌

New Pod
10.244.1.35 ✅

The IP changes.
This is why applications should never communicate directly with Pod IPs.



`Why ClusterIP?`

Because this backend is not accessed by users.

It is only accessed by:

Frontend
Other microservices

Inside the cluster.

Architecture:

Internet

      ❌

Frontend

      │

backend-service

      │

Backend Pods

This is the correct enterprise design.


command invole in op
>> kubectl apply -f service.yml
>>kubectl get svc 
>> kubectl describe svc backend-service
>>kubectl get endpoints


`what is use of endpoint in what case i need to check endpoints"`
Answer:


after service.yml deploy 

PS C:\Users\ganes\three-tier-app\kubernetes> kubectl get endpoints
Warning: v1 Endpoints is deprecated in v1.33+; use discovery.k8s.io/v1 EndpointSlice
NAME              ENDPOINTS                            AGE
backend-service   10.244.0.93:3001,10.244.1.178:3001   115s
kubernetes        52.150.49.116:443                    3h43m
PS C:\Users\ganes\three-tier-app\kubernetes> 


`MOST IMPORTANET`

First Understand the Architecture

Suppose you have:

Deployment
      │
      ▼
ReplicaSet
      │
      ▼
Pod 1 (10.244.1.10)
Pod 2 (10.244.1.11)

Now you create a Service.

backend-service
      │
      ▼
?????

How does the Service know where your Pods are?

Answer: Through Endpoints.

What is an Endpoint?

An Endpoint is simply the list of Pod IP addresses that a Service forwards traffic to.

Example:

Service: backend-service

Endpoints:

10.244.1.10:3001
10.244.1.11:3001

This means:

When someone sends a request to:

backend-service:3001

Kubernetes forwards it to either:

10.244.1.10:3001

or

10.244.1.11:3001
Visual Diagram
          Client Pod
               │
               ▼
      backend-service
        (ClusterIP)
               │
      ┌────────┴────────┐
      ▼                 ▼
10.244.1.10       10.244.1.11
 Backend Pod      Backend Pod

Notice something important:

The Service does not directly know about Deployments.

It only knows about the Endpoints.

How Are Endpoints Created?

You wrote:

selector:
  app: backend

Your Pods have:

labels:
  app: backend

Kubernetes automatically matches them.

Service Selector

app=backend

        │

Find Pods

app=backend

        │

Create Endpoints

You don't create Endpoints manually in normal situations.

When Should You Check Endpoints?

This is the important part.

Case 1 - Service Not Working ⭐⭐⭐⭐⭐

Suppose:

kubectl get pods

Running

Everything looks healthy.

But:

backend-service

not working

The first thing I check is:

kubectl get endpoints

Suppose it shows:

backend-service

<none>

Immediately I know:

👉 The Service cannot find any Pods.

Usually because:

Wrong labels
Wrong selector
Case 2 - Application Not Accessible

Example:

Frontend

↓

backend-service

↓

404

I check:

kubectl describe svc backend-service

If I see:

Endpoints:

<none>

I know the Service has nothing to forward traffic to.

Case 3 - Pods Running but No Traffic

Imagine:

kubectl get pods

Running

But:

curl backend-service

Connection refused

Again:

kubectl get endpoints

Maybe:

backend-service

<none>

Problem found.

Case 4 - Rolling Update

Suppose Deployment creates a new Pod.

Old:

10.244.1.10

New:

10.244.1.25

You don't update the Service.

Kubernetes automatically updates the Endpoints.

Before

10.244.1.10

↓

After

10.244.1.25

This is one reason Services work so well with Deployments.

Real Production Example

Imagine your company receives an alert:

"Frontend cannot communicate with Backend."

My troubleshooting steps would be:

Step 1

kubectl get pods

↓

Pods Running?

↓

YES

↓

Step 2

kubectl get svc

↓

Service Exists?

↓

YES

↓

Step 3

kubectl get endpoints

↓

Endpoints Present?

↓

NO

↓

Check labels/selectors

This is exactly how many Kubernetes issues are diagnosed.

Commands Every DevOps Engineer Uses
Check Services
kubectl get svc
Check Endpoints
kubectl get endpoints
Detailed Service Information
kubectl describe svc backend-service
Verify Labels
kubectl get pods --show-labels
Interview Question

Interviewer:

"What are Kubernetes Endpoints?"

A strong answer:

"Endpoints are the Pod IP addresses associated with a Kubernetes Service. A Service uses its selector to discover matching Pods, and Kubernetes automatically creates and updates the Endpoints object. The Service routes traffic to those Endpoint IPs. During troubleshooting, I check Endpoints to verify that the Service has discovered the correct Pods."



====================================================================================================================================
o why need to replace with older credential if it is same as exting piepline and resources

That's an excellent question. The key point is that it's not just the cluster name that matters—it's the underlying credentials and certificates.

Case 1: Same cluster, nothing changed

Suppose you created an AKS cluster once and never deleted it.

AKS Cluster
Name: threetierapp

You run:

az aks get-credentials --resource-group rg-three-tier-dev --name threetierapp

again.

In this case, the credentials are usually the same, so you don't need --overwrite-existing. Running it again doesn't hurt, but it isn't necessary.

Case 2: Cluster was deleted and recreated (your recent scenario)

Yesterday:

AKS Cluster
Name: threetierapp

You deleted it.

Today you created another cluster with the same name:

AKS Cluster
Name: threetierapp

Although the name is identical, it's a different cluster internally.

It has:

A new cluster certificate.
A new API server.
New authentication credentials.

Your local kubeconfig still contains the old credentials. If you don't overwrite them, kubectl may try to use stale information and fail to connect or authenticate correctly.

Why is --overwrite-existing commonly used?

It's mainly for automation.

Imagine an Azure DevOps pipeline or a deployment script. You don't know whether the build agent or machine already has credentials for that cluster.

Using:

az aks get-credentials --resource-group rg-three-tier-dev --name threetierapp --overwrite-existing

guarantees:

No interactive prompt.
The kubeconfig is updated with the latest credentials.
The script works every time.
In your current project

If:

you did not delete and recreate the cluster,
you're using the same AKS cluster,
and your kubectl commands already work,

then you could simply run:

az aks get-credentials --resource-group rg-three-tier-dev --name threetierapp

without --overwrite-existing.

Interview answer

If an interviewer asks:

Why do we use --overwrite-existing?

A good answer is:

"It's used to automatically replace an existing kubeconfig entry for the same cluster name. This is especially useful when a cluster has been recreated or when running automation and CI/CD pipelines, because it avoids interactive prompts and ensures kubectl always uses the latest cluster credentials."
==================================================================================================================================


Remember this interview point

There are three different things:

Docker Image
      │
      ▼
Docker Container (Created)
      │
      ▼
Docker Container (Running)

Commands:

docker stop → Stops the running container.
docker rm → Removes the container.
docker rmi → Removes the image.

An image cannot be deleted if any container (running or stopped) still references it.

What you have achieved

If this were an interview, you can now confidently say:

"I built a production-style three-tier application on Azure Kubernetes Service. I created CI pipelines for the frontend and backend to build Docker images and push them to Azure Container Registry. I then created a deployment pipeline that deploys PostgreSQL, backend, frontend, and their services to AKS. The application runs with multiple replicas behind Kubernetes Services and uses ACR for container images."




==========================================================================================================

What is the Release?

The Release is your installed instance of that chart.

Think of Microsoft Word.

You can install Microsoft Office on:

Laptop A
Laptop B
Laptop C

Same software.

Different installations.

Helm works the same way.

Example:

helm install ingress-nginx ingress-nginx/ingress-nginx

Release Name:

ingress-nginx

Later you could even install another one:

helm install internal-ingress ingress-nginx/ingress-nginx

Now you have:

Release 1
ingress-nginx

Release 2
internal-ingress

Same chart.

Different releases.

========================================================================================================



Interview Tip

If an interviewer asks:

"Is Helm only for applications?"

You can answer:

"No. Helm is also used by cloud providers like AKS to install and manage cluster add-ons. For example, AKS installs several managed components as Helm releases in the kube-system namespace."

That's a senior-level observation.

======================================================================================================================

Interview Question

An interviewer may ask:

Why do we install Ingress in a separate namespace?

A good answer is:

"Ingress is a shared infrastructure component. Multiple applications use the same Ingress Controller, so it's installed in its own namespace for isolation, easier upgrades, RBAC, monitoring, and lifecycle management."


=============================================================================================================================
Interview Question

An interviewer might ask:

Why should backend-service be ClusterIP when using Ingress?

A good answer is:

"Ingress is the single external entry point into the cluster. Backend services are internal components and don't need public IPs. Exposing them through LoadBalancers increases cost and the attack surface. With Ingress, backend services are typically ClusterIP."

==============================================================================================================================

One thing I want to point out

You also saw another service:

ingress-nginx-controller-admission
ClusterIP
443

Many people ignore this, but it's important.

This is the Admission Webhook Service.

Its job is to validate your Ingress objects before Kubernetes accepts them.

For example, if you accidentally write an invalid ingress.yaml, the admission webhook can reject it before it reaches the cluster.

This is one of the reasons the official NGINX Ingress Helm chart installs several resources, not just a controller pod.

===========================================================================================================================


Our Plan
Phase 3.1 - Kubernetes Secrets (Learning)

We'll learn:

✅ What is a Secret?
✅ How to create a Secret
✅ How to view a Secret
✅ How Secrets are stored
✅ How to consume a Secret as an environment variable
✅ How to verify it's working

After that, we'll replace it with Azure Key Vault in a later phase.
==================================================================================================================================


How does the Pod read it?

Your Deployment contains:

env:
- name: DATABASE_URL
  valueFrom:
    secretKeyRef:
      name: backend-secret
      key: DATABASE_URL

During Pod creation, Kubernetes performs this process:

Pod Starting
      │
      ▼
Find Secret
backend-secret
      │
      ▼
Read key
DATABASE_URL
      │
      ▼
Decode Base64
      │
      ▼
Inject as Environment Variable
      │
      ▼
Container Starts

Inside the container:

printenv

you'll see:

DATABASE_URL=postgres://postgres:postgres@db:5432/appdb

Notice that your application never sees the Base64 value. Kubernetes decodes it before injecting it.



=========================================================================================================


AKS Cluster
│
├── Node (VM)
│     │
│     ├── Container Runtime (containerd)
│     │      │
│     │      ├── Pod
│     │      │     │
│     │      │     ├── Container 1
│     │      │     ├── Container 2 (optional)
│     │      │
│     │      ├── Pod
│     │      │     └── Container





Step 1 – Create a ConfigMap

Run this command:

kubectl create configmap backend-config --from-literal=PORT=3001
Step 2 – Verify it

Run:

kubectl get configmap

Expected:

NAME               DATA
backend-config     1

Then:

kubectl describe configmap backend-config

You should see:

Name:         backend-config

Data
====
PORT:
----
3001


Why not store the port in a Secret?

Because the application port is not confidential. Anyone deploying or troubleshooting the application needs to know which port it listens on. Using a Secret for non-sensitive values adds unnecessary complexity without improving security.




There are two different units here:

requests:
  cpu: "100m"
  memory: "128Mi"

They mean completely different things.

CPU: 100m

Here, m means millicores, not megabytes.

1000m = 1 CPU Core

Examples:

Value	Meaning
1000m	1 CPU Core
500m	0.5 CPU Core
250m	0.25 CPU Core
100m	0.1 CPU Core
50m	0.05 CPU Core

So:

cpu: "100m"

means:

Reserve 10% of one CPU core.

If your AKS node has 2 vCPUs, then:

Total CPU = 2000m

Backend Request = 100m

Remaining = 1900m
Memory: 128Mi

Here, Mi means Mebibytes, not Megabytes (MB).

Kubernetes uses binary units.

Unit	Value
1Ki	1024 Bytes
1Mi	1024 Ki = 1,048,576 Bytes
1Gi	1024 Mi

Examples:

memory: "128Mi"

means approximately:

128 Mi ≈ 134 MB

Another example:

memory: "512Mi"

is approximately:

512 Mi ≈ 536 MB
Why Mi instead of MB?

There are two standards.

Decimal (used by hard disk manufacturers)
1 MB = 1,000,000 Bytes
Binary (used by Linux/Kubernetes)
1 Mi = 1,048,576 Bytes

That's why Kubernetes uses:

Ki
Mi
Gi

instead of:

KB
MB
GB
Easy way to remember
CPU
m = millicore
1000m = 1 Core
Memory
Mi = Mebibyte
1024Mi = 1Gi
Interview Question

Interviewer:

What does 100m CPU mean?

Good answer:

m stands for millicore. 1000m equals one CPU core, so 100m means the container requests 0.1 CPU core.

Interviewer:

What does 128Mi memory mean?

Good answer:

Mi stands for Mebibyte, which is a binary memory unit used by Kubernetes. 128Mi is approximately 128 MB of memory, and Kubernetes uses Ki, Mi, and Gi instead of KB, MB, and GB.



Next Phase: Liveness & Readiness Probes

This is one of the most frequently asked Kubernetes interview topics.

Why do we need them?

Imagine this scenario:

User
   │
   ▼
Backend Pod

The pod status is:

Running ✅

But your Node.js application has crashed internally or is stuck.

Kubernetes only knows:

"The container is running."

It doesn't know whether your application is actually healthy.

That's where probes help.

Three types of probes
1. Liveness Probe
Question Kubernetes asks:
"Is the application alive?"
If No:
Restart the container
2. Readiness Probe
Question Kubernetes asks:
"Can this pod receive traffic?"
If No:
Remove it from the Service endpoints.
The pod stays running but won't receive requests until it's ready again.

3. Startup Probe
Used for applications that take a long time to start.
For your project, we'll focus on Liveness and Readiness.


This is an interview story now

If an interviewer asks:

Tell me about a challenging Kubernetes issue you solved.

You can answer:

"While adding persistent storage for PostgreSQL on AKS, my pod entered CrashLoopBackOff. I checked kubectl describe pod and then kubectl logs --previous. The logs showed that PostgreSQL couldn't initialize because the mounted Azure Disk contained a lost+found directory. I fixed it by configuring the PGDATA environment variable to use a subdirectory (/var/lib/postgresql/data/pgdata). After redeploying, the pod started successfully. I verified persistence by creating data, deleting the PostgreSQL pod, and confirming the data remained after the new pod came up."

That is a real production-level troubleshooting example.