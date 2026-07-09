"use client";

import { useId, useState } from "react";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Text } from "~/components/ui/text";
import { Textarea } from "~/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";

const ENGAGEMENTS = ["brand", "product", "advisory"];
const LABEL_CLASS = "type-tagline lowercase text-muted-foreground";

/**
 * The forms specimen. Composes the REAL shared shadcn components — <Input>,
 * <Textarea>, <Label>, and <ToggleGroup> (multi-select) — so the style guide
 * shows literally what the site uses.
 */
function FormFields() {
  const id = useId();
  const [selected, setSelected] = useState<string[]>(["brand"]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-name`} className={LABEL_CLASS}>
          your name
        </Label>
        <Input id={`${id}-name`} placeholder="ada lovelace" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-building`} className={LABEL_CLASS}>
          what are you building?
        </Label>
        <Textarea id={`${id}-building`} placeholder="a paragraph is plenty." />
      </div>
      <div className="flex flex-col gap-2">
        <Text
          className="type-tagline text-muted-foreground lowercase"
          as="span"
        >
          engagement{" "}
          <span className="text-muted-foreground/55">· pick any</span>
        </Text>
        <ToggleGroup
          multiple
          value={selected}
          onValueChange={(v) => setSelected([...v])}
          variant="chip"
          size="chip"
          className="w-full flex-wrap"
        >
          {ENGAGEMENTS.map((v) => (
            <ToggleGroupItem key={v} value={v}>
              {v}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}

export { FormFields };
