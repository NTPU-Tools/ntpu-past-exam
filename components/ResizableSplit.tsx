"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

interface ResizableSplitProps {
  direction?: "horizontal" | "vertical";
  defaultRatio?: number;
  minRatio?: number;
  maxRatio?: number;
  className?: string;
  onRatioChange?: (ratio: number) => void;
  children: [React.ReactNode, React.ReactNode];
}

export function ResizableSplit({
  direction = "horizontal",
  defaultRatio = 0.5,
  minRatio = 0.15,
  maxRatio = 0.85,
  className,
  onRatioChange,
  children,
}: ResizableSplitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(() => Math.max(minRatio, Math.min(maxRatio, defaultRatio)));  const isDraggingRef = useRef(false);
  const directionRef = useRef(direction);  const minRatioRef = useRef(minRatio);  const maxRatioRef = useRef(maxRatio);  const onRatioChangeRef = useRef(onRatioChange);
  useEffect(() => {    directionRef.current = direction;
    minRatioRef.current = minRatio;
    maxRatioRef.current = maxRatio;
    onRatioChangeRef.current = onRatioChange;
  });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = directionRef.current === "horizontal" ? "col-resize" : "row-resize";    document.body.style.userSelect = "none";
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = directionRef.current === "horizontal" ? "col-resize" : "row-resize";    document.body.style.userSelect = "none";
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return;    isDraggingRef.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;      if (e.buttons === 0) {        handleMouseUp();
        return;
      }
      const rect = containerRef.current.getBoundingClientRect();
      let newRatio: number;
      if (directionRef.current === "horizontal") {        newRatio = (e.clientX - rect.left) / rect.width;
      } else {
        newRatio = (e.clientY - rect.top) / rect.height;
      }
      newRatio = Math.max(minRatioRef.current, Math.min(maxRatioRef.current, newRatio));      setRatio(newRatio);
      onRatioChangeRef.current?.(newRatio);    },
    [handleMouseUp],  );

  const handleTouchMove = useCallback(    (e: TouchEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;      e.preventDefault();      const rect = containerRef.current.getBoundingClientRect();
      let newRatio: number;
      if (directionRef.current === "horizontal") {        newRatio = (e.touches[0].clientX - rect.left) / rect.width;
      } else {
        newRatio = (e.touches[0].clientY - rect.top) / rect.height;
      }
      newRatio = Math.max(minRatioRef.current, Math.min(maxRatioRef.current, newRatio));      setRatio(newRatio);
      onRatioChangeRef.current?.(newRatio);    },
    [],  );

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });    document.addEventListener("touchend", handleMouseUp);    document.addEventListener("touchcancel", handleMouseUp);    return () => {
      if (isDraggingRef.current) {        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);      document.removeEventListener("touchend", handleMouseUp);      document.removeEventListener("touchcancel", handleMouseUp);    };
  }, []);
  const isHorizontal = direction === "horizontal";

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {    const step = 0.02;
    let newRatio: number | null = null;    if (
      (isHorizontal && (e.key === "ArrowLeft" || e.key === "ArrowRight")) ||
      (!isHorizontal && (e.key === "ArrowUp" || e.key === "ArrowDown"))
    ) {
      e.preventDefault();
      const delta =
        e.key === "ArrowLeft" || e.key === "ArrowUp" ? -step : step;
      newRatio = Math.max(minRatio, Math.min(maxRatio, ratio + delta));
    } else if (e.key === "Home") {      e.preventDefault();
      newRatio = minRatio;
    } else if (e.key === "End") {      e.preventDefault();
      newRatio = maxRatio;
    }
    if (newRatio !== null) {      setRatio(newRatio);
      onRatioChange?.(newRatio);
    }
  }, [isHorizontal, minRatio, maxRatio, ratio, onRatioChange]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex",
        isHorizontal ? "flex-row" : "flex-col",
        className,
      )}
    >
      <div
        className="min-w-0 min-h-0 overflow-auto flex flex-col"
        style={{ flex: `${ratio} 1 0%` }}
      >
        {children[0]}
      </div>
      <div
        className={cn(
          "relative shrink-0 transition-colors",
          isHorizontal ? "w-6 cursor-col-resize" : "h-6 cursor-row-resize",        )}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}        tabIndex={0}        role="separator"        aria-orientation={direction}        aria-valuenow={Math.round(ratio * 100)}        aria-valuemin={Math.round(minRatio * 100)}        aria-valuemax={Math.round(maxRatio * 100)}        aria-label="Resize panels"        onKeyDown={handleKeyDown}      >
        <div
          className={cn(
            "absolute bg-border hover:bg-primary/30",            isHorizontal
              ? "top-0 left-1/2 -translate-x-1/2 w-px h-full"              : "left-0 top-1/2 -translate-y-1/2 h-px w-full",          )}
        />
      </div>
      <div
        className="min-w-0 min-h-0 overflow-auto flex flex-col"
        style={{ flex: `${1 - ratio} 1 0%` }}
        data-main-scroll=""
      >
        {children[1]}
      </div>
    </div>
  );
}
