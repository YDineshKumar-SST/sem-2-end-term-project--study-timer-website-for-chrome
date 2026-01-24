# FocusFlow | My Study Timer & Task Tracker

## Project Overiew
Ye mera Semester 2 ka end-term project hai. FocusFlow banane ka main idea ye tha ki padhai karte waqt ya coding karte waqt hum distract na hon. Ye sirf ek simple timer nahi hai, balki isme maine ek Task Manager bhi dala hai taaki aapko pata rahe ki abhi kya finish karna hai aur kitna time lag raha hai.

## Problem Statement
Aksar jab hum system pe baithte hain, toh samajh nahi aata shuruat kahan se karein ya fir hum time ka track kho dete hain. FocusFlow is cheez ko solve karta hai:
- Tasks ko priority (High/Medium/Low) ke hisaab se set karne mein help karta hai.
- Iska "Mini Mode" feature screen pe side mein chota ho jata hai taaki aap screen pe kaam bhi kar sako aur timer bhi chalta rahe.
- F फालतू ki tabs kholne ki jagah, isme maine zaroori coding links aur shortcuts pehle se hi add kar diye hain.

## Key Features
- **Smart Timer:** Start, Pause aur Reset ke basic controls ke saath.
- **Task List:** Priorities ke saath tasks add karo aur kaam khatam hone par unhe hata do.
- **Mini Mode:** Ye mera favorite feature hai—ek click mein pura UI chota ho jata hai multitasking ke liye.
- **Quick Shortcuts:** Direct links hain Stack Overflow aur coding tutorials ke liye, taaki search karne mein time waste na ho.

## Tech & DOM Concepts Used (The Technical Part)
Is project ko banane ke liye maine pure JavaScript aur DOM manipulation ka use kiya hai:
- **Dynamic Elements:** Jab bhi koi task add hota hai, JS se naye `<li>` elements create hote hain.
- **Event Handling:** Buttons aur click events ka heavy use kiya hai timer aur navigation ke liye.
- **Time Logic:** `setInterval` function ka use karke timer ko chalaya gaya hai.
- **UI Switching:** "Mini Mode" ke liye CSS classes ko dynamically toggle kiya hai.

## Project Kaise Chalayein?
1. Repo ko clone karo ya files download karo.
2. Bas `index.html` file ko kisi bhi browser mein open kar lo, aur ye chal jayega.
3. Ya fir direct yahan click karo: [Live Demo](https://ydineshkumar-sst.github.io/sem-2-end-term-project--study-timer-website-for-chrome/)

## Kuch Kamiyaan (Known Limitations)
- Abhi data "Local Storage" mein save nahi hota, toh page refresh karne par tasks gayab ho jate hain (ispe kaam chal raha hai).
- Mobile pe shayad layout thoda alag dikhe kyunki ye desktop focus hai.
