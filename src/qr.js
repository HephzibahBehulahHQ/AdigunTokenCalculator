import qrcode from "qrcode-generator";

// QR byte mode needs UTF-8; the package default truncates UTF-16 code units.
qrcode.stringToBytes=text=>Array.from(new TextEncoder().encode(text));

export function createQr(text){
  const qr=qrcode(0,"M");
  qr.addData(text);
  qr.make();
  return qr;
}
