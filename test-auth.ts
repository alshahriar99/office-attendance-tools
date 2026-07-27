async function test() {
  const res = await fetch("http://localhost:3001/api/auth/forget-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "origin": "http://localhost:3001"
    },
    body: JSON.stringify({ email: "shahriar@gmail.com", redirectTo: "/reset-password" })
  });
  console.log(res.status);
  console.log(await res.text());
}
test();
