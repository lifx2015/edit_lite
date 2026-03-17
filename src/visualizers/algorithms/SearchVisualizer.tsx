/**
 * 查找算法可视化组件
 * 支持: 线性查找、二分查找、插值查找
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { VisualizerProps } from '../../core/types/directive';

interface SearchConfig {
  array?: number[];
  target?: number;
  algorithm?: 'linear' | 'binary' | 'interpolation';
  speed?: number;
}

interface SearchStep {
  array: number[];
  checking: number;
  found: number | null;
  range?: [number, number];
  description: string;
}

type SearchAlgorithm = (arr: number[], target: number) => Generator<SearchStep>;

// ============================================
// 查找算法实现
// ============================================

function* linearSearch(arr: number[], target: number): Generator<SearchStep> {
  for (let i = 0; i < arr.length; i++) {
    yield { array: arr, checking: i, found: null, description: `检查索引 ${i}: 值 ${arr[i]}` };
    if (arr[i] === target) {
      yield { array: arr, checking: i, found: i, description: `找到目标 ${target} 在索引 ${i}` };
      return;
    }
  }
  yield { array: arr, checking: -1, found: -1, description: `未找到目标 ${target}` };
}

function* binarySearch(arr: number[], target: number): Generator<SearchStep> {
  let left = 0;
  let right = arr.length - 1;

  yield { array: arr, checking: -1, found: null, range: [left, right], description: `初始范围 [${left}, ${right}]` };

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    yield { array: arr, checking: mid, found: null, range: [left, right], description: `检查中间索引 ${mid}: 值 ${arr[mid]}` };

    if (arr[mid] === target) {
      yield { array: arr, checking: mid, found: mid, description: `找到目标 ${target} 在索引 ${mid}` };
      return;
    } else if (arr[mid] < target) {
      left = mid + 1;
      yield { array: arr, checking: mid, found: null, range: [left, right], description: `${arr[mid]} < ${target}, 搜索右半部分 [${left}, ${right}]` };
    } else {
      right = mid - 1;
      yield { array: arr, checking: mid, found: null, range: [left, right], description: `${arr[mid]} > ${target}, 搜索左半部分 [${left}, ${right}]` };
    }
  }
  yield { array: arr, checking: -1, found: -1, description: `未找到目标 ${target}` };
}

function* interpolationSearch(arr: number[], target: number): Generator<SearchStep> {
  let left = 0;
  let right = arr.length - 1;

  yield { array: arr, checking: -1, found: null, range: [left, right], description: `初始范围 [${left}, ${right}]` };

  while (left <= right && target >= arr[left] && target <= arr[right]) {
    if (arr[left] === arr[right]) {
      if (arr[left] === target) {
        yield { array: arr, checking: left, found: left, description: `找到目标 ${target} 在索引 ${left}` };
        return;
      }
      break;
    }

    // 插值公式
    const pos = left + Math.floor(((target - arr[left]) * (right - left)) / (arr[right] - arr[left]));

    yield { array: arr, checking: pos, found: null, range: [left, right], description: `插值位置 ${pos}: 值 ${arr[pos]}` };

    if (arr[pos] === target) {
      yield { array: arr, checking: pos, found: pos, description: `找到目标 ${target} 在索引 ${pos}` };
      return;
    } else if (arr[pos] < target) {
      left = pos + 1;
      yield { array: arr, checking: pos, found: null, range: [left, right], description: `${arr[pos]} < ${target}, 搜索右侧 [${left}, ${right}]` };
    } else {
      right = pos - 1;
      yield { array: arr, checking: pos, found: null, range: [left, right], description: `${arr[pos]} > ${target}, 搜索左侧 [${left}, ${right}]` };
    }
  }
  yield { array: arr, checking: -1, found: -1, description: `未找到目标 ${target}` };
}

// ============================================
// 主组件
// ============================================

const SearchVisualizer: React.FC<VisualizerProps<SearchConfig>> = ({ args, onStateChange }) => {
  const {
    array = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25],
    target = 13,
    algorithm = 'binary',
    speed = 500,
  } = args || {};

  const [currentArray, setCurrentArray] = useState<number[]>(array);
  const [checking, setChecking] = useState<number>(-1);
  const [found, setFound] = useState<number | null>(null);
  const [range, setRange] = useState<[number, number] | null>(null);
  const [description, setDescription] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const stepsRef = useRef<SearchStep[]>([]);
  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getAlgorithm = useCallback((name: string): SearchAlgorithm => {
    switch (name) {
      case 'linear': return linearSearch;
      case 'binary': return binarySearch;
      case 'interpolation': return interpolationSearch;
      default: return binarySearch;
    }
  }, []);

  useEffect(() => {
    const searchFn = getAlgorithm(algorithm);
    const gen = searchFn(array, target);

    const steps: SearchStep[] = [];
    let result = gen.next();
    while (!result.done) {
      steps.push(result.value);
      result = gen.next();
    }
    stepsRef.current = steps;

    setCurrentArray(array);
    setChecking(-1);
    setFound(null);
    setRange(null);
    setDescription('');
    setCurrentStep(0);
    setIsPlaying(false);

    onStateChange?.({ status: 'idle', totalSteps: steps.length });
  }, [array, target, algorithm, getAlgorithm, onStateChange]);

  const play = useCallback(() => {
    if (currentStep >= stepsRef.current.length) {
      setCurrentStep(0);
      setChecking(-1);
      setFound(null);
      setRange(null);
      setCurrentArray(array);
    }
    setIsPlaying(true);
  }, [currentStep, array]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (animationRef.current) clearTimeout(animationRef.current);
  }, []);

  const step = useCallback(() => {
    if (currentStep < stepsRef.current.length) {
      const stepData = stepsRef.current[currentStep];
      setCurrentArray(stepData.array);
      setChecking(stepData.checking);
      setFound(stepData.found);
      setRange(stepData.range || null);
      setDescription(stepData.description);
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
    setCurrentArray(array);
    setChecking(-1);
    setFound(null);
    setRange(null);
    setDescription('');
  }, [array]);

  useEffect(() => {
    if (isPlaying && currentStep < stepsRef.current.length) {
      animationRef.current = setTimeout(() => {
        step();
        if (currentStep + 1 >= stepsRef.current.length) {
          setIsPlaying(false);
        }
      }, speed);
    }
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [isPlaying, currentStep, speed, step]);

  const maxValue = Math.max(...currentArray, 1);

  const getBarStatus = (idx: number) => {
    if (found === idx) return 'found';
    if (checking === idx) return 'checking';
    if (range && idx >= range[0] && idx <= range[1]) return 'in-range';
    return '';
  };

  return (
    <div className="search-visualizer">
      <div className="visualizer-controls">
        <button onClick={isPlaying ? pause : play} className="control-btn">
          {isPlaying ? '⏸ 暂停' : '▶ 播放'}
        </button>
        <button onClick={step} disabled={isPlaying} className="control-btn">
          ⏭ 单步
        </button>
        <button onClick={reset} className="control-btn">
          ↺ 重置
        </button>
        <span className="step-info">目标: {target}</span>
      </div>

      <div className="visualizer-container search-container">
        {currentArray.map((value, idx) => {
          const height = (value / maxValue) * 100;
          const status = getBarStatus(idx);
          return (
            <div key={idx} className={`bar ${status}`} style={{ height: `${height}%` }}>
              <span className="bar-value">{value}</span>
            </div>
          );
        })}
      </div>

      <div className="visualizer-description">{description}</div>

      <div className="visualizer-info">
        <span>算法: {algorithm}</span>
        <span>查找: {target}</span>
      </div>
    </div>
  );
};

export default SearchVisualizer;