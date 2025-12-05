// functions
function genPass() {
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numChars = "0123456789";
  let chars = lower;

  chars += upperChars;
  chars += numChars;

  let pass = "";
  for (let i = 0; i < 6; i++) {
    const randIdx = Math.floor(Math.random() * chars.length);
    pass += chars[randIdx];
  }

  return pass;
}
export default genPass;
