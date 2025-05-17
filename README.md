# MongoDB CRUD App with Node.js, Docker, and Kubernetes

This is a simple CRUD application using **Node.js**, **Express**, and **MongoDB**, containerized with **Docker** and deployable to a **Kubernetes** cluster.

---

## 📦 Features

- RESTful API (`/items`) supporting:
  - `POST /items` – Create an item
  - `GET /items` – List all items
  - `PUT /items/:id` – Update an item
  - `DELETE /items/:id` – Delete an item
- Front-end HTML interface (`/`) for interacting with the API
- MongoDB Atlas connection
- Works in Docker Desktop with Kubernetes enabled

---



## 🛠 Setup & Run

### 1. Clone the repo

```bash
git clone <this-repo-url>
cd crud-app
```

### 2. Build and push Docker image

```bash
docker build -t darcylambrick/crud-app .
docker push darcylambrick/crud-app
```

### 3. Kubernetes Deployment

Apply the following Kubernetes files:

```bash
kubectl apply -f k8s/
```

> Update your `crud-app-deployment.yaml` to use your Docker image and `MONGO_URI` secret.

### 4. Access the app

Use `kubectl port-forward`:

```bash
kubectl port-forward service/crud-app-service 3000:80
```

Then go to:

```
http://localhost:3000
```

---

## 🔄 Redeploy After Changes

### If you make code changes:

```bash
docker build -t darcylambrick/crud-app .
docker push darcylambrick/crud-app
kubectl rollout restart deployment crud-app
```

---
