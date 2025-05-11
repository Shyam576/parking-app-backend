function dmsToDecimal(dms, direction) {
    const parts = dms.split(/[°'"]/).map((part) => parseFloat(part.trim()));
    const degrees = parts[0];
    const minutes = parts[1] || 0;
    const seconds = parts[2] || 0;
  
    let decimal = degrees + minutes / 60 + seconds / 3600;
    if (direction === "S" || direction === "W") {
      decimal *= -1; // South and West are negative
    }
    return decimal;
  }
  
  module.exports = dmsToDecimal;