/**
 * Privacy Blur Controls
 * Adds privacy blur controls to WhatsApp Web interface
 * 
 * This script only runs if enabled in extension settings.
 * Requires: core/dom-utils.ts to be injected first
 */

/// <reference path="../../../core/dom-utils.ts" />

(function() {
  'use strict';

  const APP_NAME = 'WhatsApp';
  const SCRIPT_ID = 'privacyBlurControls';
  const HEADER_SELECTOR = '#app > div > div > div.x78zum5.xdt5ytf.x5yr21d > div > header > div';
  
  // Selectors for different blur features
  const PROFILE_PHOTO_SELECTOR = '.x1n2onr6.x1lliihq.xh8yej3.x5yr21d.x6ikm8r.x10wlt62.x1c9tyrk.xeusxvb.x1pahc9y.x1ertn4p.xl1xv1r.x115dhu7.x17vty23.x1hc1fzr.x4u6w88.x1g40iwv._ao3e';
  const SIDEBAR_CHAT_ITEM_SELECTOR = '#pane-side > div:nth-child(2) > div > div > div > div > div > div > div._ak8l._ap1_';
  const CHAT_MESSAGE_SELECTOR = '._akbu.x6ikm8r.x10wlt62';
  const CHAT_IMAGE_SELECTOR = '.x10l6tqk.x1hhq9f1.x1ezo4zr.x1vjfegm.x1okw0bk.xh8yej3.x5yr21d.x121ad3m.x1y2vyrr.x1qp9xe7.xeykx7r.xztyhrg.x18d0r48.x127lhb5.x4afe7t.xa3vuyk.x10e4vud'; // Scoped to #main to avoid blurring everything
  const CHAT_HEADER_NAME_SELECTOR = '#main .x78zum5.x1q0g3np.x6ikm8r.x10wlt62.x1jchvi3.xdod15v.x14ug900.x1yc453h.xlyipyv.xuxw1ft.xh8yej3.x1s688f.x1c4vz4f.x2lah0s.xdl72j9';
  const CHAT_METADATA_SELECTOR = '#main .x78zum5.x1cy8zhl.xeuugli.xisnujt.x1nxh6w3.xcgms0a.xhslqc4'; // Group members & last seen
  const CHAT_NAME_IN_MESSAGE_SELECTOR = '#main ._ahxj._ahxz.x78zum5.xijeqtt'; // Chat name in messages

  // SVG Icon Library - Easy to extend!
  const SVG_ICONS: Record<string, string> = {
    'eye-slash': 'M12 6.5c3.79 0 7.17 2.13 8.82 5.5-.59 1.22-1.42 2.27-2.41 3.12l1.41 1.41c1.39-1.23 2.49-2.77 3.18-4.53C21.27 7.11 17 4 12 4c-1.27 0-2.49.2-3.64.57l1.65 1.65C10.66 6.09 11.32 6 12 6zm-1.07 1.14L13 9.71c.57.25 1.03.71 1.28 1.28l2.07 2.07c.08-.34.14-.7.14-1.07C16.5 9.01 14.48 7 12 7c-.37 0-.72.05-1.07.14zM2.01 3.87l2.68 2.68C3.06 7.83 1.77 9.53 1 11.5 2.73 16.39 7 19.5 12 19.5c1.52 0 2.98-.29 4.32-.82l3.42 3.42 1.41-1.41L3.42 2.45 2.01 3.87zm7.5 7.5l2.61 2.61c-.04.01-.08.02-.12.02-1.38 0-2.5-1.12-2.5-2.5 0-.05.01-.08.01-.13zm-3.4-3.4l1.75 1.75c-.23.55-.36 1.15-.36 1.78 0 2.48 2.02 4.5 4.5 4.5.63 0 1.23-.13 1.77-.36l.98.98c-.88.24-1.8.38-2.75.38-3.79 0-7.17-2.13-8.82-5.5.7-1.43 1.72-2.61 2.93-3.53z',
    'sidebar-blur': 'M3 4h18c.55 0 1 .45 1 1v14c0 .55-.45 1-1 1H3c-.55 0-1-.45-1-1V5c0-.55.45-1 1-1zm1 2v12h7V6H4zm9 0v12h7V6h-7z',
    'chat-blur': 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12zM7 9h10v2H7V9zm0-3h10v2H7V6z',
    'blur-all': 'M11.0714 0.652832C10.991 0.585124 10.8894 0.55127 10.7667 0.55127C10.6186 0.55127 10.4916 0.610514 10.3858 0.729004L4.19688 8.36523L1.79112 6.09277C1.7488 6.04622 1.69802 6.01025 1.63877 5.98486C1.57953 5.95947 1.51817 5.94678 1.45469 5.94678C1.32351 5.94678 1.20925 5.99544 1.11192 6.09277L0.800883 6.40381C0.707784 6.49268 0.661235 6.60482 0.661235 6.74023C0.661235 6.87565 0.707784 6.98991 0.800883 7.08301L3.79698 10.0791C3.94509 10.2145 4.11224 10.2822 4.29844 10.2822C4.40424 10.2822 4.5058 10.259 4.60313 10.2124C4.70046 10.1659 4.78086 10.1003 4.84434 10.0156L11.4903 1.59863C11.5623 1.5013 11.5982 1.40186 11.5982 1.30029C11.5982 1.14372 11.5348 1.01888 11.4078 0.925781L11.0714 0.652832ZM8.6212 8.32715C8.43077 8.20866 8.2488 8.09017 8.0753 7.97168C7.99489 7.89128 7.8891 7.85107 7.75791 7.85107C7.6098 7.85107 7.4892 7.90397 7.3961 8.00977L7.10411 8.33984C7.01947 8.43717 6.97715 8.54508 6.97715 8.66357C6.97715 8.79476 7.0237 8.90902 7.1168 9.00635L8.1959 10.0791C8.33132 10.2145 8.49636 10.2822 8.69102 10.2822C8.79681 10.2822 8.89838 10.259 8.99571 10.2124C9.09304 10.1659 9.17556 10.1003 9.24327 10.0156L15.8639 1.62402C15.9358 1.53939 15.9718 1.43994 15.9718 1.32568C15.9718 1.1818 15.9125 1.05697 15.794 0.951172L15.4386 0.678223C15.3582 0.610514 15.2587 0.57666 15.1402 0.57666C14.9964 0.57666 14.8715 0.635905 14.7657 0.754395L8.6212 8.32715Z',
    // Add your custom SVG paths here!
    // 'custom-icon': 'd="M..."',
  };

  // Custom viewBox for icons that need different dimensions
  const SVG_VIEWBOXES: Record<string, string> = {
    'blur-all': '0 0 16 11', // Double-check icon has smaller coordinate range
  };

  console.log(`[${APP_NAME}][${SCRIPT_ID}] Initializing...`);
  
  // Wait for shared utilities to be available
  if (!window.Debloater) {
    console.error(`[${APP_NAME}][${SCRIPT_ID}] Debloater utilities not loaded!`);
    return;
  }

  // State tracking
  let isProfilePhotosBlurred = false;
  let isSidebarBlurred = false;
  let isChatBlurred = false;
  let profilePhotoObserver: MutationObserver | null = null;
  let sidebarObserver: MutationObserver | null = null;
  let chatObserver: MutationObserver | null = null;

  // Wait for header element
  window.Debloater.waitForElement(HEADER_SELECTOR)
    .then(() => {
      injectBlurControls();
    })
    .catch((error) => {
      console.error(`[${APP_NAME}][${SCRIPT_ID}] Header element not found:`, error);
    });

  function injectBlurControls() {
    const header = document.querySelector(HEADER_SELECTOR);
    if (!header) {
      console.error(`[${APP_NAME}][${SCRIPT_ID}] Header not found`);
      return;
    }

    // Check if controls already exist (prevent duplicates)
    if (document.getElementById('blur-controls-container')) {
      console.log(`[${APP_NAME}][${SCRIPT_ID}] Controls already injected, skipping`);
      return;
    }

    // Apply CSS to header container
    const headerElement = header as HTMLElement;
    headerElement.style.height = '100%';
    headerElement.style.display = 'flex';
    headerElement.style.justifyContent = 'space-between';

    // Disable flex-grow on first child
    const firstChild = header.children[0] as HTMLElement;
    if (firstChild) {
      firstChild.style.flexGrow = '0';
    }

    // Create blur controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'blur-controls-container';
    controlsContainer.className = 'x1c4vz4f xs83m0k xdl72j9 x1g77sc7 x78zum5 xozqiw3 x1oa3qoh x12fk4p8 xeuugli x2lwn1j x1nhvcw1 x1q0g3np x6s0dn4';
    controlsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px 0;
      width: 100%;
    `;

    // Create "Blur User Profile Photos" button
    const blurProfileBtn = createBlurButton(
      'eye-slash',
      'Toggle blur on user profile photos',
      toggleProfilePhotosBlur,
      'blur-profile'
    );

    // Create "Blur Sidebar" button
    const blurSidebarBtn = createBlurButton(
      'sidebar-blur',
      'Blur usernames and messages in sidebar',
      toggleSidebarBlur,
      'blur-sidebar'
    );

    // Create "Blur Chat" button
    const blurChatBtn = createBlurButton(
      'chat-blur',
      'Blur chat messages, names, and metadata',
      toggleChatBlur,
      'blur-chat'
    );

    // Create "Blur All" button
    const blurAllBtn = createBlurButton(
      'blur-all',
      'Enable all blur features',
      toggleBlurAll,
      'blur-all-btn'
    );

    // Add buttons to container
    controlsContainer.appendChild(blurProfileBtn);
    controlsContainer.appendChild(blurSidebarBtn);
    controlsContainer.appendChild(blurChatBtn);
    controlsContainer.appendChild(blurAllBtn);

    // Insert at position 1 (after position 0, before position 2)
    if (header.children.length >= 2) {
      header.insertBefore(controlsContainer, header.children[1]);
    } else {
      header.appendChild(controlsContainer);
    }

    console.log(`[${APP_NAME}][${SCRIPT_ID}] Blur controls injected successfully`);
  }

  function createBlurButton(iconType: string, title: string, onClick: () => void, buttonId: string, disabled = false) {
    // Create span wrapper (matching WhatsApp structure)
    const span = document.createElement('span');
    span.className = 'html-span xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x1hl2dhg x16tdsg8 x1vvkbs x4k7w5x x1h91t0o x1h9r5lt x1jfb8zj xv2umb2 x1beo9mf xaigb6o x12ejxvf x3igimt xarpa2k xedcshv x1lytzrv x1t2pt76 x7ja8zs x1qrby5j';
    
    // Create button
    const button = document.createElement('button');
    button.id = buttonId;
    button.title = title;
    button.className = 'xjb2p0i xk390pu x1heor9g x1ypdohk xjbqb8w x972fbf x10w94by x1qhh985 x14e42zd xtnn1bt x9v5kkp xmw7ebm xrdum7p xt8t1vi x1xc408v x129tdwq x15urzxu xh8yej3 x1y1aw1k xf159sx xwib8y2 xmzvs34';
    button.setAttribute('tabindex', '-1');
    button.setAttribute('aria-label', title);
    button.style.cssText = `
      opacity: ${disabled ? '0.3' : '1'};
      cursor: ${disabled ? 'not-allowed' : 'pointer'};
    `;
    
    // Create inner div structure
    const outerDiv = document.createElement('div');
    outerDiv.className = 'x1c4vz4f xs83m0k xdl72j9 x1g77sc7 x78zum5 xozqiw3 x1oa3qoh x12fk4p8 xeuugli x2lwn1j x1nhvcw1 x1q0g3np x6s0dn4 xh8yej3';
    
    const innerDiv = document.createElement('div');
    innerDiv.className = 'x1c4vz4f xs83m0k xdl72j9 x1g77sc7 x78zum5 xozqiw3 x1oa3qoh x12fk4p8 xeuugli x2lwn1j x1nhvcw1 x1q0g3np x6s0dn4 x1n2onr6';
    innerDiv.style.flexGrow = '1';
    
    const iconDiv = document.createElement('div');
    
    // Create SVG icon
    const iconSpan = document.createElement('span');
    iconSpan.setAttribute('aria-hidden', 'true');
    iconSpan.setAttribute('data-icon', iconType);
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    // Use custom viewBox if defined, otherwise default to 24x24
    const viewBox = SVG_VIEWBOXES[iconType] || '0 0 24 24';
    svg.setAttribute('viewBox', viewBox);
    svg.setAttribute('height', '24');
    svg.setAttribute('width', '24');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('fill', 'none');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', 'currentColor');
    
    // Get SVG path from icon library (extensible design!)
    const iconPath = SVG_ICONS[iconType];
    if (iconPath) {
      path.setAttribute('d', iconPath);
    } else {
      console.warn(`[${APP_NAME}][${SCRIPT_ID}] Icon '${iconType}' not found in SVG_ICONS library`);
      // Fallback to a default icon
      path.setAttribute('d', SVG_ICONS['blur-all']);
    }
    
    svg.appendChild(path);
    iconSpan.appendChild(svg);
    iconDiv.appendChild(iconSpan);
    innerDiv.appendChild(iconDiv);
    outerDiv.appendChild(innerDiv);
    button.appendChild(outerDiv);
    span.appendChild(button);
    
    // Add click handler
    if (!disabled) {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        onClick();
        
        // Toggle active state
        const isActive = button.getAttribute('aria-pressed') === 'true';
        button.setAttribute('aria-pressed', isActive ? 'false' : 'true');
        
        if (!isActive) {
          button.style.backgroundColor = 'var(--navbar-item-active-background, rgba(0, 168, 132, 0.15))';
        } else {
          button.style.backgroundColor = '';
        }
      });
      
      // Hover effects
      button.addEventListener('mouseenter', () => {
        if (button.getAttribute('aria-pressed') !== 'true') {
          button.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        }
      });
      
      button.addEventListener('mouseleave', () => {
        if (button.getAttribute('aria-pressed') !== 'true') {
          button.style.backgroundColor = '';
        }
      });
    }
    
    return span;
  }

  function toggleProfilePhotosBlur() {
    isProfilePhotosBlurred = !isProfilePhotosBlurred;
    
    if (isProfilePhotosBlurred) {
      applyProfilePhotosBlur();
      console.log(`[${APP_NAME}][${SCRIPT_ID}] Profile photos blur enabled`);
    } else {
      removeProfilePhotosBlur();
      console.log(`[${APP_NAME}][${SCRIPT_ID}] Profile photos blur disabled`);
    }
  }

  function applyProfilePhotosBlur() {
    const profilePhotos = document.querySelectorAll(PROFILE_PHOTO_SELECTOR);
    
    profilePhotos.forEach((photo) => {
      const element = photo as HTMLElement;
      
      // Apply blur
      element.style.filter = 'blur(4px)';
      element.style.transition = 'filter 0.2s ease';
      element.setAttribute('data-blur-enabled', 'true');
      
      // Add hover listeners
      const mouseEnterHandler = () => {
        if (element.getAttribute('data-blur-enabled') === 'true') {
          element.style.filter = 'blur(0px)';
        }
      };
      
      const mouseLeaveHandler = () => {
        if (element.getAttribute('data-blur-enabled') === 'true') {
          element.style.filter = 'blur(4px)';
        }
      };
      
      element.addEventListener('mouseenter', mouseEnterHandler);
      element.addEventListener('mouseleave', mouseLeaveHandler);
      
      // Store handlers for cleanup
      (element as any).__blurHandlers = { mouseEnterHandler, mouseLeaveHandler };
    });

    // Observe for new profile photos (dynamic content)
    observeForNewProfilePhotos();
  }

  function removeProfilePhotosBlur() {
    const profilePhotos = document.querySelectorAll(PROFILE_PHOTO_SELECTOR);
    
    profilePhotos.forEach((photo) => {
      const element = photo as HTMLElement;
      
      // Remove blur
      element.style.filter = '';
      element.removeAttribute('data-blur-enabled');
      
      // Remove event listeners
      const handlers = (element as any).__blurHandlers;
      if (handlers) {
        element.removeEventListener('mouseenter', handlers.mouseEnterHandler);
        element.removeEventListener('mouseleave', handlers.mouseLeaveHandler);
        delete (element as any).__blurHandlers;
      }
    });

    // Stop observing
    if (profilePhotoObserver) {
      profilePhotoObserver.disconnect();
      profilePhotoObserver = null;
    }
  }

  function observeForNewProfilePhotos() {
    // Disconnect existing observer if any
    if (profilePhotoObserver) {
      profilePhotoObserver.disconnect();
    }

    profilePhotoObserver = new MutationObserver(() => {
      if (isProfilePhotosBlurred) {
        const newPhotos = document.querySelectorAll(PROFILE_PHOTO_SELECTOR);
        newPhotos.forEach((photo) => {
          const element = photo as HTMLElement;
          
          // Only apply to photos that don't have blur enabled yet
          if (!element.getAttribute('data-blur-enabled')) {
            element.style.filter = 'blur(4px)';
            element.style.transition = 'filter 0.2s ease';
            element.setAttribute('data-blur-enabled', 'true');
            
            const mouseEnterHandler = () => {
              if (element.getAttribute('data-blur-enabled') === 'true') {
                element.style.filter = 'blur(0px)';
              }
            };
            
            const mouseLeaveHandler = () => {
              if (element.getAttribute('data-blur-enabled') === 'true') {
                element.style.filter = 'blur(4px)';
              }
            };
            
            element.addEventListener('mouseenter', mouseEnterHandler);
            element.addEventListener('mouseleave', mouseLeaveHandler);
            
            (element as any).__blurHandlers = { mouseEnterHandler, mouseLeaveHandler };
          }
        });
      }
    });

    profilePhotoObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // ============================================
  // SIDEBAR BLUR IMPLEMENTATION
  // ============================================

  function toggleSidebarBlur() {
    isSidebarBlurred = !isSidebarBlurred;
    
    if (isSidebarBlurred) {
      applySidebarBlur();
      console.log(`[${APP_NAME}][${SCRIPT_ID}] Sidebar blur enabled`);
    } else {
      removeSidebarBlur();
      console.log(`[${APP_NAME}][${SCRIPT_ID}] Sidebar blur disabled`);
    }
  }

  function applySidebarBlur() {
    const sidebarItems = document.querySelectorAll(SIDEBAR_CHAT_ITEM_SELECTOR);
    
    sidebarItems.forEach((item) => {
      const element = item as HTMLElement;
      
      // Apply blur
      element.style.filter = 'blur(4px)';
      element.style.transition = 'filter 0.2s ease';
      element.setAttribute('data-sidebar-blur', 'true');
      
      // Add hover listeners
      const mouseEnterHandler = () => {
        if (element.getAttribute('data-sidebar-blur') === 'true') {
          element.style.filter = 'blur(0px)';
        }
      };
      
      const mouseLeaveHandler = () => {
        if (element.getAttribute('data-sidebar-blur') === 'true') {
          element.style.filter = 'blur(4px)';
        }
      };
      
      element.addEventListener('mouseenter', mouseEnterHandler);
      element.addEventListener('mouseleave', mouseLeaveHandler);
      
      // Store handlers for cleanup
      (element as any).__sidebarBlurHandlers = { mouseEnterHandler, mouseLeaveHandler };
    });

    // Observe for new sidebar items
    observeForNewSidebarItems();
  }

  function removeSidebarBlur() {
    const sidebarItems = document.querySelectorAll(SIDEBAR_CHAT_ITEM_SELECTOR);
    
    sidebarItems.forEach((item) => {
      const element = item as HTMLElement;
      
      // Remove blur
      element.style.filter = '';
      element.removeAttribute('data-sidebar-blur');
      
      // Remove event listeners
      const handlers = (element as any).__sidebarBlurHandlers;
      if (handlers) {
        element.removeEventListener('mouseenter', handlers.mouseEnterHandler);
        element.removeEventListener('mouseleave', handlers.mouseLeaveHandler);
        delete (element as any).__sidebarBlurHandlers;
      }
    });

    // Stop observing
    if (sidebarObserver) {
      sidebarObserver.disconnect();
      sidebarObserver = null;
    }
  }

  function observeForNewSidebarItems() {
    if (sidebarObserver) {
      sidebarObserver.disconnect();
    }

    sidebarObserver = new MutationObserver(() => {
      if (isSidebarBlurred) {
        const newItems = document.querySelectorAll(SIDEBAR_CHAT_ITEM_SELECTOR);
        newItems.forEach((item) => {
          const element = item as HTMLElement;
          
          if (!element.getAttribute('data-sidebar-blur')) {
            element.style.filter = 'blur(4px)';
            element.style.transition = 'filter 0.2s ease';
            element.setAttribute('data-sidebar-blur', 'true');
            
            const mouseEnterHandler = () => {
              if (element.getAttribute('data-sidebar-blur') === 'true') {
                element.style.filter = 'blur(0px)';
              }
            };
            
            const mouseLeaveHandler = () => {
              if (element.getAttribute('data-sidebar-blur') === 'true') {
                element.style.filter = 'blur(4px)';
              }
            };
            
            element.addEventListener('mouseenter', mouseEnterHandler);
            element.addEventListener('mouseleave', mouseLeaveHandler);
            
            (element as any).__sidebarBlurHandlers = { mouseEnterHandler, mouseLeaveHandler };
          }
        });
      }
    });

    sidebarObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // ============================================
  // CHAT BLUR IMPLEMENTATION
  // ============================================

  function toggleChatBlur() {
    isChatBlurred = !isChatBlurred;
    
    if (isChatBlurred) {
      applyChatBlur();
      console.log(`[${APP_NAME}][${SCRIPT_ID}] Chat blur enabled`);
    } else {
      removeChatBlur();
      console.log(`[${APP_NAME}][${SCRIPT_ID}] Chat blur disabled`);
    }
  }

  function applyChatBlur() {
    applyBlurToElements(CHAT_MESSAGE_SELECTOR, 'data-chat-msg-blur', '4px');
    applyBlurToElements(CHAT_IMAGE_SELECTOR, 'data-chat-img-blur', '16px');
    applyBlurToElements(CHAT_HEADER_NAME_SELECTOR, 'data-chat-name-blur', '4px');
    applyBlurToElements(CHAT_METADATA_SELECTOR, 'data-chat-meta-blur', '4px');
    applyBlurToElements(CHAT_NAME_IN_MESSAGE_SELECTOR, 'data-chat-msgname-blur', '4px');

    // Observe for new chat content
    observeForNewChatContent();
  }

  function removeChatBlur() {
    removeBlurFromElements(CHAT_MESSAGE_SELECTOR, 'data-chat-msg-blur');
    removeBlurFromElements(CHAT_IMAGE_SELECTOR, 'data-chat-img-blur');
    removeBlurFromElements(CHAT_HEADER_NAME_SELECTOR, 'data-chat-name-blur');
    removeBlurFromElements(CHAT_METADATA_SELECTOR, 'data-chat-meta-blur');
    removeBlurFromElements(CHAT_NAME_IN_MESSAGE_SELECTOR, 'data-chat-msgname-blur');

    // Stop observing
    if (chatObserver) {
      chatObserver.disconnect();
      chatObserver = null;
    }
  }

  function applyBlurToElements(selector: string, dataAttr: string, blurAmount: string) {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach((el) => {
      const element = el as HTMLElement;
      
      // Skip if already blurred
      if (element.getAttribute(dataAttr)) return;
      
      // Apply blur
      element.style.filter = `blur(${blurAmount})`;
      element.style.transition = 'filter 0.2s ease';
      element.setAttribute(dataAttr, 'true');
      
      // Add hover listeners
      const mouseEnterHandler = () => {
        if (element.getAttribute(dataAttr) === 'true') {
          element.style.filter = 'blur(0px)';
        }
      };
      
      const mouseLeaveHandler = () => {
        if (element.getAttribute(dataAttr) === 'true') {
          element.style.filter = `blur(${blurAmount})`;
        }
      };
      
      element.addEventListener('mouseenter', mouseEnterHandler);
      element.addEventListener('mouseleave', mouseLeaveHandler);
      
      // Store handlers for cleanup
      (element as any).__chatBlurHandlers = { mouseEnterHandler, mouseLeaveHandler };
    });
  }

  function removeBlurFromElements(selector: string, dataAttr: string) {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach((el) => {
      const element = el as HTMLElement;
      
      // Remove blur
      element.style.filter = '';
      element.removeAttribute(dataAttr);
      
      // Remove event listeners
      const handlers = (element as any).__chatBlurHandlers;
      if (handlers) {
        element.removeEventListener('mouseenter', handlers.mouseEnterHandler);
        element.removeEventListener('mouseleave', handlers.mouseLeaveHandler);
        delete (element as any).__chatBlurHandlers;
      }
    });
  }

  function observeForNewChatContent() {
    if (chatObserver) {
      chatObserver.disconnect();
    }

    chatObserver = new MutationObserver(() => {
      if (isChatBlurred) {
        applyBlurToElements(CHAT_MESSAGE_SELECTOR, 'data-chat-msg-blur', '4px');
        applyBlurToElements(CHAT_IMAGE_SELECTOR, 'data-chat-img-blur', '16px');
        applyBlurToElements(CHAT_HEADER_NAME_SELECTOR, 'data-chat-name-blur', '4px');
        applyBlurToElements(CHAT_METADATA_SELECTOR, 'data-chat-meta-blur', '4px');
        applyBlurToElements(CHAT_NAME_IN_MESSAGE_SELECTOR, 'data-chat-msgname-blur', '4px');
      }
    });

    chatObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // ============================================
  // BLUR ALL IMPLEMENTATION
  // ============================================

  function toggleBlurAll() {
    const targetState = !isProfilePhotosBlurred || !isSidebarBlurred || !isChatBlurred;
    
    if (targetState) {
      // Enable all
      if (!isProfilePhotosBlurred) toggleProfilePhotosBlur();
      if (!isSidebarBlurred) toggleSidebarBlur();
      if (!isChatBlurred) toggleChatBlur();
      
      // Update button states
      updateButtonState('blur-profile', true);
      updateButtonState('blur-sidebar', true);
      updateButtonState('blur-chat', true);
      
      console.log(`[${APP_NAME}][${SCRIPT_ID}] All blur features enabled`);
    } else {
      // Disable all
      if (isProfilePhotosBlurred) toggleProfilePhotosBlur();
      if (isSidebarBlurred) toggleSidebarBlur();
      if (isChatBlurred) toggleChatBlur();
      
      // Update button states
      updateButtonState('blur-profile', false);
      updateButtonState('blur-sidebar', false);
      updateButtonState('blur-chat', false);
      
      console.log(`[${APP_NAME}][${SCRIPT_ID}] All blur features disabled`);
    }
  }

  function updateButtonState(buttonId: string, isActive: boolean) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      if (isActive) {
        button.style.backgroundColor = 'var(--navbar-item-active-background, rgba(0, 168, 132, 0.15))';
      } else {
        button.style.backgroundColor = '';
      }
    }
  }

  console.log(`[${APP_NAME}][${SCRIPT_ID}] Active`);
})();
