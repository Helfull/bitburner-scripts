import { doc } from '@lib/bbElements';
import { useEffect, useState } from 'react';

export function useWindow(appNodeId: string): { width: number; height: number; collapsed: boolean } {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const collapseObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes') {
          if (mutation.attributeName === 'title') {
            const collapseButton = mutation.target as HTMLElement;
            if (collapseButton.title === 'Collapse') {
              setCollapsed(false);
            } else {
              setCollapsed(true);
            }
          }
        }
      }
    });

    const resizeObserver = new ResizeObserver((event) => {
      setWidth(event[0].contentBoxSize[0].inlineSize);
      setHeight(event[0].contentBoxSize[0].blockSize);
    });

    const systemStatusEl = doc.querySelector<HTMLElement>(appNodeId);
    const parentWindow = systemStatusEl.closest<HTMLElement>('div[tabindex="-1"]');
    const resizeContainer = systemStatusEl.closest<HTMLElement>('.react-resizable');
    const collapseButton = resizeContainer.querySelector<HTMLElement>(
      '.MuiButtonBase-root.MuiIconButton-root.MuiIconButton-sizeMedium.css-c9uei6-titleButton[title="Collapse"]',
    );

    collapseObserver.observe(collapseButton, { attributeFilter: ['title'], attributes: true });
    resizeObserver.observe(parentWindow);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const systemStatusEl = doc.querySelector<HTMLElement>(appNodeId);
    const parentWindow = systemStatusEl.closest<HTMLElement>('div[tabindex="-1"]');

    if (!collapsed) {
      parentWindow.style.display = 'block';
      systemStatusEl.style.height = `calc(${height}px - 16px)`;
      systemStatusEl.style.maxHeight = `calc(${height}px - 16px)`;
    } else {
      parentWindow.style.display = 'none';
    }
  }, [width, height, collapsed]);

  return { width, height, collapsed };
}
