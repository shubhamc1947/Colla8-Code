# 📌 Future Plan

## 🧩 Features

* [ ] **Guest Ribbon on Navbar**
  Show a visual indicator like a “Guest” ribbon if the user is not logged in.

* [ ] **Code Execution Pop-up**
  Display a pop-up on the **right bottom** when code execution starts and ends.

* [ ] **Hamburger Menu for Left Navbar**
  Collapse all left navbar items into a hamburger menu.
  On click:

  * Show all users
  * Show a Logout button

* [ ] **Auto Logout Mechanism**
  Implement frontend-based **auto-logout** after a set idle timeout (e.g., 15–30 mins). Consider using libraries like `idle-timer`.

* [ ] **Email Notification on Login (EmailJS)**
  Integrate **EmailJS** to send real-time email notifications whenever a user logs in.

---

## 🐛 Bug Fixes

* [ ] **LocalStorage Refetch on Reload**
  On reload, ensure code is **refetched from localStorage** if available.

---

## ⚙️ Enhancements

* [ ] **API Debounce for Code Editor**
  Add debounce (e.g., 500ms) before triggering API calls from the code editor to reduce network requests.

* [ ] **Re-evaluate Framer Motion Usage**
  Rethink where and how `framer-motion` is used — is it overused or slowing things down?

---

## 🧹 Code Quality

* [ ] **Fix All Syntax & Type Errors**
  Remove **all red errors** in editor: syntax errors, type errors, undefined variables, etc.

* [ ] **Refactor the Codebase**
  Clean up the structure and ensure better readability and maintainability.

