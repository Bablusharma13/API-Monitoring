/* eslint-disable no-unused-vars */
"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * PortalWrapper - A reusable wrapper component for React portals
 * Handles portal creation, positioning, outside click detection, and cleanup
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to render in portal
 * @param {boolean} props.isOpen - Controls portal visibility
 * @param {Function} props.onClose - Callback when portal should close (outside click/escape)
 * @param {HTMLElement|string} props.container - Portal target (default: document.body)
 * @param {Object} props.position - Fixed position { top, left } (optional)
 * @param {string} props.className - Additional CSS classes (only applied if wrapper=true)
 * @param {Object} props.style - Additional inline styles (only applied if wrapper=true)
 * @param {React.Ref} props.contentRef - Ref to portal content element
 * @param {React.Ref} props.referenceRef - Ref to reference element (for outside click detection)
 * @param {boolean} props.closeOnOutsideClick - Enable outside click closing (default: true)
 * @param {boolean} props.closeOnEscape - Enable escape key closing (default: true)
 * @param {boolean} props.wrapper - Wrap children in a div (default: true)
 * @param {string} props.as - HTML tag to use as wrapper when wrapper=true (default: 'div')
 */
const PortalWrapper = ({
  children,
  isOpen = false,
  onClose,
  container = typeof document !== "undefined" ? document.body : null,
  position,
  className = "",
  style = {},
  contentRef,
  referenceRef,
  closeOnOutsideClick = true,
  closeOnEscape = true,
  wrapper = true,
  as: WrapperTag = "div",
}) => {
  const portalContentRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !container) return;

    const contentElement = contentRef?.current || portalContentRef.current;

    const handleClickOutside = (event) => {
      if (!closeOnOutsideClick || !contentElement) return;

      const isClickInsideContent = contentElement?.contains(event.target);
      const isClickOnReference =
        referenceRef?.current?.contains(event.target);

      if (!isClickInsideContent && !isClickOnReference && onClose) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (closeOnEscape && event.key === "Escape" && onClose) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [
    isOpen,
    container,
    onClose,
    contentRef,
    referenceRef,
    closeOnOutsideClick,
    closeOnEscape,
  ]);

  if (!isOpen || !container) return null;

  const mergedRef = (node) => {
    if (contentRef) {
      if (typeof contentRef === "function") {
        contentRef(node);
      } else {
        contentRef.current = node;
      }
    }
    portalContentRef.current = node;
  };

  const portalContent = wrapper ? (
    <WrapperTag
      ref={mergedRef}
      className={className}
      style={{
        ...style,
        ...(position && {
          position: "fixed",
          top: `${position.top}px`,
          left: `${position.left}px`,
        }),
      }}
    >
      {children}
    </WrapperTag>
  ) : (
    <div ref={mergedRef} style={{ display: "contents" }}>
      {children}
    </div>
  );

  return createPortal(portalContent, container);
};

export default PortalWrapper;

