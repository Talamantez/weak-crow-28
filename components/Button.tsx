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
}

export default function Button({ text, icon:Icon, onClick, styles }: ButtonProps): JSX.Element {
  return (
    <button class={styles} onClick={onClick}>
      <span>{text}</span>
      {Icon &&
      <Icon size={20} className="ml-2" />
      }
    </button>
  );
}