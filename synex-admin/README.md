# Synex Admin Panel

## Firebase mein Admin Email Add Karo (PEHLE YE KARO)

### Step 1 â€” Firebase Console kholo
```
console.firebase.google.com â†’ project k-upl-6a0db
â†’ Build â†’ Realtime Database â†’ Data
```

### Step 2 â€” adminEmails collection banao
```
Database root pe + icon click karo:

adminEmails
  â””â”€â”€ admin1               â† koi bhi naam
        â””â”€â”€ (string value) â†’ "tumhara.admin@gmail.com"
```

**Ya directly JSON import karo:**
```json
{
  "adminEmails": {
    "admin1": "tumhara.admin@gmail.com"
  }
}
```

### Step 3 â€” Firebase Rules mein adminEmails protect karo
```json
{
  "rules": {
    "adminEmails": {
      ".read": false,
      ".write": false
    }
  }
}
```
Koi bhi is collection ko read/write nahi kar sakta â€” sirf Firebase Console se tum.

---

## Deploy on Render

1. GitHub pe **PRIVATE repo** banao: `synex-admin`
2. Is folder ki saari files upload karo
3. render.com â†’ New â†’ Web Service â†’ repo connect karo
4. Build: `npm install && npm run build`
5. Start: `npx serve -s build -l 3000`
6. Deploy â†’ URL milega

## Login
Wahi email use karo jo `adminEmails` mein daala hai.

---

## Security Flow
```
Login attempt
     â†“
Firebase Auth (email/password check)
     â†“
adminEmails collection check (UID nahi, email se)
     â†“
Email match? â†’ Dashboard
No match?   â†’ Auto logout in 2 sec
```

UID ka koi use nahi â€” sirf email se admin verify hota hai.
