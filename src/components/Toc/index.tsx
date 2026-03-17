/**
 * 目录组件
 * 从 Markdown 内容中提取标题并显示可点击的目录
 */

import React, { useMemo, useCallback, useEffect, useState } from 'react';

export interface TocItem {
  id: string;
  level: number;
  text: string;
}

export interface TocProps {
  content: string;
  getPreviewContainer: () => HTMLDivElement | null;
}

/**
 * 从 Markdown 内容中提取标题
 */
function extractHeadings(content: string): TocItem[] {
  const headings: TocItem[] = [];
  const lines = content.split('\n');

  lines.forEach((line) => {
    // 匹配 ATX 风格标题 (# 开头)
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      // 生成唯一 ID（与 PreviewEngine 生成的 ID 保持一致）
      const id = generateHeadingId(text);
      headings.push({ id, level, text });
    }
  });

  return headings;
}

/**
 * 生成标题 ID
 * 与 PreviewEngine 中的 ID 生成方式保持一致
 */
let headingIdCounter = 0;

function generateHeadingId(text: string): string {
  const sanitized = text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-');

  return sanitized || `heading-${headingIdCounter++}`;
}

const Toc: React.FC<TocProps> = ({ content, getPreviewContainer }) => {
  const headings = useMemo(() => extractHeadings(content), [content]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // 监听滚动，高亮当前可见的标题
  useEffect(() => {
    if (!isExpanded) return;

    const container = getPreviewContainer();
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        // 找到最上面的可见标题
        let topEntry: IntersectionObserverEntry | undefined;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!topEntry || entry.boundingClientRect.top < topEntry.boundingClientRect.top) {
              topEntry = entry;
            }
          }
        });

        if (topEntry) {
          const id = (topEntry.target as HTMLElement).id;
          setActiveId(id);
        }
      },
      {
        root: container,
        rootMargin: '-20px 0px -80% 0px',
        threshold: 0,
      }
    );

    // 观察所有标题元素
    const headingElements = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [getPreviewContainer, content, isExpanded]);

  // 点击目录项滚动到对应位置
  const handleTocClick = useCallback((id: string) => {
    const container = getPreviewContainer();
    if (!container) return;

    const element = container.querySelector(`#${CSS.escape(id)}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  }, [getPreviewContainer]);

  // 如果没有标题，不显示目录
  if (headings.length === 0) {
    return null;
  }

  // 计算最小层级，用于缩进
  const minLevel = Math.min(...headings.map(h => h.level));

  // 折叠状态
  if (!isExpanded) {
    return (
      <button
        className="toc-collapsed"
        onClick={() => setIsExpanded(true)}
        title="展开目录"
        aria-label="展开目录"
      >
        <span className="toc-collapsed-icon">☰</span>
        <span className="toc-collapsed-count">{headings.length}</span>
      </button>
    );
  }

  // 展开状态
  return (
    <div className="toc-container">
      <div className="toc-header">
        <span className="toc-title">目录</span>
        <button
          className="toc-collapse-btn"
          onClick={() => setIsExpanded(false)}
          title="收起目录"
          aria-label="收起目录"
        >
          ✕
        </button>
      </div>
      <nav className="toc-nav">
        <ul className="toc-list">
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={`toc-item toc-level-${heading.level} ${activeId === heading.id ? 'active' : ''}`}
              style={{ paddingLeft: `${(heading.level - minLevel) * 12 + 8}px` }}
            >
              <button
                className="toc-link"
                onClick={() => handleTocClick(heading.id)}
                title={heading.text}
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Toc;