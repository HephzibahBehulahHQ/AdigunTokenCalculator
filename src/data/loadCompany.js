/**
 * Approved corporate identity, inherited without altering the existing artwork.
 * Source documents were reviewed at the immutable commits below. The canonical
 * website is the approved contact channel; no postal/email/phone is invented.
 */
export const LOAD_COMPANY = Object.freeze({
  name:"Hephzibah Behulah",
  division:"HB Artificial Intelligence",
  product:"AdigunTokenCalculator",
  website:"https://hephzibahbehulah.com/",
  logoPath:"assets/hephzibah-behulah-official.jpg",
  logoUrl:new URL("../../assets/hephzibah-behulah-official.jpg", import.meta.url).href,
  sources:Object.freeze([
    Object.freeze({repository:"HephzibahBehulahHQ/HephzibahBehulahHQ.github.io", commit:"bd116504412b37105166805018f64a6e7bbe3cde", path:"README.md"}),
    Object.freeze({repository:"HephzibahBehulahHQ/hb-design-system", commit:"52f01f9986d97088413ca9785bc7a2d3f2967123", path:"docs/brand-and-product-naming.md"})
  ])
});
