import { SiteConfig } from "../scripts";

/**
 * WHATSAPP CONFIG
 */
export const WHATSAPP_CONFIG: SiteConfig = {
  id: "whatsapp",
  name: "WhatsApp",
  urlPatternBase: "web\\.whatsapp\\.com",
  defaultScripts: [
    {
      id: "removeGetWhatsappForWindows",
      name: "Remove \"Get WhatsApp for Windows\"",
      description: "Remove the \"Get WhatsApp for Windows\" promotional element from WhatsApp Web",
      scriptPath: "whatsapp/remove/getWhatsappForWindows.js",
      defaultEnabled: false,
      type: "removal",
    },
    {
      id: "privacyBlurControls",
      name: "Privacy Blur Controls",
      description: "Add privacy blur controls to WhatsApp Web interface (blur profile photos, sidebar content, and chat messages)",
      scriptPath: "whatsapp/add/privacyBlurControls.js",
      defaultEnabled: false,
      type: "enhancement",
    },
  ],
  pathScripts: [
    // Add path-specific scripts here
  ],
};
