const generatePNR = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  let pnr = "";

  for (let i = 0; i < 3; i++) {
    pnr += letters.charAt(
      Math.floor(Math.random() * letters.length)
    );
  }

  for (let i = 0; i < 3; i++) {
    pnr += numbers.charAt(
      Math.floor(Math.random() * numbers.length)
    );
  }

  return pnr;
};

export { generatePNR };