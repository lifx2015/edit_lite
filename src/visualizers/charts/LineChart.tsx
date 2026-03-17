/**
 * 简洁曲线图组件
 * 使用 SVG 绘制，支持多条曲线，悬停显示数值
 */

import React, { useState, useMemo } from 'react';
import type { VisualizerProps } from '../../core/types/directive';

interface LineChartConfig {
  title?: string;
  data: number[] | { values: number[]; label?: string; color?: string }[];
  labels?: string[];
  width?: number;
  height?: number;
  showGrid?: boolean;
  showDots?: boolean;
}

const LineChart: React.FC<VisualizerProps<LineChartConfig>> = ({ args }) => {
  const {
    title,
    data,
    labels,
    width = 400,
    height = 200,
    showGrid = true,
    showDots = true,
  } = args || {};

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // 标准化数据格式
  const series: { values: number[]; label?: string; color?: string }[] = useMemo(() => {
    if (!data) return [];
    return Array.isArray(data) && typeof data[0] === 'number'
      ? [{ values: data as number[] }]
      : data as { values: number[]; label?: string; color?: string }[];
  }, [data]);

  // 计算范围和布局
  const { minVal, range, pointCount, padding, chartWidth, chartHeight, gridLines, xLabels } = useMemo(() => {
    if (!series || series.length === 0 || series[0].values.length === 0) {
      return { minVal: 0, maxVal: 1, range: 1, pointCount: 0, padding: { top: 20, right: 20, bottom: 30, left: 40 }, chartWidth: 0, chartHeight: 0, gridLines: [], xLabels: [] };
    }

    const allValues = series.flatMap(s => s.values);
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
    const range = maxVal - minVal || 1;

    const pointCount = Math.max(...series.map(s => s.values.length));
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const gridLines = showGrid ? Array.from({ length: 5 }, (_, i) => {
      const y = padding.top + (i / 4) * chartHeight;
      const val = maxVal - (i / 4) * range;
      return { y, val };
    }) : [];

    const xLabels = labels || Array.from({ length: pointCount }, (_, i) => String(i + 1));

    return { minVal, maxVal, range, pointCount, padding, chartWidth, chartHeight, gridLines, xLabels };
  }, [series, width, height, showGrid, labels]);

  if (!series || series.length === 0 || pointCount === 0) {
    return <div style={{ padding: 16, color: 'var(--text-secondary)' }}>无数据</div>;
  }

  // 生成路径
  const generatePath = (values: number[]): string => {
    return values.map((v, i) => {
      const x = padding.left + (i / (pointCount - 1)) * chartWidth;
      const y = padding.top + chartHeight - ((v - minVal) / range) * chartHeight;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  // 获取点的坐标
  const getPointPosition = (valueIndex: number, value: number) => ({
    x: padding.left + (valueIndex / (pointCount - 1)) * chartWidth,
    y: padding.top + chartHeight - ((value - minVal) / range) * chartHeight,
  });

  // 默认颜色
  const defaultColors = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c'];

  // 处理鼠标移动
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const scaleX = width / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;

    // 找到最近的数据点
    const x = mouseX - padding.left;
    const index = Math.round((x / chartWidth) * (pointCount - 1));

    if (index >= 0 && index < pointCount) {
      setHoverIndex(index);
    } else {
      setHoverIndex(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  return (
    <div className="line-chart-container">
      {title && <div className="line-chart-title">{title}</div>}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', maxWidth: width, height: 'auto' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* 网格 */}
        {gridLines.map((line, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={line.y}
              x2={width - padding.right}
              y2={line.y}
              stroke="var(--border-color)"
              strokeDasharray="2,2"
            />
            <text
              x={padding.left - 4}
              y={line.y + 4}
              textAnchor="end"
              fontSize="10"
              fill="var(--text-secondary)"
            >
              {line.val.toFixed(1)}
            </text>
          </g>
        ))}

        {/* X 轴标签 */}
        {xLabels.slice(0, pointCount).map((label, i) => {
          const x = padding.left + (i / (pointCount - 1)) * chartWidth;
          return (
            <text
              key={i}
              x={x}
              y={height - 8}
              textAnchor="middle"
              fontSize="10"
              fill="var(--text-secondary)"
            >
              {label}
            </text>
          );
        })}

        {/* 曲线 */}
        {series.map((s, idx) => (
          <g key={idx}>
            <path
              d={generatePath(s.values)}
              fill="none"
              stroke={s.color || defaultColors[idx % defaultColors.length]}
              strokeWidth="2"
            />
            {/* 数据点 */}
            {showDots && s.values.map((v, i) => {
              const pos = getPointPosition(i, v);
              const isHovered = hoverIndex === i;
              return (
                <circle
                  key={i}
                  cx={pos.x}
                  cy={pos.y}
                  r={isHovered ? 5 : 3}
                  fill={s.color || defaultColors[idx % defaultColors.length]}
                  style={{ transition: 'r 0.15s' }}
                />
              );
            })}
          </g>
        ))}

        {/* 悬停垂直线 */}
        {hoverIndex !== null && (
          <line
            x1={padding.left + (hoverIndex / (pointCount - 1)) * chartWidth}
            y1={padding.top}
            x2={padding.left + (hoverIndex / (pointCount - 1)) * chartWidth}
            y2={padding.top + chartHeight}
            stroke="var(--border-color-strong)"
            strokeDasharray="4,2"
          />
        )}
      </svg>

      {/* 悬停数值提示 */}
      {hoverIndex !== null && (
        <div
          className="chart-tooltip"
          style={{
            position: 'relative',
            marginTop: 4,
          }}
        >
          <span className="tooltip-label">{xLabels[hoverIndex] || `点 ${hoverIndex + 1}`}</span>
          {series.map((s, idx) => (
            <span key={idx} className="tooltip-value">
              <span
                className="tooltip-dot"
                style={{ backgroundColor: s.color || defaultColors[idx % defaultColors.length] }}
              />
              {s.label ? `${s.label}: ` : ''}{s.values[hoverIndex]}
            </span>
          ))}
        </div>
      )}

      {/* 图例 */}
      {series.length > 1 && hoverIndex === null && (
        <div className="line-chart-legend">
          {series.map((s, idx) => (
            <span key={idx} className="legend-item">
              <span
                className="legend-color"
                style={{ backgroundColor: s.color || defaultColors[idx % defaultColors.length] }}
              />
              {s.label || `系列 ${idx + 1}`}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default LineChart;