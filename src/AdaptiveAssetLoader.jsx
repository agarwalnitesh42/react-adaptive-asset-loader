// src/AdaptiveAssetLoader.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getNetworkSpeed,
  prioritizeAssets,
  loadAsset,
  checkCSRF
} from './utils';
import './styles.css';

// Component to intelligently load assets with adaptive prioritization
const AdaptiveAssetLoader = ({ src, type = 'image', priority = 1, debug = false }) => {
  // State to manage loading status, network speed, and debug info
  const [isLoading, setIsLoading] = useState(true); // Tracks if asset is loading
  const [networkSpeed, setNetworkSpeed] = useState('unknown'); // Stores network speed
  const [debugInfo, setDebugInfo] = useState(''); // Debug output for developers

  // Memoized reference to the asset element for DOM manipulation
  const assetRef = useMemo(() => React.createRef(), []);

  // Effect to initialize network speed and set up event listeners
  useEffect(() => {
    // Check CSRF token for security (prevents unauthorized requests)
    const csrfToken = checkCSRF();
    if (!csrfToken) {
      console.warn('CSRF protection weak; consider adding a meta tag with a token.');
    }

    // Update network speed on mount and when connection changes
    const speed = getNetworkSpeed();
    setNetworkSpeed(speed);

    // Listen for scroll events to update priority
    const handleScroll = () => {
      if (assetRef.current) {
        const queue = prioritizeAssets([assetRef.current]);
        setDebugInfo(debug ? `Priority: ${queue[0].priority}` : '');
        if (queue[0].priority > 50 && isLoading) { // High priority triggers load
          loadAsset(assetRef.current, speed);
          setIsLoading(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true }); // Passive for performance
    return () => window.removeEventListener('scroll', handleScroll); // Cleanup
  }, [assetRef, isLoading, debug]); // Dependency array for effect

  // Memoized callback to handle asset loading
  const handleLoad = useCallback(() => {
    if (assetRef.current && isLoading) {
      const sanitizedSrc = src.replace(/[<>]/g, '').replace(/javascript:/gi, ''); // Sanitize to prevent XSS
      assetRef.current.dataset.src = sanitizedSrc; // Store sanitized src
      loadAsset(assetRef.current, networkSpeed); // Load with adaptive quality
      setIsLoading(false); // Mark as loaded
    }
  }, [assetRef, isLoading, networkSpeed, src]);

  // Render different elements based on type
  const renderAsset = () => {
    if (type === 'image') {
      return (
        <img
          ref={assetRef}
          alt="Adaptive loaded"
          className={isLoading ? 'loading-placeholder' : 'loaded'}
          onLoad={handleLoad}
          style={{ display: isLoading ? 'none' : 'block' }}
        />
      );
    } else if (type === 'script') {
      return <span ref={assetRef} data-src={src} className={isLoading ? '' : 'loaded'} />;
    }
    return null;
  };

  return (
    <div className="asset-loader">
      {renderAsset()}
      {debug && <div className="debug-info">{debugInfo} | Network: {networkSpeed}</div>}
      {isLoading && <div className="loading-placeholder">Loading...</div>}
    </div>
  );
};

// PropTypes for type checking (optional but best practice)
AdaptiveAssetLoader.propTypes = {
  src: (props, propName) => {
    if (!props[propName] || typeof props[propName] !== 'string') {
      return new Error('src is required and must be a string');
    }
    return null;
  },
  type: (props, propName) => {
    if (props[propName] && !['image', 'script'].includes(props[propName])) {
      return new Error('type must be "image" or "script"');
    }
    return null;
  },
  priority: (props, propName) => {
    if (props[propName] && (typeof props[propName] !== 'number' || props[propName] < 0)) {
      return new Error('priority must be a positive number');
    }
    return null;
  },
  debug: (props, propName) => {
    if (props[propName] && typeof props[propName] !== 'boolean') {
      return new Error('debug must be a boolean');
    }
    return null;
  }
};

export default AdaptiveAssetLoader;