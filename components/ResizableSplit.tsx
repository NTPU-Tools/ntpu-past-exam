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
  const [ratio, setRatio] = useState(() => Math.max(minRatio, Math.min(maxRatio, defaultRatio))); // [R1-3]
  const isDraggingRef = useRef(false); // [R2-8]

  const directionRef = useRef(direction); // [R2-3]
  const minRatioRef = useRef(minRatio); // [R2-3]
  const maxRatioRef = useRef(maxRatio); // [R2-3]
  const onRatioChangeRef = useRef(onRatioChange); // [R2-3]

  useEffect(() => { // [R2-3]
    directionRef.current = direction;
    minRatioRef.current = minRatio;
    maxRatioRef.current = maxRatio;
    onRatioChangeRef.current = onRatioChange;
  });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = directionRef.current === "horizontal" ? "col-resize" : "row-resize"; // [R2-3]
    document.body.style.userSelect = "none";
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => { // [R1-5]
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = directionRef.current === "horizontal" ? "col-resize" : "row-resize"; // [R2-3]
    document.body.style.userSelect = "none";
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return; // [R2-8]
    isDraggingRef.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return; // [R2-8]
      if (e.buttons === 0) { // [R2-1]
        handleMouseUp();
        return;
      }
      const rect = containerRef.current.getBoundingClientRect();
      let newRatio: number;
      if (directionRef.current === "horizontal") { // [R2-3]
        newRatio = (e.clientX - rect.left) / rect.width;
      } else {
        newRatio = (e.clientY - rect.top) / rect.height;
      }
      newRatio = Math.max(minRatioRef.current, Math.min(maxRatioRef.current, newRatio)); // [R2-3]
      setRatio(newRatio);
      onRatioChangeRef.current?.(newRatio); // [R2-3]
    },
    [handleMouseUp], // [R2-3]
  );

  const handleTouchMove = useCallback( // [R1-5]
    (e: TouchEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return; // [R2-8]
      e.preventDefault(); // [R2-4]
      const rect = containerRef.current.getBoundingClientRect();
      let newRatio: number;
      if (directionRef.current === "horizontal") { // [R2-3]
        newRatio = (e.touches[0].clientX - rect.left) / rect.width;
      } else {
        newRatio = (e.touches[0].clientY - rect.top) / rect.height;
      }
      newRatio = Math.max(minRatioRef.current, Math.min(maxRatioRef.current, newRatio)); // [R2-3]
      setRatio(newRatio);
      onRatioChangeRef.current?.(newRatio); // [R2-3]
    },
    [], // [R2-3]
  );

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false }); // [R1-5] [R2-4]
    document.addEventListener("touchend", handleMouseUp); // [R1-5]
    document.addEventListener("touchcancel", handleMouseUp); // [R2-2]
    return () => {
      if (isDraggingRef.current) { // [R2-8]
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove); // [R1-5] [R2-4]
      document.removeEventListener("touchend", handleMouseUp); // [R1-5]
      document.removeEventListener("touchcancel", handleMouseUp); // [R2-2]
    };
  }, []); // [R2-3]

  const isHorizontal = direction === "horizontal";

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => { // [R1-4]
    const step = 0.02;
    let newRatio: number | null = null; // [R2-6]
    if (
      (isHorizontal && (e.key === "ArrowLeft" || e.key === "ArrowRight")) ||
      (!isHorizontal && (e.key === "ArrowUp" || e.key === "ArrowDown"))
    ) {
      e.preventDefault();
      const delta =
        e.key === "ArrowLeft" || e.key === "ArrowUp" ? -step : step;
      newRatio = Math.max(minRatio, Math.min(maxRatio, ratio + delta));
    } else if (e.key === "Home") { // [R2-6]
      e.preventDefault();
      newRatio = minRatio;
    } else if (e.key === "End") { // [R2-6]
      e.preventDefault();
      newRatio = maxRatio;
    }
    if (newRatio !== null) { // [R2-6]
      setRatio(newRatio);
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
          isHorizontal ? "w-6 cursor-col-resize" : "h-6 cursor-row-resize", // [R2-7]
        )}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart} // [R1-5]
        tabIndex={0} // [R1-4]
        role="separator" // [R1-4]
        aria-orientation={direction} // [R1-4]
        aria-valuenow={Math.round(ratio * 100)} // [R1-4]
        aria-valuemin={Math.round(minRatio * 100)} // [R2-5]
        aria-valuemax={Math.round(maxRatio * 100)} // [R2-5]
        aria-label="Resize panels" // [R2-5]
        onKeyDown={handleKeyDown} // [R1-4]
      >
        <div
          className={cn(
            "absolute bg-border hover:bg-primary/30", // [R1-6] [R2-7]
            isHorizontal
              ? "top-0 left-1/2 -translate-x-1/2 w-px h-full" // [R2-7]
              : "left-0 top-1/2 -translate-y-1/2 h-px w-full", // [R2-7]
          )}
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
