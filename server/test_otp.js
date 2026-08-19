fetch('https://youtube-4mgi.onrender.com/user/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'pulipatishloka013@gmail.com', name: 'Shloka', image: 'test' })
}).then(r => r.json()).then(console.log).catch(console.error);
