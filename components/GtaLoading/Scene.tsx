import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { drawScene, prepareArtwork } from "./renderer";
import styles from "./loading.module.css";

export interface SceneHandle {
  prepare(): Promise<void>;
  draw(frame: number, reduced: boolean): void;
}

/** One drawing surface prevents animated DOM layers from slicing SVG sprites. */
const Scene = memo(
  forwardRef<SceneHandle>(function Scene(_, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const last = useRef({ frame: 0, reduced: false });
    const draw = useCallback((frame: number, reduced: boolean) => {
      last.current = { frame, reduced };
      if (canvasRef.current) drawScene(canvasRef.current, frame, reduced);
    }, []);
    useImperativeHandle(
      ref,
      () => ({
        async prepare() {
          await prepareArtwork();
          draw(last.current.frame, last.current.reduced);
        },
        draw,
      }),
      [draw],
    );
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const observer = new ResizeObserver(() =>
        draw(last.current.frame, last.current.reduced),
      );
      observer.observe(canvas);
      draw(last.current.frame, last.current.reduced);
      return () => observer.disconnect();
    }, [draw]);
    return (
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        data-artwork-canvas
        aria-hidden="true"
      />
    );
  }),
);
export default Scene;
