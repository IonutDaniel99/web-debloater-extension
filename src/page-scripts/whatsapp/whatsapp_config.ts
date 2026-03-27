import { SiteConfig } from "../scripts";

/**
 * WHATSAPP CONFIG
 * 
 * Most WhatsApp scripts have been migrated to data-driven architecture.
 * Only complex bundled scripts remain here.
 * See: config/scripts-config.json
 */
export const WHATSAPP_CONFIG: SiteConfig = {
  id: "whatsapp",
  name: "WhatsApp",
  urlPatternBase: "web\\.whatsapp\\.com",
  defaultScripts: [
    {
      id: "privacyBlurControls",
      name: "Privacy Blur Controls",
      description: "Add privacy blur controls to WhatsApp Web interface (blur profile photos, sidebar content, and chat messages)",
      scriptPath: "whatsapp/add/privacyBlurControls.js",
      defaultEnabled: false,
      type: "enhancement",
    },
  ],
  pathScripts: [],
};
