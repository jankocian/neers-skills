"use client";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

/** Composes the real Dialog, so the guide can't drift from the component. */
function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger
        render={<Button variant="secondary">open dialog</Button>}
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this page?</DialogTitle>
          <DialogDescription>
            This cannot be undone. Focus is trapped, ESC closes, the page behind
            stops scrolling — all from the primitive.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost">cancel</Button>} />
          <DialogClose render={<Button variant="destructive">delete</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { DialogDemo };
