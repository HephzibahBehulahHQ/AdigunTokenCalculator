import test from "node:test";
import assert from "node:assert/strict";
import {access} from "node:fs/promises";
import {LOAD_COMPANY} from "../src/data/loadCompany.js";

test("load company: approved identity and existing logo are inherited without invented contact fields", async () => {
  assert.equal(LOAD_COMPANY.name, "Hephzibah Behulah");
  assert.equal(LOAD_COMPANY.division, "HB Artificial Intelligence");
  assert.equal(LOAD_COMPANY.product, "AdigunTokenCalculator");
  assert.equal(LOAD_COMPANY.website, "https://hephzibahbehulah.com/");
  assert.equal(LOAD_COMPANY.logoPath, "assets/hephzibah-behulah-official.jpg");
  assert.equal(LOAD_COMPANY.logoUrl, new URL("../assets/hephzibah-behulah-official.jpg", import.meta.url).href);
  await access(new URL(LOAD_COMPANY.logoUrl));
  for (const field of ["email", "phone", "address"]) assert.equal(Object.hasOwn(LOAD_COMPANY, field), false);
});

test("load company: identity and source provenance are immutable and pinned to reviewed commits", () => {
  assert.ok(Object.isFrozen(LOAD_COMPANY));
  assert.ok(Object.isFrozen(LOAD_COMPANY.sources));
  assert.ok(LOAD_COMPANY.sources.every(Object.isFrozen));
  assert.deepEqual(LOAD_COMPANY.sources, [
    {repository:"HephzibahBehulahHQ/HephzibahBehulahHQ.github.io", commit:"bd116504412b37105166805018f64a6e7bbe3cde", path:"README.md"},
    {repository:"HephzibahBehulahHQ/hb-design-system", commit:"52f01f9986d97088413ca9785bc7a2d3f2967123", path:"docs/brand-and-product-naming.md"}
  ]);
  assert.throws(() => {LOAD_COMPANY.name = "Replacement";}, TypeError);
  assert.throws(() => {LOAD_COMPANY.sources[0].commit = "main";}, TypeError);
});
