import React, { useState } from 'react';
import Toast from './Toast';
import { copyToClipboard } from '../utils/forumExport';
import './EmbedCodeGenerator.css';

/**
 * Embed Code Generator Component
 * Generates iframe embed code for forums and blogs
 */
const EmbedCodeGenerator = ({ currentTire, newTire, gearRatio }) => {
  const [showGenerator, setShowGenerator] = useState(false);
  const [width, setWidth] = useState('100%');
  const [height, setHeight] = useState('400');
  const [autoCalculate, setAutoCalculate] = useState(true);
  const [toast, setToast] = useState(null);

  // Use current origin for preview (works in dev and production)
  const previewBaseUrl = `${window.location.origin}/embed.html`;

  // Always use production URL for generated embed code
  const productionBaseUrl = 'https://overlandn.com/tires/embed.html';

  const generateEmbedUrl = (useProduction = true) => {
    const params = new URLSearchParams();
    if (currentTire) params.set('current', currentTire);
    if (newTire) params.set('new', newTire);
    if (gearRatio) params.set('gear', gearRatio);
    if (autoCalculate) params.set('auto', 'true');

    const baseUrl = useProduction ? productionBaseUrl : previewBaseUrl;
    return `${baseUrl}?${params.toString()}`;
  };

  const generateEmbedCode = () => {
    const url = generateEmbedUrl();
    const widthAttr = width.includes('%') ? width : `${width}px`;
    const heightAttr = `${height}px`;

    return `<iframe src="${url}" width="${widthAttr}" height="${heightAttr}" frameborder="0" style="border: 1px solid #333; border-radius: 8px;" title="Tire Engineering Tool"></iframe>`;
  };

  const handleCopyEmbedCode = async () => {
    const embedCode = generateEmbedCode();
    const success = await copyToClipboard(embedCode);

    if (success) {
      setToast({ message: 'Embed code copied to clipboard!', type: 'success' });
    } else {
      setToast({ message: 'Failed to copy. Please try again.', type: 'error' });
    }
  };

  const handleCopyUrl = async () => {
    const url = generateEmbedUrl();
    const success = await copyToClipboard(url);

    if (success) {
      setToast({ message: 'Embed URL copied to clipboard!', type: 'success' });
    } else {
      setToast({ message: 'Failed to copy. Please try again.', type: 'error' });
    }
  };

  if (!currentTire || !newTire) {
    return null;
  }

  return (
    <div className="embed-generator-container">
      <button
        className="embed-toggle-btn"
        onClick={() => setShowGenerator(!showGenerator)}
      >
        {showGenerator ? '✕' : '⚡'} Embed Tire Tool
      </button>

      {showGenerator && (
        <div className="embed-generator">
          <div className="embed-header">
            <h3>Embed This Comparison</h3>
            <p>Share this tire calculator on your website or forum</p>
          </div>

          <div className="embed-config">
            <div className="embed-options">
              <div className="embed-option-row">
                <label className="embed-label">
                  Width:
                  <input
                    type="text"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="embed-input"
                    placeholder="100% or 600"
                  />
                </label>
                <label className="embed-label">
                  Height:
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="embed-input"
                    placeholder="400"
                  />
                  <span className="embed-unit">px</span>
                </label>
              </div>

              <label className="embed-checkbox">
                <input
                  type="checkbox"
                  checked={autoCalculate}
                  onChange={(e) => setAutoCalculate(e.target.checked)}
                />
                <span>Auto-calculate on load</span>
              </label>
            </div>

            <div className="embed-preview">
              <div className="embed-preview-label">Preview:</div>
              <div className="embed-preview-box">
                <iframe
                  src={generateEmbedUrl(false)}
                  width="100%"
                  height="300"
                  frameBorder="0"
                  style={{ border: '1px solid #333', borderRadius: '8px' }}
                  title="Tire Engineering Tool Preview"
                ></iframe>
              </div>
            </div>

            <div className="embed-code-section">
              <div className="embed-code-label">Embed Code:</div>
              <textarea
                className="embed-code-textarea"
                value={generateEmbedCode()}
                readOnly
                rows={4}
              />

              <div className="embed-actions">
                <button onClick={handleCopyEmbedCode} className="btn btn-primary">
                  📋 Copy Embed Code
                </button>
                <button onClick={handleCopyUrl} className="btn btn-secondary">
                  🔗 Copy URL Only
                </button>
              </div>
            </div>

            <div className="embed-instructions">
              <h4>How to Use:</h4>
              <ol>
                <li>Copy the embed code above</li>
                <li>Paste it into your HTML content</li>
                <li>The calculator will display with your comparison pre-filled</li>
              </ol>
              <p className="embed-note">
                <strong>Note:</strong> Most modern forums support iframes. For BBCode forums, use the direct URL in a [url] tag.
              </p>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default EmbedCodeGenerator;
