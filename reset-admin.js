async function resetAdmin() {
  const res = await fetch("http://localhost:3001/api/reset-admin");
  console.log(await res.text());
}
resetAdmin();
