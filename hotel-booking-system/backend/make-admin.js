const db = require('./models/database');

// Yahan wo email likhein jis se aapne abhi register kiya tha
const myEmail = 'khawarraheem893@gmail.com'; 

console.log(`⏳ Updating role for ${myEmail}...`);

db.run("UPDATE users SET role = 'admin' WHERE email = ?", [myEmail], function(err) {
    if (err) {
        console.error("❌ Error:", err.message);
    } else {
        // this.changes batata hai ke kitni rows update huin
        if (this.changes > 0) {
            console.log(`✅ Success! Ab '${myEmail}' ek ADMIN hai.`);
            console.log("👉 Ab Logout karke dobara Login karein.");
        } else {
            console.log("⚠️ User nahi mila! Email spelling check karein.");
        }
    }
});