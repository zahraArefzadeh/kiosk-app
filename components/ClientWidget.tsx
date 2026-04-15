'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation'; // <--- 1. Import this
import WidgetButton from './WidgetButton';
import WidgetPanel from './WidgetPanel';

export default function ClientWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // <--- 2. Get current path

  // --- 3. LOGIC TO HIDE WIDGET ON TEST PAGES ---
  // اگر مسیر با /test شروع می‌شود، ویجت را کلا رندر نکن (return null)
  if (pathname && pathname.startsWith('/test')) {
    return null;
  }

  const handleWidgetClick = () => {
    setIsOpen(true);
  };

  const handlePanelClose = () => {
    setIsOpen(false);
  };

  // Prevent body scroll when panel is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Broadcast resize to parent iframe container
  useEffect(() => {
    const buttonSize = 105;
    const panelWidth = 470;
    const panelHeight = 700;

    // Check if window exists (client-side) before posting message
    if (typeof window !== 'undefined') {
        window.parent.postMessage({
        type: 'widgetResize',
        width: isOpen ? panelWidth : buttonSize,
        height: isOpen ? panelHeight : buttonSize
        }, '*');
    }
  }, [isOpen]);

  return (
    <>
      <WidgetButton
        onClick={handleWidgetClick}
        isOpen={isOpen}
      />
      
      {isOpen && (
        <WidgetPanel
          isOpen={isOpen}
          onClose={handlePanelClose}
        />
      )}
    </>
  );
}
