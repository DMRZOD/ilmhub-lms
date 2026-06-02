/**
 * Test stub for `puppeteer` (an ESM-only, very heavy dependency). Certificate
 * PDF generation is never exercised by the e2e HTTP flows, so a no-op launcher
 * keeps AppModule loadable under Jest without transforming puppeteer-core.
 */
const page = {
  setContent: async () => undefined,
  pdf: async () => Buffer.from(''),
  emulateMediaType: async () => undefined,
  close: async () => undefined,
};

const browser = {
  newPage: async () => page,
  close: async () => undefined,
};

const puppeteer = {
  launch: async () => browser,
};

export default puppeteer;
