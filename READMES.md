Used Command:

kubectl get deployment backend-deployment -o yaml

kubectl create secret generic backend-secret --from-literal=DATABASE_URL="postgres://postgres:postgres@db:5432/appdb"


kubectl exec -it deployment/backend-deployment -- printenv


pod Login command -

>>kubectl get pods
>>kubectl exec -it pod_name --sh 

Enter in pod
>> printenv




Your Backend Pod

When you log in:

kubectl exec -it deployment/backend-deployment -- sh

you're entering your application container.

Backend Pod
│
├── Node.js
├── app.js
└── Environment Variables

It has no access to etcd.

Where is etcd?

In a standard Kubernetes cluster:

                Control Plane
┌─────────────────────────────────────┐
│ API Server                          │
│ Scheduler                           │
│ Controller Manager                  │
│ etcd                               │
└─────────────────────────────────────┘

              │

        Worker Nodes
┌──────────────────────────────┐
│ Backend Pod                  │
│ Frontend Pod                 │
│ PostgreSQL Pod               │
└──────────────────────────────┘

Your application pods run on worker nodes.

etcd runs in the control plane.