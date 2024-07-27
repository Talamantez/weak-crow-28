import { JSX } from "preact";
interface ButtonProps {
  text: string;
  icon?: ({
    size,
    color,
    stroke,
    ...props
  }: {
    size?: number;
    color?: string;
    stroke?: number;
    [key: string]: any;
  }) => JSX.Element;
  onClick: () => void;
  styles?: string;
  disabled?: boolean;
}

export default function Button(
  { text, icon: Icon, onClick, styles, disabled = false }: ButtonProps,
): JSX.Element {
  return (
    <button class={styles} onClick={onClick} disabled={disabled}>
      {Icon &&
        <Icon size={20} class="ml-2" />}
      <span>{text}</span>
    </button>
  );
}
