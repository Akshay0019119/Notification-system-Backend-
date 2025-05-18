# 📣 Notification Service

A Node.js microservice that sends **Email**, **SMS**, and **In-App notifications**. Uses **MongoDB** for storage, **RabbitMQ** for async processing, and includes **retry logic** for reliable delivery.

---

## ✅ Features

- Send notifications via **Email**, **SMS**, or **In-App**
- Queue-based async processing with **RabbitMQ**
- Retry logic (up to 3 attempts for email/SMS)
- In-App notifications marked as sent instantly
- Notifications stored in **MongoDB**
- Modular code with Express routing, services, and worker
- Simulated integrations with **Nodemailer** and **Twilio**

---

## 🔧 Requirements

- **Node.js** v14+
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **RabbitMQ** (local or [CloudAMQP](https://www.cloudamqp.com/))
- (Optional) SMTP and Twilio credentials for real Email/SMS sending

---

## 📦 Installation

1. **Clone the repository**


git clone https://github.com/your-username/notification-service.git
cd notification-service
2.Install dependencies
Create a .env file in the root directory

ini
Copy
Edit
PORT=3000

MONGO_URI=mongodb://localhost:27017/notification-db
RABBITMQ_URL=amqp://localhost

# Email config (optional if using nodemailer mock)
SMTP_USER=your-email@example.com
SMTP_PASS=your-smtp-password

# SMS config (optional if using Twilio mock)
TWILIO_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone
Start the API server

bash
Copy
Edit
node index.js
Start the RabbitMQ worker (in a new terminal)

bash
Copy
Edit
node workers/notificationWorker.js
📬API Endpoints
1. Send Notification
bash
Copy
Edit
POST /api/notifications
Headers:

http
Copy
Edit
Content-Type: application/json
Body Example:

json
Copy
Edit
{
  "userId": "user123",
  "type": "email",            // "email" | "sms" | "in-app"
  "to": "user@example.com",   // required for email/sms
  "subject": "Welcome",       // optional
  "message": "Hello world!"   // required
}
Responses:

202 Accepted – Notification queued

400 Bad Request – Validation error

500 Internal Server Error – Server failure

2. Get Notifications by User

3. 
Folder Structure


.
├── index.js                  # Express API
├── workers/
│   └── notificationWorker.js # RabbitMQ consumer
├── services/                # Notification logic
├── models/                  # Mongoose schemas
├── routes/                  # Express routes
├── utils/                   # Helper functions
├── .env.example             # Sample env file
├── .gitignore               # Ignore node_modules/.env
├── README.md                # This file
