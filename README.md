# TradeWise

An educational stock-market learning and paper-trading platform.

## Technology Stack

| Layer          | Technology                |
| -------------- | ------------------------- |
| Frontend       | React + Vite              |
| Backend        | Node.js + Express.js      |
| Database       | PostgreSQL                |
| ORM            | Prisma 7                  |
| Auth (planned) | JWT + bcrypt              |
| Routing        | React Router              |
| HTTP Client    | Axios                     |

## Folder Structure

```text
TradeWise/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.js
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```
