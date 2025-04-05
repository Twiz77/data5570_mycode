# data5570_mycode
# Chase Entwistle Data 5570

# The code should all be set up properly to take customer info and upload it to the SQLite database. The button issues continue to persist as it will not open the next
# page despite it being set up properly. If the button were to work, the project would function correctly.

# Full Stack React Native + Django App

## ✅ What This App Does

This is a full stack application that includes:

- A React Native frontend (built with Expo + Redux Toolkit)
- A Django REST Framework backend
- A SQLite database to persist customer records
- State sharing and API communication using Redux middleware

---

## 🔧 Features

- A two-page frontend:
  - Home screen
  - Counter page (state changes)
  - Customers screen
- Fetches customers from backend (GET)
- Adds new customers via form (POST)
- Updates Redux state and UI immediately
- Persists data in SQLite

---

## 📂 Project Structure


---

## 🚀 How to Run Locally

### Frontend

```bash
cd my-app
npx expo start
press w

### Backend

cd myproject
source myvenv/bin/activate
python manage.py runserver
