import type { HTMLAttributes, ReactNode } from "react";

export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** ○ / あり（薄い青＋濃いブランド青） */
  variant: "positive" | "negative";
  /** symbol: ○・×　word: あり・なし */
  display?: "symbol" | "word";
  children?: ReactNode;
};

/**
 * アイボリー背景上で浮かないよう、パステル調のトーンに寄せた配色。
 */
const variantClass: Record<"positive" | "negative", string> = {
  positive:
    "border border-blue-100/90 bg-blue-50 text-brand-accent-deep",
  negative:
    "border border-gray-200/80 bg-gray-100 text-gray-600",
};

function defaultContent(
  variant: BadgeProps["variant"],
  display: NonNullable<BadgeProps["display"]>,
): ReactNode {
  if (display === "word") {
    return variant === "positive" ? "あり" : "なし";
  }
  return variant === "positive" ? "○" : "×";
}

/**
 * カプセル型の汎用バッジ。ネタ帳の保存状態などに利用。
 */
export function Badge({
  variant,
  display = "symbol",
  children,
  className = "",
  "aria-label": ariaLabel,
  ...props
}: BadgeProps) {
  const content = children ?? defaultContent(variant, display);
  const implicitAriaLabel =
    display === "symbol" && ariaLabel === undefined
      ? variant === "positive"
        ? "あり"
        : "なし"
      : undefined;

  return (
    <span
      {...props}
      aria-label={ariaLabel ?? implicitAriaLabel}
      className={`inline-flex min-h-[1.5rem] shrink-0 items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium leading-none tracking-tight ${variantClass[variant]} ${className}`}
    >
      {content}
    </span>
  );
}
