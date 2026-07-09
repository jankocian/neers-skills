"use client";

import { useReducedMotion } from "motion/react";
import YARL, {
  type SlideImage,
  type SlideVideo,
} from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

type LightboxProps = {
  slides: (SlideImage | SlideVideo)[];
  /** Index of the slide to open on. `-1` means closed. */
  index: number;
  onClose: () => void;
};

/**
 * Fullscreen photo/video viewer. Focus trap, ESC, scroll lock and swipe come from
 * the library; we fix the parts a design system should own.
 *
 * A dialog is not a lightbox: use `~/components/ui/dialog` for anything with
 * content and actions, this for viewing media.
 */
function Lightbox({ slides, index, onClose }: LightboxProps) {
  const reduce = useReducedMotion();

  return (
    <YARL
      open={index >= 0}
      index={Math.max(index, 0)}
      close={onClose}
      slides={slides}
      plugins={[Zoom, Video]}
      // Continuous, gesture-driven motion the MotionConfig can't see, so this is
      // one of the few legitimate uses of useReducedMotion.
      animation={reduce ? { fade: 0, swipe: 0 } : undefined}
      controller={{ closeOnBackdropClick: true }}
      styles={{
        container: {
          backgroundColor:
            "color-mix(in oklab, var(--color-ink) 92%, transparent)",
        },
      }}
    />
  );
}

export type { LightboxProps };
export { Lightbox };
